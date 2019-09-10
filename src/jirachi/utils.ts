import mat4 from "./math/mat4";
import mat3 from "./math/mat3";

window["jraDebug"] = false;
window["toggleDebug"] = function(){
    window["jraDebug"] = !window["jraDebug"];
};

/**
 * Checks to see if a value is a vector 3. Assumes vector 3 is
 * in an Array
 * @param val {Array}
 * @returns {boolean}
 */
export function isVec3(val){
    if(val instanceof Array){
        if(val.length === 3){
            return true;
        }else{
            return false;
        }
    }
}

/**
 * Checks the context to ensure it has the desired extension enabled
 * @param ctx {WebGLRenderingContext} the webgl context to check
 * @param extension {String} the name of the extension to look for
 */
export function checkExtension(ctx,extension){
    if(ctx.getExtension(extension)){
        return true;
    }else{
        return false;
    }
}

/**
 * Converts a WebGL enum to a string
 * @param {WebGLRenderingContext} gl The WebGLContext to use.
 * @param {number} value The enum value.
 * @return {string} The enum as a string.
 */
export function enumToString(gl,value){
    for (let p in gl) {
        if (gl[p] === value) {
            return p;
        }
    }
    return "0x" + value.toString(16);
}

/**
 * Logs an error message when window.jraDebug is set to true. If renderImmediate
 * is true, the message renders regardless.
 * @param message {String} the message to log
 * @param renderImmediate {Boolean} whether or not to render the message right away.
 */
export function logError(message,renderImmediate=false){
    let css = "background:red;color:white; padding-left:2px; padding-right:2px;";
    if(window["jraDebug"] || renderImmediate){
        console.log(`%c ${message}`,css);
    }
}


/**
 * Logs an warning message when window.jraDebug is set to true. If renderImmediate
 * is true, the message renders regardless.
 * @param message {String} the message to log
 * @param renderImmediate {Boolean} whether or not to render the message right away.
 */
export function logWarn(message,renderImmediate){
    let css = "background:yellow;color:red; padding-left:2px; padding-right:2px;";
    if(window["jraDebug"] || renderImmediate){
        console.log(`%c ${message}`,css);
    }
}


/**
 * Logs an regular message when window.jraDebug is set to true. If renderImmediate
 * is true, the message renders regardless.
 * @param message {String} the message to log
 * @param renderImmediate {Boolean} whether or not to render the message right away.
 */
export function log(message,renderImmediate=false){
    let css = "background:#46A6B2;padding:4px; color:white;";
    if(window["jraDebug"] || renderImmediate){
        console.log(`%c ${message}`,css);
    }
}


/**
 * Validates an array to ensure that it is a suitable value for passing to GLSL.
 * @param array {Array} an array that you want to feed into a uniform.
 * @returns {boolean}
 */
export function validateLength(array){

    let isValid = null;
    switch (array.length){
        case 3:
            isValid = 3;
            break;

        case 2:
            isValid = 2;
            break;

        case 4:
            isValid = 4;
            break;

        case 9:
            isValid = 9;
            break;

        case 16:
            isValid = 16;
            break;
    }
    return isValid
}

/**
 * Checks to see if a value is an integer or a floating point value
 * @param n {Number} a value to check
 * @returns {boolean}
 */
export function isInt(n){
    return n % 1 === 0;
}

export function transformDirectionByMatrix(out,v,m){
    var x = v[0], y = v[1], z = v[2];
    out[0] = m[0] * x + m[4] * y + m[8] * z;
    out[1] = m[1] * x + m[5] * y + m[9] * z;
    out[2] = m[2] * x + m[6] * y + m[10] * z;
    out[3] = m[3] * x + m[7] * y + m[11] * z;
    return out;
}

/**
 * Calculates a normal matrix.
 * @param modelMatrix {Float32Array} A model matrix
 * @param viewMatrix {Float32Array} a view matrix
 * @returns {mat3} returns calculated normal matrix.
 */
export function calculateNormalMatrix(modelMatrix,viewMatrix){
    let model = modelMatrix;
    let normalMatrix = mat3.create();

    // calculate modelView
    let mv = mat4.create();
    let modelView = mat4.multiply(mv,modelMatrix,viewMatrix);

    // reset matrices
    mat4.identity(modelView);
    mat3.identity(normalMatrix);

    // calculate model view matrix
    mat4.multiply(modelView,model,viewMatrix);

    // convert model view into mat3
    mat3.fromMat4(normalMatrix,modelView);

    // invert
    mat3.invert(normalMatrix,normalMatrix);

    // transpose
    mat3.transpose(normalMatrix,normalMatrix);

    return normalMatrix;

}
