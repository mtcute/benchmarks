#!/usr/bin/env bash

set -eaux -o pipefail

# # build libdeflate
# pushd vendor/libdeflate

# # fixup flags
# sed -i 's/set(CMAKE_C_FLAGS_RELEASE "-O2 -DNDEBUG")/\
# set(CMAKE_C_FLAGS_RELEASE "-O3 -DNDEBUG -march=native -mtune=native")\
# cmake_policy(SET CMP0069 NEW)\
# set(CMAKE_POLICY_DEFAULT_CMP0069 NEW)\
# set(CMAKE_INTERPROCEDURAL_OPTIMIZATION TRUE)/g' CMakeLists.txt

# cmake -B build && cmake --build build
# popd

# npx node-gyp configure
# npx node-gyp build

# THE solutions :D (fixup @mtcute/core to be sync)
sed -i 's/block = await this._aes/block = this._aes/g' node_modules/@mtcute/core/cjs/utils/crypto/common.js
sed -i 's/async encrypt/encrypt/g' node_modules/@mtcute/core/cjs/utils/crypto/common.js
sed -i 's/async decrypt/decrypt/g' node_modules/@mtcute/core/cjs/utils/crypto/common.js
