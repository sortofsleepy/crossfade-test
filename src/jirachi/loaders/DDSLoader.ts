// adapted parse-dds npm package in es6 module format.
// original here https://github.com/Jam3/parse-dds.
// and here https://github.com/yiwenl/Alfrid/blob/0ae538184ac54eb9ab96e7cd0fc2b26e5e248d31/src/alfrid/GLCubeTexture.js

const  DDS_MAGIC = 0x20534444
const DDSD_MIPMAPCOUNT = 0x20000
const DDPF_FOURCC = 0x4
const OFF_MIPMAPCOUNT = 7;

let FOURCC_DXT1 = fourCCToInt32('DXT1')
let FOURCC_DXT3 = fourCCToInt32('DXT3')
let FOURCC_DXT5 = fourCCToInt32('DXT5')
let FOURCC_DX10 = fourCCToInt32('DX10')
let FOURCC_FP32F = 116 // DXGI_FORMAT_R32G32B32A32_FLOAT

let DDSCAPS2_CUBEMAP = 0x200
let D3D10_RESOURCE_DIMENSION_TEXTURE2D = 3
let DXGI_FORMAT_R32G32B32A32_FLOAT = 2

// The header length in 32 bit ints
let headerLengthInt = 31

// Offsets into the header array
let off_magic = 0
let off_size = 1
let off_flags = 2
let off_height = 3
let off_width = 4
let off_mipmapCount = 7
let off_pfFlags = 20
let off_pfFourCC = 21
let off_caps2 = 28



function parseHeaders (arrayBuffer) {
    let header = new Int32Array(arrayBuffer, 0, headerLengthInt)

    if (header[off_magic] !== DDS_MAGIC) {
        throw new Error('Invalid magic number in DDS header')
    }

    // @ts-ignore
    if (!header[off_pfFlags] & DDPF_FOURCC) {
        throw new Error('Unsupported format, must contain a FourCC code')
    }

    let blockBytes
    let format
    let fourCC = header[off_pfFourCC]
    switch (fourCC) {
        case FOURCC_DXT1:
            blockBytes = 8
            format = 'dxt1'
            break
        case FOURCC_DXT3:
            blockBytes = 16
            format = 'dxt3'
            break
        case FOURCC_DXT5:
            blockBytes = 16
            format = 'dxt5'
            break
        case FOURCC_FP32F:
            format = 'rgba32f'
            break
        case FOURCC_DX10:
            let dx10Header = new Uint32Array(arrayBuffer.slice(128, 128 + 20))
            format = dx10Header[0]
            let resourceDimension = dx10Header[1]
            let miscFlag = dx10Header[2]
            let arraySize = dx10Header[3]
            let miscFlags2 = dx10Header[4]

            if (resourceDimension === D3D10_RESOURCE_DIMENSION_TEXTURE2D && format === DXGI_FORMAT_R32G32B32A32_FLOAT) {
                format = 'rgba32f'
            } else {
                throw new Error('Unsupported DX10 texture format ' + format)
            }
            break
        default:
            throw new Error('Unsupported FourCC code: ' + int32ToFourCC(fourCC))
    }

    let flags = header[off_flags]
    let mipmapCount = 1

    if (flags & DDSD_MIPMAPCOUNT) {
        mipmapCount = Math.max(1, header[off_mipmapCount])
    }

    let cubemap = false
    let caps2 = header[off_caps2]
    if (caps2 & DDSCAPS2_CUBEMAP) {
        cubemap = true
    }

    let width = header[off_width]
    let height = header[off_height]
    let dataOffset = header[off_size] + 4
    let texWidth = width
    let texHeight = height
    let images = []
    let dataLength

    if (fourCC === FOURCC_DX10) {
        dataOffset += 20
    }

    if (cubemap) {
        for (let f = 0; f < 6; f++) {
            if (format !== 'rgba32f') {
                throw new Error('Only RGBA32f cubemaps are supported')
            }
            let bpp = 4 * 32 / 8

            width = texWidth
            height = texHeight

            // cubemap should have all mipmap levels defined
            // Math.log2(width) + 1
            let requiredMipLevels = Math.log(width) / Math.log(2) + 1

            for (let i = 0; i < requiredMipLevels; i++) {
                dataLength = width * height * bpp
                images.push({
                    offset: dataOffset,
                    length: dataLength,
                    shape: [ width, height ]
                })
                // Reuse data from the previous level if we are beyond mipmapCount
                // This is hack for CMFT not publishing full mipmap chain https://github.com/dariomanesku/cmft/issues/10
                if (i < mipmapCount) {
                    dataOffset += dataLength
                }
                width = Math.floor(width / 2)
                height = Math.floor(height / 2)
            }
        }
    } else {
        for (let i = 0; i < mipmapCount; i++) {
            dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes

            images.push({
                offset: dataOffset,
                length: dataLength,
                shape: [ width, height ]
            })
            dataOffset += dataLength
            width = Math.floor(width / 2)
            height = Math.floor(height / 2)
        }
    }

    return {
        shape: [ texWidth, texHeight ],
        images: images,
        format: format,
        flags: flags,
        cubemap: cubemap
    }
}

function fourCCToInt32 (value) {
    return value.charCodeAt(0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24)
}

function int32ToFourCC (value) {
    return String.fromCharCode(
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff
    )
}

/**
 * Parses a DDS image file loaded as an ArrayBuffer
 * @param mArrayBuffer {ArrayBuffer} an ArrayBuffer containing the loaded dds data
 * @returns {Array} parseable array for loading into a cubemap
 */
export default function parseDDS(mArrayBuffer){
    //	CHECKING MIP MAP LEVELS
    const ddsInfos = parseHeaders(mArrayBuffer);
    const { flags } = ddsInfos;
    const header = new Int32Array(mArrayBuffer, 0, headerLengthInt);
    let mipmapCount = 1;
    if (flags & DDSD_MIPMAPCOUNT) {
        mipmapCount = Math.max(1, header[OFF_MIPMAPCOUNT]);
    }
    //const DDSD_MIPMAPCOUNT = 0x20000;
    //const OFF_MIPMAPCOUNT = 7;
    //const headerLengthInt = 31;
    const sources = ddsInfos.images.map((img) => {
        const faceData = new Float32Array(mArrayBuffer.slice(img.offset, img.offset + img.length));
        return {
            data: faceData,
            shape: img.shape,
            mipmapCount,
        };
    });

    return sources;
}