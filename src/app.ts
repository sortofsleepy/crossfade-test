import createRenderer from './jirachi/core/gl'
import createShader from './jirachi/core/shader'
import createTexture from "./jirachi/core/texture"
import {ShaderFormat,TextureFormat} from './jirachi/core/formats'
import AssetLoader from './jirachi/loaders/AssetLoader'
import * as frag from './frag.glsl'
import * as vert from './jirachi/shaders/plane.vert'
import Mesh from './jirachi/framework/mesh'
import ControlKit from 'controlkit'

import m60 from '../public/m60.jpg'
import thermal from '../public/thermal.jpg'
import transition from '../public/transition.png'

const gl = createRenderer();
let node = document.querySelector("#APP");
node.appendChild(gl.canvas);
gl.canvas.width = window.innerWidth;
gl.canvas.height = window.innerHeight;

const kit = new ControlKit();

const v = vert.default;
const f = frag.default;

// =========== SETUP CONTROLS ============= //

let settings = {
    transition:{

        "Transition":0,
        range:[0,1]
    },
    transitionSpeed:{
        "Transition Speed":0.5,
        range:[0,5]
    },
    textureThreshold:{
        "Threshold":0.3,
        range:[0,1]
    }
}


const panel = kit.addPanel({
    label:"Settings"
})

panel.addSlider(settings.transitionSpeed,"Transition Speed",'range',{
    step:0.01
});
panel.addSlider(settings.transition,"Transition",'range',{
    step:0.01
});
panel.addSlider(settings.textureThreshold,"Threshold",'range',{
    step:0.01
});
// =========== SETUP MESH ============ //

const shader = createShader(gl,new ShaderFormat(v,f));

const mesh = new Mesh(shader);
mesh.addAttribute("position",[
    -1, -1, -1, 4, 4, -1
],{
    size:2
});

// ======= SETUP TEXTURES ========= //
let img = new Image();
img.src = m60;

let img2 = new Image();
img2.src = thermal;

let transitionImage = new Image();
transitionImage.src = transition;

let tex,tex2,transitionTex;


AssetLoader.loadImageAssets([img,img2,transitionImage]).then(e => {
    
    tex = createTexture(gl,new TextureFormat(gl,{
        data:e[0]
    }));

    tex2 = createTexture(gl,new TextureFormat(gl,{
        data:e[1]
    }))

    transitionTex = createTexture(gl, new TextureFormat(gl,{
        data:e[2]
    }))

    // delay a bit to allow for texture creation.
    setTimeout(e => {
        animate();
    },1400)

})
// =========== ANIMATE ============= //


function animate(){
    requestAnimationFrame(animate);
    gl.clearScreen();


    
    tex.bind();
    tex2.bind(1);
    transitionTex.bind(2);

    

    mesh.draw();
    //console.log(settings.textureThreshold.Threshold);

    mesh.shader.float("threshold",settings.textureThreshold.Threshold);
    mesh.shader.float("mixRatio",settings.transition.Transition);
    mesh.shader.int("tDiffuse1",0);
    mesh.shader.int("tDiffuse2",1);
    mesh.shader.int("tMixTexture",2);
}