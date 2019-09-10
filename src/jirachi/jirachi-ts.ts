import createRenderer from './core/gl'
import createBuffer from './core/vbo'
import createVao from './core/vao'
import createTexture from './core/texture'
import createShader from './core/shader'
import Mesh from './framework/mesh'
import createFbo from './core/fbo'
import {ShaderFormat,TextureFormat} from './core/formats'
import {OrthoCamera,PerspectiveCamera} from './framework/camera'


module.exports = {
    // functions
    createContext:createRenderer,
    createBuffer:createBuffer,
    createVao:createVao,
    createTexture:createTexture,
    createShader:createShader,
    createFbo:createFbo,

    // objects
    ShaderFormat:ShaderFormat,
    TextureFormat:TextureFormat,
    Mesh:Mesh,
    PerspectiveCamera:PerspectiveCamera,
    OrthoCamera:OrthoCamera
}