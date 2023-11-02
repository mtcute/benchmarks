#![no_std]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;
use alloc::boxed::Box;
use miniz_oxide::{
    deflate::core::{
        compress, create_comp_flags_from_zip_params, CompressorOxide, TDEFLFlush, TDEFLStatus,
    },
    inflate::decompress_to_vec_zlib,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn deflate_into(bytes: &[u8], max_size: usize) -> Option<Box<[u8]>> {
    let mut output = vec![0; max_size].into_boxed_slice();

    // The comp flags function sets the zlib flag if the window_bits parameter is > 0.
    let flags = create_comp_flags_from_zip_params(1.into(), 1, 0);
    let mut compressor = CompressorOxide::new(flags);

    let (status, _, bytes_written) = compress(&mut compressor, &bytes, &mut output, TDEFLFlush::Finish);

    match status {
        TDEFLStatus::Done => {
            return Some(output[..bytes_written].into());
        }
        TDEFLStatus::Okay => {
            return None;
        }
        // Not supposed to happen unless there is a bug.
        _ => panic!("Bug! Unexpectedly failed to compress!"),
    }
}

#[wasm_bindgen]
pub fn inflate(bytes: &[u8]) -> Option<Vec<u8>> {
    if let Ok(res) = decompress_to_vec_zlib(bytes) {
        Some(res)
    } else {
        None
    }
}
