.PHONY: all clean

SOURCES := 
SOURCES := $(SOURCES) utils/allocator.c
SOURCES := $(SOURCES) lekkit-sha256/sha256.c
SOURCES := $(SOURCES) clamav-sha256/sha256.c
SOURCES := $(SOURCES) rhash-sha256/sha256.c
SOURCES := $(SOURCES) clibs-sha1/sha1.c
SOURCES := $(SOURCES) teeny-sha1/sha1.c

SOURCES := $(SOURCES) \
	libdeflate/allocator.c \
	libdeflate/deflate_compress.c \
	libdeflate/deflate_decompress.c \
	libdeflate/gzip_decompress.c \
	libdeflate/zlib_compress.c \
	libdeflate/adler32.c 

SOURCES := $(SOURCES) \
	crypto/aes256.c \
	crypto/ctr256.c \
	crypto/ige256.c

WASM_CC ?= clang
CC := $(WASM_CC)

CFLAGS_WASM := \
	-target wasm32-unknown-unknown \
	-nostdlib -ffreestanding -DFREESTANDING \
	-mbulk-memory \
	-Wl,--no-entry,--export-dynamic,--lto-O3

CFLAGS := $(CFLAGS_WASM) \
	-O3 \
	-Qn \
	-DNDEBUG \
	-mno-exception-handling \
	-fdelete-null-pointer-checks \
	-fno-stack-protector \
	-flto=full \
	-fdata-sections \
	-ffunction-sections \
	-Wl,--gc-sections \

ifeq ($(NO_UNROLL),1)
	CFLAGS := $(CFLAGS) -fno-inline -fno-unroll-loops 
endif

ifneq ($(OS),Windows_NT)
    UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Darwin)
		export PATH := /opt/homebrew/opt/llvm/bin/:$(PATH)
    endif

	ifneq ($(NIX_STORE),)
		# what the fuck
		CC := clang-$(shell which clang | grep -oP "(?<=wrapper-).+?(?=\.)")
		NIX_INCLUDE_PATHS := $(shell echo | \
			gcc -Wp,-v -x c++ - -fsyntax-only 2>&1 | \
			sed -n -e '/ignoring /d' -e '/^#include "\.\.\." search starts here:/,$$p' | \
			awk '/\// { printf("-I%s ", $$0) }' \
		)
		CFLAGS := $(CFLAGS) $(NIX_CFLAGS_COMPILE) $(NIX_INCLUDE_PATHS)
	endif
endif

WASM_OUT ?= mtcute.wasm
OUT := $(WASM_OUT)

$(OUT): $(SOURCES)
	$(CC) $(CFLAGS) -I . -I utils -o $@ $^

clean:
	rm -f $(OUT)

all: $(OUT)
