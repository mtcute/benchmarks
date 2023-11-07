#!/usr/bin/env bash

set -euo pipefail

pushd lib > /dev/null
rm -f *.wasm
make
NO_UNROLL=1 WASM_OUT=mtcute-no-unroll.wasm make

echo "Binary size: $(stat -c%s mtcute.wasm | numfmt --to=iec-i --format=%.1f) -> $(gzip -c mtcute.wasm | wc -c | numfmt --to=iec-i --format=%.1f)"
echo "Binary size (no unroll): $(stat -c%s mtcute-no-unroll.wasm | numfmt --to=iec-i --format=%.1f) -> $(gzip -c mtcute-no-unroll.wasm | wc -c | numfmt --to=iec-i --format=%.1f)"

popd > /dev/null