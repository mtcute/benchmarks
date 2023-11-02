{
    "targets": [
        {
            "target_name": "libdeflate",
            "sources": [
                "vendor/libdeflate.cpp",
            ],
            "libraries": ["<(module_root_dir)/vendor/libdeflate/build/libdeflate.a"],
            "include_dirs+": [
                "vendor/libdeflate"
            ],
            "cflags_cc": [
                "-std=c++17"
            ]
        }
    ]
}
