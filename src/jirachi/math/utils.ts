/**
 * Assigns the values of one matrix into another.
 * @param mat1 {Array} A matrix array. Usually a TypedArray
 * @param mat2 {Array} the matrix to pass values from, usually also a TypedArray.
 */
export function assignFromMatrix(mat1,mat2){
    if(mat1.length === mat2.length){
        let mat1len = mat1.length;
        for(var i = 0; i < mat1len; ++i){
            mat1[i] = mat2[i];
        }
    }else{
        console.error("assignFromMatrix:error - mat1 and mat2 have different lengths");
    }
}


let floatView = new Float32Array(1);
let int32View = new Int32Array(floatView.buffer);

/**
 * Converts a regular floating point value to a half-float value
 * @param fval {Number} a floating point value.
 * @returns {number}
 */
export function toHalfFloat( fval ) {

    floatView[0] = fval;
    var fbits = int32View[0];
    var sign  = (fbits >> 16) & 0x8000;          // sign only
    var val   = ( fbits & 0x7fffffff ) + 0x1000; // rounded value

    if( val >= 0x47800000 ) {             // might be or become NaN/Inf
        if( ( fbits & 0x7fffffff ) >= 0x47800000 ) {
            // is or must become NaN/Inf
            if( val < 0x7f800000 ) {          // was value but too large
                return sign | 0x7c00;           // make it +/-Inf
            }
            return sign | 0x7c00 |            // remains +/-Inf or NaN
                ( fbits & 0x007fffff ) >> 13; // keep NaN (and Inf) bits
        }
        return sign | 0x7bff;               // unrounded not quite Inf
    }
    if( val >= 0x38800000 ) {             // remains normalized value
        return sign | val - 0x38000000 >> 13; // exp - 127 + 15
    }
    if( val < 0x33000000 )  {             // too small for subnormal
        return sign;                        // becomes +/-0
    }
    val = ( fbits & 0x7fffffff ) >> 23;   // tmp exp for subnormal calc
    return sign | ( ( fbits & 0x7fffff | 0x800000 ) // add subnormal bit
        + ( 0x800000 >>> val - 102 )     // round depending on cut off
        >> 126 - val );                  // div by 2^(1-(exp-127+15)) and >> 13 | exp=0
};
