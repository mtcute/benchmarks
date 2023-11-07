## Usage logs

This directory contains logs collected while using the Telegram API and 
logging crypto APIs.

### Format
Each line is one of:
- `IGE.encrypt, size=%d` - AES IGE encryption of `size` bytes
- `IGE.decrypt, size=%d` - AES IGE decryption of `size` bytes
- `CTR.encrypt, size=%d` - AES CTR en/decryption of `size` bytes
- `gzip, size=%d` - gzip compression of `size` bytes
- `inflate, packed_size=%d, unpacked_size=%d` - gzip decompression of `packed_size` bytes to `unpacked_size` bytes

### Sources
- `weba.log`: collected from [WebA](https://web.telegram.org/a/) client (~4 hours of average usage)
- `mtcute-highload.log`: collected from mtcute while running a high-load bot (only receiving updates, ~5 minutes)