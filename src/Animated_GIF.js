let define;
let self
(function (f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.Animated_GIF = f()
    }
})(function () {
    var define, module, exports;
    return (function () {
        function r(e, n, t) {
            function o(i, f) {
                if (!n[i]) {
                    if (!e[i]) {
                        var c = "function" == typeof require && require;
                        if (!f && c) return c(i, !0);
                        if (u) return u(i, !0);
                        var a = new Error("Cannot find module '" + i + "'");
                        throw a.code = "MODULE_NOT_FOUND", a
                    }
                    var p = n[i] = {exports: {}};
                    e[i][0].call(p.exports, function (r) {
                        var n = e[i][1][r];
                        return o(n || r)
                    }, p, p.exports, r, e, n, t)
                }
                return n[i].exports
            }

            for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
            return o
        }

        return r
    })()({
        1: [function (require, module, exports) {
// (c) Dean McNamee <dean@gmail.com>, 2013.
//
// https://github.com/deanm/omggif
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//
// omggif is a JavaScript implementation of a GIF 89a encoder and decoder,
// including animation and compression.  It does not rely on any specific
// underlying system, so should run in the browser, Node, or Plask.

            "use strict";

            function GifWriter(buf, width, height, gopts) {
                var p = 0;

                var gopts = gopts === undefined ? {} : gopts;
                var loop_count = gopts.loop === undefined ? null : gopts.loop;
                var global_palette = gopts.palette === undefined ? null : gopts.palette;

                if (width <= 0 || height <= 0 || width > 65535 || height > 65535)
                    throw new Error("Width/Height invalid.");

                function check_palette_and_num_colors(palette) {
                    var num_colors = palette.length;
                    if (num_colors < 2 || num_colors > 256 || num_colors & (num_colors - 1)) {
                        throw new Error(
                            "Invalid code/color length, must be power of 2 and 2 .. 256.");
                    }
                    return num_colors;
                }

                // - Header.
                buf[p++] = 0x47;
                buf[p++] = 0x49;
                buf[p++] = 0x46;  // GIF
                buf[p++] = 0x38;
                buf[p++] = 0x39;
                buf[p++] = 0x61;  // 89a

                // Handling of Global Color Table (palette) and background index.
                var gp_num_colors_pow2 = 0;
                var background = 0;
                if (global_palette !== null) {
                    var gp_num_colors = check_palette_and_num_colors(global_palette);
                    while (gp_num_colors >>= 1) ++gp_num_colors_pow2;
                    gp_num_colors = 1 << gp_num_colors_pow2;
                    --gp_num_colors_pow2;
                    if (gopts.background !== undefined) {
                        background = gopts.background;
                        if (background >= gp_num_colors)
                            throw new Error("Background index out of range.");
                        // The GIF spec states that a background index of 0 should be ignored, so
                        // this is probably a mistake and you really want to set it to another
                        // slot in the palette.  But actually in the end most browsers, etc end
                        // up ignoring this almost completely (including for dispose background).
                        if (background === 0)
                            throw new Error("Background index explicitly passed as 0.");
                    }
                }

                // - Logical Screen Descriptor.
                // NOTE(deanm): w/h apparently ignored by implementations, but set anyway.
                buf[p++] = width & 0xff;
                buf[p++] = width >> 8 & 0xff;
                buf[p++] = height & 0xff;
                buf[p++] = height >> 8 & 0xff;
                // NOTE: Indicates 0-bpp original color resolution (unused?).
                buf[p++] = (global_palette !== null ? 0x80 : 0) |  // Global Color Table Flag.
                    gp_num_colors_pow2;  // NOTE: No sort flag (unused?).
                buf[p++] = background;  // Background Color Index.
                buf[p++] = 0;  // Pixel aspect ratio (unused?).

                // - Global Color Table
                if (global_palette !== null) {
                    for (var i = 0, il = global_palette.length; i < il; ++i) {
                        var rgb = global_palette[i];
                        buf[p++] = rgb >> 16 & 0xff;
                        buf[p++] = rgb >> 8 & 0xff;
                        buf[p++] = rgb & 0xff;
                    }
                }

                if (loop_count !== null) {  // Netscape block for looping.
                    if (loop_count < 0 || loop_count > 65535)
                        throw new Error("Loop count invalid.")
                    // Extension code, label, and length.
                    buf[p++] = 0x21;
                    buf[p++] = 0xff;
                    buf[p++] = 0x0b;
                    // NETSCAPE2.0
                    buf[p++] = 0x4e;
                    buf[p++] = 0x45;
                    buf[p++] = 0x54;
                    buf[p++] = 0x53;
                    buf[p++] = 0x43;
                    buf[p++] = 0x41;
                    buf[p++] = 0x50;
                    buf[p++] = 0x45;
                    buf[p++] = 0x32;
                    buf[p++] = 0x2e;
                    buf[p++] = 0x30;
                    // Sub-block
                    buf[p++] = 0x03;
                    buf[p++] = 0x01;
                    buf[p++] = loop_count & 0xff;
                    buf[p++] = loop_count >> 8 & 0xff;
                    buf[p++] = 0x00;  // Terminator.
                }


                var ended = false;

                this.addFrame = function (x, y, w, h, indexed_pixels, opts) {
                    if (ended === true) {
                        --p;
                        ended = false;
                    }  // Un-end.

                    opts = opts === undefined ? {} : opts;

                    // TODO(deanm): Bounds check x, y.  Do they need to be within the virtual
                    // canvas width/height, I imagine?
                    if (x < 0 || y < 0 || x > 65535 || y > 65535)
                        throw new Error("x/y invalid.")

                    if (w <= 0 || h <= 0 || w > 65535 || h > 65535)
                        throw new Error("Width/Height invalid.")

                    if (indexed_pixels.length < w * h)
                        throw new Error("Not enough pixels for the frame size.");

                    var using_local_palette = true;
                    var palette = opts.palette;
                    if (palette === undefined || palette === null) {
                        using_local_palette = false;
                        palette = global_palette;
                    }

                    if (palette === undefined || palette === null)
                        throw new Error("Must supply either a local or global palette.");

                    var num_colors = check_palette_and_num_colors(palette);

                    // Compute the min_code_size (power of 2), destroying num_colors.
                    var min_code_size = 0;
                    while (num_colors >>= 1) ++min_code_size;
                    num_colors = 1 << min_code_size;  // Now we can easily get it back.

                    var delay = opts.delay === undefined ? 0 : opts.delay;

                    // From the spec:
                    //     0 -   No disposal specified. The decoder is
                    //           not required to take any action.
                    //     1 -   Do not dispose. The graphic is to be left
                    //           in place.
                    //     2 -   Restore to background color. The area used by the
                    //           graphic must be restored to the background color.
                    //     3 -   Restore to previous. The decoder is required to
                    //           restore the area overwritten by the graphic with
                    //           what was there prior to rendering the graphic.
                    //  4-7 -    To be defined.
                    // NOTE(deanm): Dispose background doesn't really work, apparently most
                    // browsers ignore the background palette index and clear to transparency.
                    var disposal = opts.disposal === undefined ? 0 : opts.disposal;
                    if (disposal < 0 || disposal > 3)  // 4-7 is reserved.
                        throw new Error("Disposal out of range.");

                    var use_transparency = false;
                    var transparent_index = 0;
                    if (opts.transparent !== undefined && opts.transparent !== null) {
                        use_transparency = true;
                        transparent_index = opts.transparent;
                        if (transparent_index < 0 || transparent_index >= num_colors)
                            throw new Error("Transparent color index.");
                    }

                    if (disposal !== 0 || use_transparency || delay !== 0) {
                        // - Graphics Control Extension
                        buf[p++] = 0x21;
                        buf[p++] = 0xf9;  // Extension / Label.
                        buf[p++] = 4;  // Byte size.

                        buf[p++] = disposal << 2 | (use_transparency === true ? 1 : 0);
                        buf[p++] = delay & 0xff;
                        buf[p++] = delay >> 8 & 0xff;
                        buf[p++] = transparent_index;  // Transparent color index.
                        buf[p++] = 0;  // Block Terminator.
                    }

                    // - Image Descriptor
                    buf[p++] = 0x2c;  // Image Seperator.
                    buf[p++] = x & 0xff;
                    buf[p++] = x >> 8 & 0xff;  // Left.
                    buf[p++] = y & 0xff;
                    buf[p++] = y >> 8 & 0xff;  // Top.
                    buf[p++] = w & 0xff;
                    buf[p++] = w >> 8 & 0xff;
                    buf[p++] = h & 0xff;
                    buf[p++] = h >> 8 & 0xff;
                    // NOTE: No sort flag (unused?).
                    // TODO(deanm): Support interlace.
                    buf[p++] = using_local_palette === true ? (0x80 | (min_code_size - 1)) : 0;

                    // - Local Color Table
                    if (using_local_palette === true) {
                        for (var i = 0, il = palette.length; i < il; ++i) {
                            var rgb = palette[i];
                            buf[p++] = rgb >> 16 & 0xff;
                            buf[p++] = rgb >> 8 & 0xff;
                            buf[p++] = rgb & 0xff;
                        }
                    }

                    p = GifWriterOutputLZWCodeStream(
                        buf, p, min_code_size < 2 ? 2 : min_code_size, indexed_pixels);

                    return p;
                };

                this.end = function () {
                    if (ended === false) {
                        buf[p++] = 0x3b;  // Trailer.
                        ended = true;
                    }
                    return p;
                };

                this.getOutputBuffer = function () {
                    return buf;
                };
                this.setOutputBuffer = function (v) {
                    buf = v;
                };
                this.getOutputBufferPosition = function () {
                    return p;
                };
                this.setOutputBufferPosition = function (v) {
                    p = v;
                };
            }

// Main compression routine, palette indexes -> LZW code stream.
// |index_stream| must have at least one entry.
            function GifWriterOutputLZWCodeStream(buf, p, min_code_size, index_stream) {
                buf[p++] = min_code_size;
                var cur_subblock = p++;  // Pointing at the length field.

                var clear_code = 1 << min_code_size;
                var code_mask = clear_code - 1;
                var eoi_code = clear_code + 1;
                var next_code = eoi_code + 1;

                var cur_code_size = min_code_size + 1;  // Number of bits per code.
                var cur_shift = 0;
                // We have at most 12-bit codes, so we should have to hold a max of 19
                // bits here (and then we would write out).
                var cur = 0;

                function emit_bytes_to_buffer(bit_block_size) {
                    while (cur_shift >= bit_block_size) {
                        buf[p++] = cur & 0xff;
                        cur >>= 8;
                        cur_shift -= 8;
                        if (p === cur_subblock + 256) {  // Finished a subblock.
                            buf[cur_subblock] = 255;
                            cur_subblock = p++;
                        }
                    }
                }

                function emit_code(c) {
                    cur |= c << cur_shift;
                    cur_shift += cur_code_size;
                    emit_bytes_to_buffer(8);
                }

                // I am not an expert on the topic, and I don't want to write a thesis.
                // However, it is good to outline here the basic algorithm and the few data
                // structures and optimizations here that make this implementation fast.
                // The basic idea behind LZW is to build a table of previously seen runs
                // addressed by a short id (herein called output code).  All data is
                // referenced by a code, which represents one or more values from the
                // original input stream.  All input bytes can be referenced as the same
                // value as an output code.  So if you didn't want any compression, you
                // could more or less just output the original bytes as codes (there are
                // some details to this, but it is the idea).  In order to achieve
                // compression, values greater then the input range (codes can be up to
                // 12-bit while input only 8-bit) represent a sequence of previously seen
                // inputs.  The decompressor is able to build the same mapping while
                // decoding, so there is always a shared common knowledge between the
                // encoding and decoder, which is also important for "timing" aspects like
                // how to handle variable bit width code encoding.
                //
                // One obvious but very important consequence of the table system is there
                // is always a unique id (at most 12-bits) to map the runs.  'A' might be
                // 4, then 'AA' might be 10, 'AAA' 11, 'AAAA' 12, etc.  This relationship
                // can be used for an effecient lookup strategy for the code mapping.  We
                // need to know if a run has been seen before, and be able to map that run
                // to the output code.  Since we start with known unique ids (input bytes),
                // and then from those build more unique ids (table entries), we can
                // continue this chain (almost like a linked list) to always have small
                // integer values that represent the current byte chains in the encoder.
                // This means instead of tracking the input bytes (AAAABCD) to know our
                // current state, we can track the table entry for AAAABC (it is guaranteed
                // to exist by the nature of the algorithm) and the next character D.
                // Therefor the tuple of (table_entry, byte) is guaranteed to also be
                // unique.  This allows us to create a simple lookup key for mapping input
                // sequences to codes (table indices) without having to store or search
                // any of the code sequences.  So if 'AAAA' has a table entry of 12, the
                // tuple of ('AAAA', K) for any input byte K will be unique, and can be our
                // key.  This leads to a integer value at most 20-bits, which can always
                // fit in an SMI value and be used as a fast sparse array / object key.

                // Output code for the current contents of the index buffer.
                var ib_code = index_stream[0] & code_mask;  // Load first input index.
                var code_table = {};  // Key'd on our 20-bit "tuple".

                emit_code(clear_code);  // Spec says first code should be a clear code.

                // First index already loaded, process the rest of the stream.
                for (var i = 1, il = index_stream.length; i < il; ++i) {
                    var k = index_stream[i] & code_mask;
                    var cur_key = ib_code << 8 | k;  // (prev, k) unique tuple.
                    var cur_code = code_table[cur_key];  // buffer + k.

                    // Check if we have to create a new code table entry.
                    if (cur_code === undefined) {  // We don't have buffer + k.
                        // Emit index buffer (without k).
                        // This is an inline version of emit_code, because this is the core
                        // writing routine of the compressor (and V8 cannot inline emit_code
                        // because it is a closure here in a different context).  Additionally
                        // we can call emit_byte_to_buffer less often, because we can have
                        // 30-bits (from our 31-bit signed SMI), and we know our codes will only
                        // be 12-bits, so can safely have 18-bits there without overflow.
                        // emit_code(ib_code);
                        cur |= ib_code << cur_shift;
                        cur_shift += cur_code_size;
                        while (cur_shift >= 8) {
                            buf[p++] = cur & 0xff;
                            cur >>= 8;
                            cur_shift -= 8;
                            if (p === cur_subblock + 256) {  // Finished a subblock.
                                buf[cur_subblock] = 255;
                                cur_subblock = p++;
                            }
                        }

                        if (next_code === 4096) {  // Table full, need a clear.
                            emit_code(clear_code);
                            next_code = eoi_code + 1;
                            cur_code_size = min_code_size + 1;
                            code_table = {};
                        } else {  // Table not full, insert a new entry.
                            // Increase our variable bit code sizes if necessary.  This is a bit
                            // tricky as it is based on "timing" between the encoding and
                            // decoder.  From the encoders perspective this should happen after
                            // we've already emitted the index buffer and are about to create the
                            // first table entry that would overflow our current code bit size.
                            if (next_code >= (1 << cur_code_size)) ++cur_code_size;
                            code_table[cur_key] = next_code++;  // Insert into code table.
                        }

                        ib_code = k;  // Index buffer to single input k.
                    } else {
                        ib_code = cur_code;  // Index buffer to sequence in code table.
                    }
                }

                emit_code(ib_code);  // There will still be something in the index buffer.
                emit_code(eoi_code);  // End Of Information.

                // Flush / finalize the sub-blocks stream to the buffer.
                emit_bytes_to_buffer(1);

                // Finish the sub-blocks, writing out any unfinished lengths and
                // terminating with a sub-block of length 0.  If we have already started
                // but not yet used a sub-block it can just become the terminator.
                if (cur_subblock + 1 === p) {  // Started but unused.
                    buf[cur_subblock] = 0;
                } else {  // Started and used, write length and additional terminator block.
                    buf[cur_subblock] = p - cur_subblock - 1;
                    buf[p++] = 0;
                }
                return p;
            }

            function GifReader(buf) {
                var p = 0;

                // - Header (GIF87a or GIF89a).
                if (buf[p++] !== 0x47 || buf[p++] !== 0x49 || buf[p++] !== 0x46 ||
                    buf[p++] !== 0x38 || (buf[p++] + 1 & 0xfd) !== 0x38 || buf[p++] !== 0x61) {
                    throw new Error("Invalid GIF 87a/89a header.");
                }

                // - Logical Screen Descriptor.
                var width = buf[p++] | buf[p++] << 8;
                var height = buf[p++] | buf[p++] << 8;
                var pf0 = buf[p++];  // <Packed Fields>.
                var global_palette_flag = pf0 >> 7;
                var num_global_colors_pow2 = pf0 & 0x7;
                var num_global_colors = 1 << (num_global_colors_pow2 + 1);
                var background = buf[p++];
                p++;  // Pixel aspect ratio (unused?).

                var global_palette_offset = null;
                var global_palette_size = null;

                if (global_palette_flag) {
                    global_palette_offset = p;
                    global_palette_size = num_global_colors;
                    p += num_global_colors * 3;  // Seek past palette.
                }

                var no_eof = true;

                var frames = [];

                var delay = 0;
                var transparent_index = null;
                var disposal = 0;  // 0 - No disposal specified.
                var loop_count = null;

                this.width = width;
                this.height = height;

                while (no_eof && p < buf.length) {
                    switch (buf[p++]) {
                        case 0x21:  // Graphics Control Extension Block
                            switch (buf[p++]) {
                                case 0xff:  // Application specific block
                                    // Try if it's a Netscape block (with animation loop counter).
                                    if (buf[p] !== 0x0b ||  // 21 FF already read, check block size.
                                        // NETSCAPE2.0
                                        buf[p + 1] == 0x4e && buf[p + 2] == 0x45 && buf[p + 3] == 0x54 &&
                                        buf[p + 4] == 0x53 && buf[p + 5] == 0x43 && buf[p + 6] == 0x41 &&
                                        buf[p + 7] == 0x50 && buf[p + 8] == 0x45 && buf[p + 9] == 0x32 &&
                                        buf[p + 10] == 0x2e && buf[p + 11] == 0x30 &&
                                        // Sub-block
                                        buf[p + 12] == 0x03 && buf[p + 13] == 0x01 && buf[p + 16] == 0) {
                                        p += 14;
                                        loop_count = buf[p++] | buf[p++] << 8;
                                        p++;  // Skip terminator.
                                    } else {  // We don't know what it is, just try to get past it.
                                        p += 12;
                                        while (true) {  // Seek through subblocks.
                                            var block_size = buf[p++];
                                            // Bad block size (ex: undefined from an out of bounds read).
                                            if (!(block_size >= 0)) throw Error("Invalid block size");
                                            if (block_size === 0) break;  // 0 size is terminator
                                            p += block_size;
                                        }
                                    }
                                    break;

                                case 0xf9:  // Graphics Control Extension
                                    if (buf[p++] !== 0x4 || buf[p + 4] !== 0)
                                        throw new Error("Invalid graphics extension block.");
                                    var pf1 = buf[p++];
                                    delay = buf[p++] | buf[p++] << 8;
                                    transparent_index = buf[p++];
                                    if ((pf1 & 1) === 0) transparent_index = null;
                                    disposal = pf1 >> 2 & 0x7;
                                    p++;  // Skip terminator.
                                    break;

                                case 0xfe:  // Comment Extension.
                                    while (true) {  // Seek through subblocks.
                                        var block_size = buf[p++];
                                        // Bad block size (ex: undefined from an out of bounds read).
                                        if (!(block_size >= 0)) throw Error("Invalid block size");
                                        if (block_size === 0) break;  // 0 size is terminator
                                        // console.log(buf.slice(p, p+block_size).toString('ascii'));
                                        p += block_size;
                                    }
                                    break;

                                default:
                                    throw new Error(
                                        "Unknown graphic control label: 0x" + buf[p - 1].toString(16));
                            }
                            break;

                        case 0x2c:  // Image Descriptor.
                            var x = buf[p++] | buf[p++] << 8;
                            var y = buf[p++] | buf[p++] << 8;
                            var w = buf[p++] | buf[p++] << 8;
                            var h = buf[p++] | buf[p++] << 8;
                            var pf2 = buf[p++];
                            var local_palette_flag = pf2 >> 7;
                            var interlace_flag = pf2 >> 6 & 1;
                            var num_local_colors_pow2 = pf2 & 0x7;
                            var num_local_colors = 1 << (num_local_colors_pow2 + 1);
                            var palette_offset = global_palette_offset;
                            var palette_size = global_palette_size;
                            var has_local_palette = false;
                            if (local_palette_flag) {
                                var has_local_palette = true;
                                palette_offset = p;  // Override with local palette.
                                palette_size = num_local_colors;
                                p += num_local_colors * 3;  // Seek past palette.
                            }

                            var data_offset = p;

                            p++;  // codesize
                            while (true) {
                                var block_size = buf[p++];
                                // Bad block size (ex: undefined from an out of bounds read).
                                if (!(block_size >= 0)) throw Error("Invalid block size");
                                if (block_size === 0) break;  // 0 size is terminator
                                p += block_size;
                            }

                            frames.push({
                                x: x, y: y, width: w, height: h,
                                has_local_palette: has_local_palette,
                                palette_offset: palette_offset,
                                palette_size: palette_size,
                                data_offset: data_offset,
                                data_length: p - data_offset,
                                transparent_index: transparent_index,
                                interlaced: !!interlace_flag,
                                delay: delay,
                                disposal: disposal
                            });
                            break;

                        case 0x3b:  // Trailer Marker (end of file).
                            no_eof = false;
                            break;

                        default:
                            throw new Error("Unknown gif block: 0x" + buf[p - 1].toString(16));
                            break;
                    }
                }

                this.numFrames = function () {
                    return frames.length;
                };

                this.loopCount = function () {
                    return loop_count;
                };

                this.frameInfo = function (frame_num) {
                    if (frame_num < 0 || frame_num >= frames.length)
                        throw new Error("Frame index out of range.");
                    return frames[frame_num];
                }

                this.decodeAndBlitFrameBGRA = function (frame_num, pixels) {
                    var frame = this.frameInfo(frame_num);
                    var num_pixels = frame.width * frame.height;
                    var index_stream = new Uint8Array(num_pixels);  // At most 8-bit indices.
                    GifReaderLZWOutputIndexStream(
                        buf, frame.data_offset, index_stream, num_pixels);
                    var palette_offset = frame.palette_offset;

                    // NOTE(deanm): It seems to be much faster to compare index to 256 than
                    // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
                    // the profile, not sure if it's related to using a Uint8Array.
                    var trans = frame.transparent_index;
                    if (trans === null) trans = 256;

                    // We are possibly just blitting to a portion of the entire frame.
                    // That is a subrect within the framerect, so the additional pixels
                    // must be skipped over after we finished a scanline.
                    var framewidth = frame.width;
                    var framestride = width - framewidth;
                    var xleft = framewidth;  // Number of subrect pixels left in scanline.

                    // Output indicies of the top left and bottom right corners of the subrect.
                    var opbeg = ((frame.y * width) + frame.x) * 4;
                    var opend = ((frame.y + frame.height) * width + frame.x) * 4;
                    var op = opbeg;

                    var scanstride = framestride * 4;

                    // Use scanstride to skip past the rows when interlacing.  This is skipping
                    // 7 rows for the first two passes, then 3 then 1.
                    if (frame.interlaced === true) {
                        scanstride += width * 4 * 7;  // Pass 1.
                    }

                    var interlaceskip = 8;  // Tracking the row interval in the current pass.

                    for (var i = 0, il = index_stream.length; i < il; ++i) {
                        var index = index_stream[i];

                        if (xleft === 0) {  // Beginning of new scan line
                            op += scanstride;
                            xleft = framewidth;
                            if (op >= opend) { // Catch the wrap to switch passes when interlacing.
                                scanstride = framestride * 4 + width * 4 * (interlaceskip - 1);
                                // interlaceskip / 2 * 4 is interlaceskip << 1.
                                op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
                                interlaceskip >>= 1;
                            }
                        }

                        if (index === trans) {
                            op += 4;
                        } else {
                            var r = buf[palette_offset + index * 3];
                            var g = buf[palette_offset + index * 3 + 1];
                            var b = buf[palette_offset + index * 3 + 2];
                            pixels[op++] = b;
                            pixels[op++] = g;
                            pixels[op++] = r;
                            pixels[op++] = 255;
                        }
                        --xleft;
                    }
                };

                // I will go to copy and paste hell one day...
                this.decodeAndBlitFrameRGBA = function (frame_num, pixels) {
                    var frame = this.frameInfo(frame_num);
                    var num_pixels = frame.width * frame.height;
                    var index_stream = new Uint8Array(num_pixels);  // At most 8-bit indices.
                    GifReaderLZWOutputIndexStream(
                        buf, frame.data_offset, index_stream, num_pixels);
                    var palette_offset = frame.palette_offset;

                    // NOTE(deanm): It seems to be much faster to compare index to 256 than
                    // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
                    // the profile, not sure if it's related to using a Uint8Array.
                    var trans = frame.transparent_index;
                    if (trans === null) trans = 256;

                    // We are possibly just blitting to a portion of the entire frame.
                    // That is a subrect within the framerect, so the additional pixels
                    // must be skipped over after we finished a scanline.
                    var framewidth = frame.width;
                    var framestride = width - framewidth;
                    var xleft = framewidth;  // Number of subrect pixels left in scanline.

                    // Output indicies of the top left and bottom right corners of the subrect.
                    var opbeg = ((frame.y * width) + frame.x) * 4;
                    var opend = ((frame.y + frame.height) * width + frame.x) * 4;
                    var op = opbeg;

                    var scanstride = framestride * 4;

                    // Use scanstride to skip past the rows when interlacing.  This is skipping
                    // 7 rows for the first two passes, then 3 then 1.
                    if (frame.interlaced === true) {
                        scanstride += width * 4 * 7;  // Pass 1.
                    }

                    var interlaceskip = 8;  // Tracking the row interval in the current pass.

                    for (var i = 0, il = index_stream.length; i < il; ++i) {
                        var index = index_stream[i];

                        if (xleft === 0) {  // Beginning of new scan line
                            op += scanstride;
                            xleft = framewidth;
                            if (op >= opend) { // Catch the wrap to switch passes when interlacing.
                                scanstride = framestride * 4 + width * 4 * (interlaceskip - 1);
                                // interlaceskip / 2 * 4 is interlaceskip << 1.
                                op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
                                interlaceskip >>= 1;
                            }
                        }

                        if (index === trans) {
                            op += 4;
                        } else {
                            var r = buf[palette_offset + index * 3];
                            var g = buf[palette_offset + index * 3 + 1];
                            var b = buf[palette_offset + index * 3 + 2];
                            pixels[op++] = r;
                            pixels[op++] = g;
                            pixels[op++] = b;
                            pixels[op++] = 255;
                        }
                        --xleft;
                    }
                };
            }

            function GifReaderLZWOutputIndexStream(code_stream, p, output, output_length) {
                var min_code_size = code_stream[p++];

                var clear_code = 1 << min_code_size;
                var eoi_code = clear_code + 1;
                var next_code = eoi_code + 1;

                var cur_code_size = min_code_size + 1;  // Number of bits per code.
                // NOTE: This shares the same name as the encoder, but has a different
                // meaning here.  Here this masks each code coming from the code stream.
                var code_mask = (1 << cur_code_size) - 1;
                var cur_shift = 0;
                var cur = 0;

                var op = 0;  // Output pointer.

                var subblock_size = code_stream[p++];

                // TODO(deanm): Would using a TypedArray be any faster?  At least it would
                // solve the fast mode / backing store uncertainty.
                // var code_table = Array(4096);
                var code_table = new Int32Array(4096);  // Can be signed, we only use 20 bits.

                var prev_code = null;  // Track code-1.

                while (true) {
                    // Read up to two bytes, making sure we always 12-bits for max sized code.
                    while (cur_shift < 16) {
                        if (subblock_size === 0) break;  // No more data to be read.

                        cur |= code_stream[p++] << cur_shift;
                        cur_shift += 8;

                        if (subblock_size === 1) {  // Never let it get to 0 to hold logic above.
                            subblock_size = code_stream[p++];  // Next subblock.
                        } else {
                            --subblock_size;
                        }
                    }

                    // TODO(deanm): We should never really get here, we should have received
                    // and EOI.
                    if (cur_shift < cur_code_size)
                        break;

                    var code = cur & code_mask;
                    cur >>= cur_code_size;
                    cur_shift -= cur_code_size;

                    // TODO(deanm): Maybe should check that the first code was a clear code,
                    // at least this is what you're supposed to do.  But actually our encoder
                    // now doesn't emit a clear code first anyway.
                    if (code === clear_code) {
                        // We don't actually have to clear the table.  This could be a good idea
                        // for greater error checking, but we don't really do any anyway.  We
                        // will just track it with next_code and overwrite old entries.

                        next_code = eoi_code + 1;
                        cur_code_size = min_code_size + 1;
                        code_mask = (1 << cur_code_size) - 1;

                        // Don't update prev_code ?
                        prev_code = null;
                        continue;
                    } else if (code === eoi_code) {
                        break;
                    }

                    // We have a similar situation as the decoder, where we want to store
                    // variable length entries (code table entries), but we want to do in a
                    // faster manner than an array of arrays.  The code below stores sort of a
                    // linked list within the code table, and then "chases" through it to
                    // construct the dictionary entries.  When a new entry is created, just the
                    // last byte is stored, and the rest (prefix) of the entry is only
                    // referenced by its table entry.  Then the code chases through the
                    // prefixes until it reaches a single byte code.  We have to chase twice,
                    // first to compute the length, and then to actually copy the data to the
                    // output (backwards, since we know the length).  The alternative would be
                    // storing something in an intermediate stack, but that doesn't make any
                    // more sense.  I implemented an approach where it also stored the length
                    // in the code table, although it's a bit tricky because you run out of
                    // bits (12 + 12 + 8), but I didn't measure much improvements (the table
                    // entries are generally not the long).  Even when I created benchmarks for
                    // very long table entries the complexity did not seem worth it.
                    // The code table stores the prefix entry in 12 bits and then the suffix
                    // byte in 8 bits, so each entry is 20 bits.

                    var chase_code = code < next_code ? code : prev_code;

                    // Chase what we will output, either {CODE} or {CODE-1}.
                    var chase_length = 0;
                    var chase = chase_code;
                    while (chase > clear_code) {
                        chase = code_table[chase] >> 8;
                        ++chase_length;
                    }

                    var k = chase;

                    var op_end = op + chase_length + (chase_code !== code ? 1 : 0);
                    if (op_end > output_length) {
                        console.log("Warning, gif stream longer than expected.");
                        return;
                    }

                    // Already have the first byte from the chase, might as well write it fast.
                    output[op++] = k;

                    op += chase_length;
                    var b = op;  // Track pointer, writing backwards.

                    if (chase_code !== code)  // The case of emitting {CODE-1} + k.
                        output[op++] = k;

                    chase = chase_code;
                    while (chase_length--) {
                        chase = code_table[chase];
                        output[--b] = chase & 0xff;  // Write backwards.
                        chase >>= 8;  // Pull down to the prefix code.
                    }

                    if (prev_code !== null && next_code < 4096) {
                        code_table[next_code++] = prev_code << 8 | k;
                        // TODO(deanm): Figure out this clearing vs code growth logic better.  I
                        // have an feeling that it should just happen somewhere else, for now it
                        // is awkward between when we grow past the max and then hit a clear code.
                        // For now just check if we hit the max 12-bits (then a clear code should
                        // follow, also of course encoded in 12-bits).
                        if (next_code >= code_mask + 1 && cur_code_size < 12) {
                            ++cur_code_size;
                            code_mask = code_mask << 1 | 1;
                        }
                    }

                    prev_code = code;
                }

                if (op !== output_length) {
                    console.log("Warning, gif stream shorter than expected.");
                }

                return output;
            }

// CommonJS.
            try {
                exports.GifWriter = GifWriter;
                exports.GifReader = GifReader
            } catch (e) {
            }

        }, {}], 2: [function (require, module, exports) {
// A library/utility for generating GIF files
// Uses Dean McNamee's omggif library
// and Anthony Dekker's NeuQuant quantizer (JS 0.3 version with many fixes)
//
// @author sole / http://soledadpenades.com
            function Animated_GIF(options) {
                'use strict';

                options = options || {};

                var GifWriter = require('omggif').GifWriter;

                var width = options.width || 160;
                var height = options.height || 120;
                var dithering = options.dithering || null;
                var palette = options.palette || null;
                var disposal = options.disposal || 0;
                var transparent = options.transparent || null;
                var delay = options.delay !== undefined ? (options.delay * 0.1) : 250;
                var canvas = null, ctx = null, repeat = 0;
                var frames = [];
                var numRenderedFrames = 0;
                var onRenderCompleteCallback = function () {
                };
                var onRenderProgressCallback = function () {
                };
                var sampleInterval;
                var workers = [], availableWorkers = [], numWorkers;
                var generatingGIF = false;

                // We'll try to be a little lenient with the palette so as to make the library easy to use
                // The only thing we can't cope with is having a non-array so we'll bail on that one.
                if (palette) {

                    if (!(palette instanceof Array)) {

                        throw('Palette MUST be an array but it is: ', palette);

                    } else {

                        // Now there are other two constraints that we will warn about
                        // and silently fix them... somehow:

                        // a) Must contain between 2 and 256 colours
                        if (palette.length < 2 || palette.length > 256) {
                            console.error('Palette must hold only between 2 and 256 colours');

                            while (palette.length < 2) {
                                palette.push(0x000000);
                            }

                            if (palette.length > 256) {
                                palette = palette.slice(0, 256);
                            }
                        }

                        // b) Must be power of 2
                        if (!powerOfTwo(palette.length)) {
                            console.error('Palette must have a power of two number of colours');

                            while (!powerOfTwo(palette.length)) {
                                palette.splice(palette.length - 1, 1);
                            }
                        }

                    }

                }

                options = options || {};
                sampleInterval = options.sampleInterval || 10;
                numWorkers = options.numWorkers || 2;

                for (var i = 0; i < numWorkers; i++) {
                    var w = new Worker(window.URL.createObjectURL(new Blob(['(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module \'"+o+"\'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n\nfunction colorClamp(value) {\n\tif(value < 0) return 0;\n\telse if(value > 255) return 255;\n\n\treturn value;\n}\n\nvar bayerMatrix8x8 = [\n\t[  1, 49, 13, 61,  4, 52, 16, 64 ],\n\t[ 33, 17, 45, 29, 36, 20, 48, 32 ],\n\t[  9, 57,  5, 53, 12, 60,  8, 56 ],\n\t[ 41, 25, 37, 21, 44, 28, 40, 24 ],\n\t[  3, 51, 15, 63,  2, 50, 14, 62 ],\n\t[ 35, 19, 47, 31, 34, 18, 46, 30 ],\n\t[ 11, 59,  7, 55, 10, 58,  6, 54 ],\n\t[ 43, 27, 39, 23, 42, 26, 38, 22 ]\n\t];\n\n\t// int r, int g, int b, int[][] palette, int paletteLength\n\tfunction getClosestPaletteColorIndex(r, g, b, palette, paletteLength) {\n\t\tvar minDistance = 195076;\n\t\tvar diffR, diffG, diffB;\n\t\tvar distanceSquared;\n\t\tvar bestIndex = 0;\n\t\tvar paletteChannels;\n\n\t\tfor(var i = 0; i < paletteLength; i++) {\n\n\t\t\tpaletteChannels = palette[i];\n\t\t\tdiffR = r - paletteChannels[0];\n\t\t\tdiffG = g - paletteChannels[1];\n\t\t\tdiffB = b - paletteChannels[2];\n\n\t\t\tdistanceSquared = diffR*diffR + diffG*diffG + diffB*diffB;\n\n\t\t\tif(distanceSquared < minDistance) {\n\t\t\t\tbestIndex = i;\n\t\t\t\tminDistance = distanceSquared;\n\t\t\t}\n\n\t\t}\n\n\t\treturn bestIndex;\n\t}\n\n// TODO: inPixels -> inComponents or inColors or something more accurate\nfunction BayerDithering(inPixels, width, height, palette) {\n\tvar offset = 0;\n\tvar indexedOffset = 0;\n\tvar r, g, b;\n\tvar pixel, threshold, index;\n\tvar paletteLength = palette.length;\n\tvar matrix = bayerMatrix8x8;\n\tvar indexedPixels = new Uint8Array( width * height );\n\n\tvar modI = 8;\n\tvar modJ = 8;\n\n\tfor(var j = 0; j < height; j++) {\n\t\tvar modj = j % modJ;\n\n\t\tfor(var i = 0; i < width; i++) {\n\n\t\t\tthreshold = matrix[i % modI][modj];\n\n\t\t\tr = colorClamp( inPixels[offset++] + threshold );\n\t\t\tg = colorClamp( inPixels[offset++] + threshold );\n\t\t\tb = colorClamp( inPixels[offset++] + threshold );\n\n\t\t\tindex = getClosestPaletteColorIndex(r, g, b, palette, paletteLength);\n\t\t\tindexedPixels[indexedOffset++] = index;\n\n\t\t}\n\t}\n\n\treturn indexedPixels;\n}\n\n\nfunction ClosestDithering(inPixels, width, height, palette) {\n\n\tvar offset = 0;\n\tvar indexedOffset = 0;\n\tvar r, g, b;\n\tvar index;\n\tvar paletteLength = palette.length;\n\tvar matrix = bayerMatrix8x8;\n\tvar numPixels = width * height;\n\tvar indexedPixels = new Uint8Array( numPixels );\n\n\tfor(var i = 0; i < numPixels; i++) {\n\n\t\tr = inPixels[offset++];\n\t\tg = inPixels[offset++];\n\t\tb = inPixels[offset++];\n\n\t\tindexedPixels[i] = getClosestPaletteColorIndex(r, g, b, palette, paletteLength);\n\n\t}\n\n\treturn indexedPixels;\n\n}\n\n\nfunction FloydSteinberg(inPixels, width, height, palette) {\n\tvar paletteLength = palette.length;\n\tvar offset = 0;\n\tvar indexedOffset = 0;\n\tvar r, g, b;\n\tvar widthLimit = width - 1;\n\tvar heightLimit = height - 1;\n\tvar offsetNextI, offsetNextJ;\n\tvar offsetPrevINextJ;\n\tvar channels, nextChannels;\n\tvar indexedPixels = new Uint8Array( width * height );\n\n\tfor(var j = 0; j < height; j++) {\n\t\tfor(var i = 0; i < width; i++) {\n\n\t\t\tr = colorClamp(inPixels[offset++]);\n\t\t\tg = colorClamp(inPixels[offset++]);\n\t\t\tb = colorClamp(inPixels[offset++]);\n\n\t\t\tvar colorIndex = getClosestPaletteColorIndex(r, g, b, palette, paletteLength);\n\t\t\tvar paletteColor = palette[colorIndex];\n\t\t\tvar closestColor = paletteColor[3];\n\n\t\t\t// We are done with finding the best value for this pixel\n\t\t\tindexedPixels[indexedOffset] = colorIndex;\n\n\t\t\t// Now find difference between assigned value and original color\n\t\t\t// and propagate that error forward\n\t\t\tvar errorR = r - paletteColor[0];\n\t\t\tvar errorG = g - paletteColor[1];\n\t\t\tvar errorB = b - paletteColor[2];\n\n\t\t\tif(i < widthLimit) {\n\n\t\t\t\toffsetNextI = offset + 1;\n\n\t\t\t\tinPixels[offsetNextI++] += (errorR * 7) >> 4;\n\t\t\t\tinPixels[offsetNextI++] += (errorG * 7) >> 4;\n\t\t\t\tinPixels[offsetNextI++] += (errorB * 7) >> 4;\n\n\t\t\t}\n\n\n\t\t\tif(j < heightLimit) {\n\n\t\t\t\tif(i > 0) {\n\n\t\t\t\t\toffsetPrevINextJ = offset - 1 + width;\n\n\t\t\t\t\tinPixels[offsetPrevINextJ++] += (errorR * 3) >> 4;\n\t\t\t\t\tinPixels[offsetPrevINextJ++] += (errorG * 3) >> 4;\n\t\t\t\t\tinPixels[offsetPrevINextJ++] += (errorB * 3) >> 4;\n\n\t\t\t\t}\n\n\t\t\t\toffsetNextJ = offset + width;\n\n\t\t\t\tinPixels[offsetNextJ++] += (errorR * 5) >> 4;\n\t\t\t\tinPixels[offsetNextJ++] += (errorG * 5) >> 4;\n\t\t\t\tinPixels[offsetNextJ++] += (errorB * 5) >> 4;\n\n\n\t\t\t\tif(i < widthLimit) {\n\n\t\t\t\t\tinPixels[offsetNextJ++] += errorR >> 4;\n\t\t\t\t\tinPixels[offsetNextJ++] += errorG >> 4;\n\t\t\t\t\tinPixels[offsetNextJ++] += errorB >> 4;\n\n\t\t\t\t}\n\n\t\t\t}\n\n\t\t\tindexedOffset++;\n\t\t}\n\t}\n\n\treturn indexedPixels;\n}\n\nmodule.exports = {\n\tBayer: BayerDithering,\n\tClosest: ClosestDithering,\n\tFloydSteinberg: FloydSteinberg\n};\n\n\n},{}],2:[function(require,module,exports){\nvar NeuQuant = require(\'./lib/NeuQuant\');\r\nvar Dithering = require(\'node-dithering\');\r\n\r\nfunction channelizePalette( palette ) {\r\n    var channelizedPalette = [];\r\n\r\n    for(var i = 0; i < palette.length; i++) {\r\n        var color = palette[i];\r\n\r\n        var r = (color & 0xFF0000) >> 16;\r\n        var g = (color & 0x00FF00) >>  8;\r\n        var b = (color & 0x0000FF);\r\n\r\n        channelizedPalette.push([ r, g, b, color ]);\r\n    }\r\n\r\n    return channelizedPalette;\r\n\r\n}\r\n\r\n\r\nfunction dataToRGB( data, width, height ) {\r\n    var i = 0;\r\n    var length = width * height * 4;\r\n    var rgb = [];\r\n\r\n    while(i < length) {\r\n        rgb.push( data[i++] );\r\n        rgb.push( data[i++] );\r\n        rgb.push( data[i++] );\r\n        i++; // for the alpha channel which we don\'t care about\r\n    }\r\n\r\n    return rgb;\r\n}\r\n\r\n\r\nfunction componentizedPaletteToArray(paletteRGB) {\r\n\r\n    var paletteArray = [];\r\n\r\n    for(var i = 0; i < paletteRGB.length; i += 3) {\r\n        var r = paletteRGB[ i ];\r\n        var g = paletteRGB[ i + 1 ];\r\n        var b = paletteRGB[ i + 2 ];\r\n        paletteArray.push(r << 16 | g << 8 | b);\r\n    }\r\n\r\n    return paletteArray;\r\n}\r\n\r\n\r\n// This is the "traditional" Animated_GIF style of going from RGBA to indexed color frames\r\nfunction processFrameWithQuantizer(imageData, width, height, sampleInterval) {\r\n\r\n    var rgbComponents = dataToRGB( imageData, width, height );\r\n    var nq = new NeuQuant(rgbComponents, rgbComponents.length, sampleInterval);\r\n    var paletteRGB = nq.process();\r\n    var paletteArray = new Uint32Array(componentizedPaletteToArray(paletteRGB));\r\n\r\n    var numberPixels = width * height;\r\n    var indexedPixels = new Uint8Array(numberPixels);\r\n\r\n    var k = 0;\r\n    for(var i = 0; i < numberPixels; i++) {\r\n        r = rgbComponents[k++];\r\n        g = rgbComponents[k++];\r\n        b = rgbComponents[k++];\r\n        indexedPixels[i] = nq.map(r, g, b);\r\n    }\r\n\r\n    return {\r\n        pixels: indexedPixels,\r\n        palette: paletteArray\r\n    };\r\n\r\n}\r\n\r\n\r\n// And this is a version that uses dithering against of quantizing\r\n// It can also use a custom palette if provided, or will build one otherwise\r\nfunction processFrameWithDithering(imageData, width, height, ditheringType, palette) {\r\n\r\n    // Extract component values from data\r\n    var rgbComponents = dataToRGB( imageData, width, height );\r\n\r\n\r\n    // Build palette if none provided\r\n    if(palette === null) {\r\n\r\n        var nq = new NeuQuant(rgbComponents, rgbComponents.length, 16);\r\n        var paletteRGB = nq.process();\r\n        palette = componentizedPaletteToArray(paletteRGB);\r\n\r\n    }\r\n\r\n    var paletteArray = new Uint32Array( palette );\r\n    var paletteChannels = channelizePalette( palette );\r\n\r\n    // Convert RGB image to indexed image\r\n    var ditheringFunction;\r\n\r\n    if(ditheringType === \'closest\') {\r\n        ditheringFunction = Dithering.Closest;\r\n    } else if(ditheringType === \'floyd\') {\r\n        ditheringFunction = Dithering.FloydSteinberg;\r\n    } else {\r\n        ditheringFunction = Dithering.Bayer;\r\n    }\r\n\r\n    pixels = ditheringFunction(rgbComponents, width, height, paletteChannels);\r\n\r\n    return ({\r\n        pixels: pixels,\r\n        palette: paletteArray\r\n    });\r\n\r\n}\r\n\r\n\r\n// ~~~\r\n\r\nfunction run(frame) {\r\n    var width = frame.width;\r\n    var height = frame.height;\r\n    var imageData = frame.data;\r\n    var dithering = frame.dithering;\r\n    var palette = frame.palette;\r\n    var sampleInterval = frame.sampleInterval;\r\n\r\n    if(dithering) {\r\n        return processFrameWithDithering(imageData, width, height, dithering, palette);\r\n    } else {\r\n        return processFrameWithQuantizer(imageData, width, height, sampleInterval);\r\n    }\r\n\r\n}\r\n\r\n\r\nself.onmessage = function(ev) {\r\n    var data = ev.data;\r\n    var response = run(data);\r\n    postMessage(response);\r\n};\r\n\n},{"./lib/NeuQuant":3,"node-dithering":1}],3:[function(require,module,exports){\n/*\r\n* NeuQuant Neural-Net Quantization Algorithm\r\n* ------------------------------------------\r\n*\r\n* Copyright (c) 1994 Anthony Dekker\r\n*\r\n* NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994. See\r\n* "Kohonen neural networks for optimal colour quantization" in "Network:\r\n* Computation in Neural Systems" Vol. 5 (1994) pp 351-367. for a discussion of\r\n* the algorithm.\r\n*\r\n* Any party obtaining a copy of these files from the author, directly or\r\n* indirectly, is granted, free of charge, a full and unrestricted irrevocable,\r\n* world-wide, paid up, royalty-free, nonexclusive right and license to deal in\r\n* this software and documentation files (the "Software"), including without\r\n* limitation the rights to use, copy, modify, merge, publish, distribute,\r\n* sublicense, and/or sell copies of the Software, and to permit persons who\r\n* receive copies from any such party to do so, with the only requirement being\r\n* that this copyright notice remain intact.\r\n*/\r\n\r\n/*\r\n* This class handles Neural-Net quantization algorithm\r\n* @author Kevin Weiner (original Java version - kweiner@fmsware.com)\r\n* @author Thibault Imbert (AS3 version - bytearray.org)\r\n* @version 0.1 AS3 implementation\r\n* @version 0.2 JS->AS3 "translation" by antimatter15\r\n* @version 0.3 JS clean up + using modern JS idioms by sole - http://soledadpenades.com\r\n* Also implement fix in color conversion described at http://stackoverflow.com/questions/16371712/neuquant-js-javascript-color-quantization-hidden-bug-in-js-conversion\r\n*/\r\n\r\nmodule.exports = function NeuQuant() {\r\n\r\n    var netsize = 256; // number of colours used\r\n\r\n    // four primes near 500 - assume no image has a length so large\r\n    // that it is divisible by all four primes\r\n    var prime1 = 499;\r\n    var prime2 = 491;\r\n    var prime3 = 487;\r\n    var prime4 = 503;\r\n\r\n    // minimum size for input image\r\n    var minpicturebytes = (3 * prime4);\r\n\r\n    // Network Definitions\r\n\r\n    var maxnetpos = (netsize - 1);\r\n    var netbiasshift = 4; // bias for colour values\r\n    var ncycles = 100; // no. of learning cycles\r\n\r\n    // defs for freq and bias\r\n    var intbiasshift = 16; // bias for fractions\r\n    var intbias = (1 << intbiasshift);\r\n    var gammashift = 10; // gamma = 1024\r\n    var gamma = (1 << gammashift);\r\n    var betashift = 10;\r\n    var beta = (intbias >> betashift); // beta = 1/1024\r\n    var betagamma = (intbias << (gammashift - betashift));\r\n\r\n    // defs for decreasing radius factor\r\n    // For 256 colors, radius starts at 32.0 biased by 6 bits\r\n    // and decreases by a factor of 1/30 each cycle\r\n    var initrad = (netsize >> 3);\r\n    var radiusbiasshift = 6;\r\n    var radiusbias = (1 << radiusbiasshift);\r\n    var initradius = (initrad * radiusbias);\r\n    var radiusdec = 30;\r\n\r\n    // defs for decreasing alpha factor\r\n    // Alpha starts at 1.0 biased by 10 bits\r\n    var alphabiasshift = 10;\r\n    var initalpha = (1 << alphabiasshift);\r\n    var alphadec;\r\n\r\n    // radbias and alpharadbias used for radpower calculation\r\n    var radbiasshift = 8;\r\n    var radbias = (1 << radbiasshift);\r\n    var alpharadbshift = (alphabiasshift + radbiasshift);\r\n    var alpharadbias = (1 << alpharadbshift);\r\n\r\n\r\n    // Input image\r\n    var thepicture;\r\n    // Height * Width * 3\r\n    var lengthcount;\r\n    // Sampling factor 1..30\r\n    var samplefac;\r\n\r\n    // The network itself\r\n    var network;\r\n    var netindex = [];\r\n\r\n    // for network lookup - really 256\r\n    var bias = [];\r\n\r\n    // bias and freq arrays for learning\r\n    var freq = [];\r\n    var radpower = [];\r\n\r\n    function NeuQuantConstructor(thepic, len, sample) {\r\n\r\n        var i;\r\n        var p;\r\n\r\n        thepicture = thepic;\r\n        lengthcount = len;\r\n        samplefac = sample;\r\n\r\n        network = new Array(netsize);\r\n\r\n        for (i = 0; i < netsize; i++) {\r\n            network[i] = new Array(4);\r\n            p = network[i];\r\n            p[0] = p[1] = p[2] = ((i << (netbiasshift + 8)) / netsize) | 0;\r\n            freq[i] = (intbias / netsize) | 0; // 1 / netsize\r\n            bias[i] = 0;\r\n        }\r\n\r\n    }\r\n\r\n    function colorMap() {\r\n        var map = [];\r\n        var index = new Array(netsize);\r\n        for (var i = 0; i < netsize; i++)\r\n            index[network[i][3]] = i;\r\n        var k = 0;\r\n        for (var l = 0; l < netsize; l++) {\r\n            var j = index[l];\r\n            map[k++] = (network[j][0]);\r\n            map[k++] = (network[j][1]);\r\n            map[k++] = (network[j][2]);\r\n        }\r\n        return map;\r\n    }\r\n\r\n    // Insertion sort of network and building of netindex[0..255]\r\n    // (to do after unbias)\r\n    function inxbuild() {\r\n        var i;\r\n        var j;\r\n        var smallpos;\r\n        var smallval;\r\n        var p;\r\n        var q;\r\n        var previouscol;\r\n        var startpos;\r\n\r\n        previouscol = 0;\r\n        startpos = 0;\r\n\r\n        for (i = 0; i < netsize; i++)\r\n        {\r\n\r\n            p = network[i];\r\n            smallpos = i;\r\n            smallval = p[1]; // index on g\r\n            // find smallest in i..netsize-1\r\n            for (j = i + 1; j < netsize; j++) {\r\n\r\n                q = network[j];\r\n\r\n                if (q[1] < smallval) { // index on g\r\n                    smallpos = j;\r\n                    smallval = q[1]; // index on g\r\n                }\r\n            }\r\n\r\n            q = network[smallpos];\r\n\r\n            // swap p (i) and q (smallpos) entries\r\n            if (i != smallpos) {\r\n                j = q[0];\r\n                q[0] = p[0];\r\n                p[0] = j;\r\n                j = q[1];\r\n                q[1] = p[1];\r\n                p[1] = j;\r\n                j = q[2];\r\n                q[2] = p[2];\r\n                p[2] = j;\r\n                j = q[3];\r\n                q[3] = p[3];\r\n                p[3] = j;\r\n            }\r\n\r\n            // smallval entry is now in position i\r\n            if (smallval != previouscol) {\r\n\r\n                netindex[previouscol] = (startpos + i) >> 1;\r\n\r\n                for (j = previouscol + 1; j < smallval; j++) {\r\n                    netindex[j] = i;\r\n                }\r\n\r\n                previouscol = smallval;\r\n                startpos = i;\r\n\r\n            }\r\n\r\n        }\r\n\r\n        netindex[previouscol] = (startpos + maxnetpos) >> 1;\r\n        for (j = previouscol + 1; j < 256; j++) {\r\n            netindex[j] = maxnetpos; // really 256\r\n        }\r\n\r\n    }\r\n\r\n\r\n    // Main Learning Loop\r\n\r\n    function learn() {\r\n        var i;\r\n        var j;\r\n        var b;\r\n        var g;\r\n        var r;\r\n        var radius;\r\n        var rad;\r\n        var alpha;\r\n        var step;\r\n        var delta;\r\n        var samplepixels;\r\n        var p;\r\n        var pix;\r\n        var lim;\r\n\r\n        if (lengthcount < minpicturebytes) {\r\n            samplefac = 1;\r\n        }\r\n\r\n        alphadec = 30 + ((samplefac - 1) / 3);\r\n        p = thepicture;\r\n        pix = 0;\r\n        lim = lengthcount;\r\n        samplepixels = lengthcount / (3 * samplefac);\r\n        delta = (samplepixels / ncycles) | 0;\r\n        alpha = initalpha;\r\n        radius = initradius;\r\n\r\n        rad = radius >> radiusbiasshift;\r\n        if (rad <= 1) {\r\n            rad = 0;\r\n        }\r\n\r\n        for (i = 0; i < rad; i++) {\r\n            radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));\r\n        }\r\n\r\n\r\n        if (lengthcount < minpicturebytes) {\r\n            step = 3;\r\n        } else if ((lengthcount % prime1) !== 0) {\r\n            step = 3 * prime1;\r\n        } else {\r\n\r\n            if ((lengthcount % prime2) !== 0) {\r\n                step = 3 * prime2;\r\n            } else {\r\n                if ((lengthcount % prime3) !== 0) {\r\n                    step = 3 * prime3;\r\n                } else {\r\n                    step = 3 * prime4;\r\n                }\r\n            }\r\n\r\n        }\r\n\r\n        i = 0;\r\n\r\n        while (i < samplepixels) {\r\n\r\n            b = (p[pix + 0] & 0xff) << netbiasshift;\r\n            g = (p[pix + 1] & 0xff) << netbiasshift;\r\n            r = (p[pix + 2] & 0xff) << netbiasshift;\r\n            j = contest(b, g, r);\r\n\r\n            altersingle(alpha, j, b, g, r);\r\n\r\n            if (rad !== 0) {\r\n                // Alter neighbours\r\n                alterneigh(rad, j, b, g, r);\r\n            }\r\n\r\n            pix += step;\r\n\r\n            if (pix >= lim) {\r\n                pix -= lengthcount;\r\n            }\r\n\r\n            i++;\r\n\r\n            if (delta === 0) {\r\n                delta = 1;\r\n            }\r\n\r\n            if (i % delta === 0) {\r\n                alpha -= alpha / alphadec;\r\n                radius -= radius / radiusdec;\r\n                rad = radius >> radiusbiasshift;\r\n\r\n                if (rad <= 1) {\r\n                    rad = 0;\r\n                }\r\n\r\n                for (j = 0; j < rad; j++) {\r\n                    radpower[j] = alpha * (((rad * rad - j * j) * radbias) / (rad * rad));\r\n                }\r\n\r\n            }\r\n\r\n        }\r\n\r\n    }\r\n\r\n    // Search for BGR values 0..255 (after net is unbiased) and return colour index\r\n    function map(b, g, r) {\r\n        var i;\r\n        var j;\r\n        var dist;\r\n        var a;\r\n        var bestd;\r\n        var p;\r\n        var best;\r\n\r\n        // Biggest possible distance is 256 * 3\r\n        bestd = 1000;\r\n        best = -1;\r\n        i = netindex[g]; // index on g\r\n        j = i - 1; // start at netindex[g] and work outwards\r\n\r\n        while ((i < netsize) || (j >= 0)) {\r\n\r\n            if (i < netsize) {\r\n\r\n                p = network[i];\r\n\r\n                dist = p[1] - g; // inx key\r\n\r\n                if (dist >= bestd) {\r\n                    i = netsize; // stop iter\r\n                } else {\r\n\r\n                    i++;\r\n\r\n                    if (dist < 0) {\r\n                        dist = -dist;\r\n                    }\r\n\r\n                    a = p[0] - b;\r\n\r\n                    if (a < 0) {\r\n                        a = -a;\r\n                    }\r\n\r\n                    dist += a;\r\n\r\n                    if (dist < bestd) {\r\n                        a = p[2] - r;\r\n\r\n                        if (a < 0) {\r\n                            a = -a;\r\n                        }\r\n\r\n                        dist += a;\r\n\r\n                        if (dist < bestd) {\r\n                            bestd = dist;\r\n                            best = p[3];\r\n                        }\r\n                    }\r\n\r\n                }\r\n\r\n            }\r\n\r\n            if (j >= 0) {\r\n\r\n                p = network[j];\r\n\r\n                dist = g - p[1]; // inx key - reverse dif\r\n\r\n                if (dist >= bestd) {\r\n                    j = -1; // stop iter\r\n                } else {\r\n\r\n                    j--;\r\n                    if (dist < 0) {\r\n                        dist = -dist;\r\n                    }\r\n                    a = p[0] - b;\r\n                    if (a < 0) {\r\n                        a = -a;\r\n                    }\r\n                    dist += a;\r\n\r\n                    if (dist < bestd) {\r\n                        a = p[2] - r;\r\n                        if (a < 0) {\r\n                            a = -a;\r\n                        }\r\n                        dist += a;\r\n                        if (dist < bestd) {\r\n                            bestd = dist;\r\n                            best = p[3];\r\n                        }\r\n                    }\r\n\r\n                }\r\n\r\n            }\r\n\r\n        }\r\n\r\n        return (best);\r\n\r\n    }\r\n\r\n    function process() {\r\n        learn();\r\n        unbiasnet();\r\n        inxbuild();\r\n        return colorMap();\r\n    }\r\n\r\n    // Unbias network to give byte values 0..255 and record position i\r\n    // to prepare for sort\r\n    function unbiasnet() {\r\n        var i;\r\n        var j;\r\n\r\n        for (i = 0; i < netsize; i++) {\r\n            network[i][0] >>= netbiasshift;\r\n            network[i][1] >>= netbiasshift;\r\n            network[i][2] >>= netbiasshift;\r\n            network[i][3] = i; // record colour no\r\n        }\r\n    }\r\n\r\n    // Move adjacent neurons by precomputed alpha*(1-((i-j)^2/[r]^2))\r\n    // in radpower[|i-j|]\r\n    function alterneigh(rad, i, b, g, r) {\r\n\r\n        var j;\r\n        var k;\r\n        var lo;\r\n        var hi;\r\n        var a;\r\n        var m;\r\n\r\n        var p;\r\n\r\n        lo = i - rad;\r\n        if (lo < -1) {\r\n            lo = -1;\r\n        }\r\n\r\n        hi = i + rad;\r\n\r\n        if (hi > netsize) {\r\n            hi = netsize;\r\n        }\r\n\r\n        j = i + 1;\r\n        k = i - 1;\r\n        m = 1;\r\n\r\n        while ((j < hi) || (k > lo)) {\r\n\r\n            a = radpower[m++];\r\n\r\n            if (j < hi) {\r\n\r\n                p = network[j++];\r\n\r\n                try {\r\n\r\n                    p[0] -= ((a * (p[0] - b)) / alpharadbias) | 0;\r\n                    p[1] -= ((a * (p[1] - g)) / alpharadbias) | 0;\r\n                    p[2] -= ((a * (p[2] - r)) / alpharadbias) | 0;\r\n\r\n                } catch (e) {}\r\n\r\n            }\r\n\r\n            if (k > lo) {\r\n\r\n                p = network[k--];\r\n\r\n                try {\r\n\r\n                    p[0] -= ((a * (p[0] - b)) / alpharadbias) | 0;\r\n                    p[1] -= ((a * (p[1] - g)) / alpharadbias) | 0;\r\n                    p[2] -= ((a * (p[2] - r)) / alpharadbias) | 0;\r\n\r\n                } catch (e) {}\r\n\r\n            }\r\n\r\n        }\r\n\r\n    }\r\n\r\n\r\n    // Move neuron i towards biased (b,g,r) by factor alpha\r\n    function altersingle(alpha, i, b, g, r) {\r\n\r\n        // alter hit neuron\r\n        var n = network[i];\r\n        var alphaMult = alpha / initalpha;\r\n        n[0] -= ((alphaMult * (n[0] - b))) | 0;\r\n        n[1] -= ((alphaMult * (n[1] - g))) | 0;\r\n        n[2] -= ((alphaMult * (n[2] - r))) | 0;\r\n\r\n    }\r\n\r\n    // Search for biased BGR values\r\n    function contest(b, g, r) {\r\n\r\n        // finds closest neuron (min dist) and updates freq\r\n        // finds best neuron (min dist-bias) and returns position\r\n        // for frequently chosen neurons, freq[i] is high and bias[i] is negative\r\n        // bias[i] = gamma*((1/netsize)-freq[i])\r\n\r\n        var i;\r\n        var dist;\r\n        var a;\r\n        var biasdist;\r\n        var betafreq;\r\n        var bestpos;\r\n        var bestbiaspos;\r\n        var bestd;\r\n        var bestbiasd;\r\n        var n;\r\n\r\n        bestd = ~(1 << 31);\r\n        bestbiasd = bestd;\r\n        bestpos = -1;\r\n        bestbiaspos = bestpos;\r\n\r\n        for (i = 0; i < netsize; i++) {\r\n\r\n            n = network[i];\r\n            dist = n[0] - b;\r\n\r\n            if (dist < 0) {\r\n                dist = -dist;\r\n            }\r\n\r\n            a = n[1] - g;\r\n\r\n            if (a < 0) {\r\n                a = -a;\r\n            }\r\n\r\n            dist += a;\r\n\r\n            a = n[2] - r;\r\n\r\n            if (a < 0) {\r\n                a = -a;\r\n            }\r\n\r\n            dist += a;\r\n\r\n            if (dist < bestd) {\r\n                bestd = dist;\r\n                bestpos = i;\r\n            }\r\n\r\n            biasdist = dist - ((bias[i]) >> (intbiasshift - netbiasshift));\r\n\r\n            if (biasdist < bestbiasd) {\r\n                bestbiasd = biasdist;\r\n                bestbiaspos = i;\r\n            }\r\n\r\n            betafreq = (freq[i] >> betashift);\r\n            freq[i] -= betafreq;\r\n            bias[i] += (betafreq << gammashift);\r\n\r\n        }\r\n\r\n        freq[bestpos] += beta;\r\n        bias[bestpos] -= betagamma;\r\n        return (bestbiaspos);\r\n\r\n    }\r\n\r\n    NeuQuantConstructor.apply(this, arguments);\r\n\r\n    var exports = {};\r\n    exports.map = map;\r\n    exports.process = process;\r\n\r\n    return exports;\r\n}\r\n\n},{}]},{},[2])'], {type: "text/javascript"})));
                    workers.push(w);
                    availableWorkers.push(w);
                }

                // ---

                // Return a worker for processing a frame
                function getWorker() {
                    if (availableWorkers.length === 0) {
                        throw ('No workers left!');
                    }

                    return availableWorkers.pop();
                }

                // Restore a worker to the pool
                function freeWorker(worker) {
                    availableWorkers.push(worker);
                }

                // Faster/closurized bufferToString function
                // (caching the String.fromCharCode values)
                var bufferToString = (function () {
                    var byteMap = [];
                    for (var i = 0; i < 256; i++) {
                        byteMap[i] = String.fromCharCode(i);
                    }

                    return (function (buffer) {
                        var numberValues = buffer.length;
                        var str = '';

                        for (var i = 0; i < numberValues; i++) {
                            str += byteMap[buffer[i]];
                        }

                        return str;
                    });
                })();

                function startRendering(completeCallback) {
                    var numFrames = frames.length;

                    onRenderCompleteCallback = completeCallback;

                    for (var i = 0; i < numWorkers && i < frames.length; i++) {
                        processFrame(i);
                    }
                }

                function processFrame(position) {
                    var frame;
                    var worker;

                    frame = frames[position];

                    if (frame.beingProcessed || frame.done) {
                        console.error('Frame already being processed or done!', frame.position);
                        onFrameFinished();
                        return;
                    }

                    frame.sampleInterval = sampleInterval;
                    frame.beingProcessed = true;

                    worker = getWorker();

                    worker.onmessage = function (ev) {
                        var data = ev.data;

                        // Delete original data, and free memory
                        delete (frame.data);

                        // TODO grrr... HACK for object -> Array
                        frame.pixels = Array.prototype.slice.call(data.pixels);
                        frame.palette = Array.prototype.slice.call(data.palette);
                        frame.done = true;
                        frame.beingProcessed = false;

                        freeWorker(worker);

                        onFrameFinished();
                    };


                    // TODO transfer objects should be more efficient
                    /*var frameData = frame.data;
                    //worker.postMessage(frameData, [frameData]);
                    worker.postMessage(frameData);*/

                    worker.postMessage(frame);
                }

                function processNextFrame() {

                    var position = -1;

                    for (var i = 0; i < frames.length; i++) {
                        var frame = frames[i];
                        if (!frame.done && !frame.beingProcessed) {
                            position = i;
                            break;
                        }
                    }

                    if (position >= 0) {
                        processFrame(position);
                    }
                }


                function onFrameFinished() { // ~~~ taskFinished

                    // The GIF is not written until we're done with all the frames
                    // because they might not be processed in the same order
                    var allDone = frames.every(function (frame) {
                        return !frame.beingProcessed && frame.done;
                    });

                    numRenderedFrames++;
                    onRenderProgressCallback(numRenderedFrames * 0.75 / frames.length);

                    if (allDone) {
                        if (!generatingGIF) {
                            generateGIF(frames, onRenderCompleteCallback);
                        }
                    } else {
                        setTimeout(processNextFrame, 1);
                    }

                }


                // Takes the already processed data in frames and feeds it to a new
                // GifWriter instance in order to get the binary GIF file
                function generateGIF(frames, callback) {

                    // TODO: Weird: using a simple JS array instead of a typed array,
                    // the files are WAY smaller o_o. Patches/explanations welcome!
                    var buffer = []; // new Uint8Array(width * height * frames.length * 5);
                    var globalPalette;
                    var gifOptions = {loop: repeat};

                    // Using global palette but only if we're also using dithering
                    if (dithering !== null && palette !== null) {
                        globalPalette = palette;
                        gifOptions.palette = globalPalette;
                    }

                    var gifWriter = new GifWriter(buffer, width, height, gifOptions);

                    generatingGIF = true;

                    frames.forEach(function (frame, index) {

                        var framePalette;

                        if (!globalPalette) {
                            framePalette = frame.palette;
                        }

                        onRenderProgressCallback(0.75 + 0.25 * frame.position * 1.0 / frames.length);
                        gifWriter.addFrame(0, 0, width, height, frame.pixels, {
                            palette: framePalette,
                            delay: frame.delay,
                            transparent: transparent ? frame.pixels[0] : undefined,
                            disposal: disposal,
                        });
                    });

                    gifWriter.end();
                    onRenderProgressCallback(1.0);

                    frames = [];
                    generatingGIF = false;

                    callback(buffer);
                }


                function powerOfTwo(value) {
                    return (value !== 0) && ((value & (value - 1)) === 0);
                }


                // ---

                this.setSize = function (w, h) {
                    width = w;
                    height = h;
                    canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    ctx = canvas.getContext('2d');
                };

                // Internally, GIF uses tenths of seconds to store the delay
                this.setDelay = function (seconds) {
                    delay = seconds * 0.1;
                };

                // From GIF: 0 = loop forever, null = not looping, n > 0 = loop n times and stop
                this.setRepeat = function (r) {
                    repeat = r;
                };

                this.addFrame = function (element, opts) {

                    if (ctx === null) {
                        this.setSize(width, height);
                    }
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(element, 0, 0, width, height);
                    var imageData = ctx.getImageData(0, 0, width, height);

                    this.addFrameImageData(imageData, opts);
                };

                this.addFrameImageData = function (imageData, opts) {
                    opts = opts || {};

                    var dataLength = imageData.length,
                        imageDataArray = new Uint8Array(imageData.data);

                    frames.push({
                        data: imageDataArray,
                        width: imageData.width,
                        height: imageData.height,
                        delay: opts.delay !== undefined ? (opts.delay * 0.1) : delay,
                        palette: palette,
                        dithering: dithering,
                        done: false,
                        beingProcessed: false,
                        position: frames.length
                    });
                };

                this.onRenderProgress = function (callback) {
                    onRenderProgressCallback = callback;
                };

                this.isRendering = function () {
                    return generatingGIF;
                };

                this.getBase64GIF = function (completeCallback) {

                    var onRenderComplete = function (buffer) {
                        var str = bufferToString(buffer);
                        var gif = 'data:image/gif;base64,' + btoa(str);
                        completeCallback(gif);
                    };

                    startRendering(onRenderComplete);

                };


                this.getBlobGIF = function (completeCallback) {

                    var onRenderComplete = function (buffer) {
                        var array = new Uint8Array(buffer);
                        var blob = new Blob([array], {type: 'image/gif'});
                        completeCallback(blob);
                    };

                    startRendering(onRenderComplete);

                };


                // Once this function is called, the object becomes unusable
                // and you'll need to create a new one.
                this.destroy = function () {

                    // Explicitly ask web workers to die so they are explicitly GC'ed
                    workers.forEach(function (w) {
                        w.terminate();
                    });

                };

            }

// Not using the full blown exporter because this is supposed to be built
// into dist/Animated_GIF.js using a build step with browserify
            module.exports = Animated_GIF;

        }, {"omggif": 1}]
    }, {}, [2])(2)
});
