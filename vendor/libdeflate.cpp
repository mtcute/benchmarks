#include <stdlib.h>
#include <assert.h>
#include <node_api.h>
#include "libdeflate.h"

#ifndef NODE_GYP_MODULE_NAME
#define NODE_GYP_MODULE_NAME libdeflate
#endif

#define CALL_ASSERT_OK(code) \
    status = code; \
    assert(status == napi_ok);

#define THROW_WRONG_ARGS \
    napi_throw_type_error(env, NULL, "Wrong arguments"); \
    return NULL;

#define READ_ARGS(n) \
    size_t argc = n; \
    napi_value args[n]; \
    status = napi_get_cb_info(env, info, &argc, args, NULL, NULL); \
    assert(status == napi_ok);


#define CHECK_ARG_COUNT(cnt) \
    if (argc < cnt) { \
        THROW_WRONG_ARGS \
    }

#define CHECK_ARG_BUFFER(idx) \
    CALL_ASSERT_OK(napi_is_buffer(env, args[idx], &is_buf)) \
    if (!is_buf) { \
        THROW_WRONG_ARGS \
    }

#define READ_BUF_ARG(idx, out_buf, out_size) \
    CALL_ASSERT_OK(napi_get_buffer_info(env, args[idx], (void**) out_buf, out_size))

static struct libdeflate_compressor* compressor;
static struct libdeflate_decompressor* decompressor;

static napi_value node_libdeflate_zlib_compress(napi_env env, napi_callback_info info) {
    napi_status status;

    uint8_t* input_buf;
    size_t input_size;
    uint8_t* output_buf;
    uint32_t output_size;

    READ_ARGS(2)
    READ_BUF_ARG(0, &input_buf, &input_size)
    CALL_ASSERT_OK(napi_get_value_uint32(env, args[1], &output_size))

    napi_value ret;
    CALL_ASSERT_OK(napi_create_arraybuffer(env, output_size, (void**) &output_buf, &ret));

    auto written = libdeflate_zlib_compress(compressor, input_buf, input_size, output_buf, output_size);

    if (written == 0) {
        napi_throw_type_error(env, NULL, "Compression failed");
        return NULL;
    }

    CALL_ASSERT_OK(napi_create_typedarray(env, napi_uint8_array, written, ret, 0, &ret))
    return ret;
}

static napi_value node_libdeflate_zlib_decompress(napi_env env, napi_callback_info info) {
    napi_status status;

    uint8_t* input_buf;
    size_t input_size;
    uint8_t* output_buf;
    size_t output_size;

    READ_ARGS(2)
    READ_BUF_ARG(0, &input_buf, &input_size)
    READ_BUF_ARG(1, &output_buf, &output_size)

    size_t written;
    auto ret = libdeflate_zlib_decompress(decompressor, input_buf, input_size, output_buf, output_size, &written);

    if (ret != 0) {
        if (ret == 1) napi_throw_type_error(env, NULL, "Decompression failed: LIBDEFLATE_BAD_DATA");
        if (ret == 2) napi_throw_type_error(env, NULL, "Decompression failed: LIBDEFLATE_SHORT_OUTPUT");
        if (ret == 3) napi_throw_type_error(env, NULL, "Decompression failed: LIBDEFLATE_INSUFFICIENT_SPACE");
        return NULL;
    }

    napi_value result;
    CALL_ASSERT_OK(napi_create_uint32(env, written, &result));

    return result;
}

#define DECLARE_NAPI_METHOD(name, func) \
    { name, 0, func, 0, 0, 0, napi_default, 0 }

#define EXPORT_METHOD(name, func) \
    desc = DECLARE_NAPI_METHOD(name, func); \
    CALL_ASSERT_OK(napi_define_properties(env, exports, 1, &desc));

static napi_value Init(napi_env env, napi_value exports) {
    compressor = libdeflate_alloc_compressor(1);
    decompressor = libdeflate_alloc_decompressor();

    napi_status status;
    napi_property_descriptor desc;

    EXPORT_METHOD("zlib_compress", node_libdeflate_zlib_compress)
    EXPORT_METHOD("zlib_decompress", node_libdeflate_zlib_decompress)
    
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
