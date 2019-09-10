import mat4 from '../math/mat4'
import vec3 from '../math/vec3'
import {Camera} from "../interfaces";

/**
 * The basic components of a camera
 */
export class CameraBase implements Camera{
    projectionMatrix:Array<any>;
    viewMatrix:Array<any>;
    near:number;
    far:number;
    fov:number;
    aspect:number;
    eye:Array<any> = vec3.create();
    target:Array<any> = vec3.create();
    center:Array<any> = vec3.create();
    position:Array<any> = vec3.create();
    up:Array<any> = vec3.create(0,1,0);
    zoom:number;
    constructor() {}


    /**
     * Translates the view matrix
     * @param vector {Array} the vector to move the view matrix by.
     */
    translate(vector:[number,number,number]){
        mat4.translate(this.viewMatrix,this.viewMatrix,vector);
        return this;
    }

    /**
     * Resets the view matrix to an identity matrix.
     */
    resetView(){
        mat4.identity(this.viewMatrix);
        return this;
    }

    /**
     * Sets field of view for a camera
     * @param fov {number} the field of view for the camera.
     */
    setFov(fov:number){
        this.fov = fov;
        return this;
    }

    /**
     * resizes the aspect ratio for the camera.
     * @param aspectRatio {number} the aspect ratio for the cmaera
     */
    resize(aspectRatio:number){}

    cameraLookAt(eye:[number,number,number],aCenter?:[number,number,number]){
        this.eye = vec3.clone(eye);
        this.center = aCenter !== undefined ? vec3.clone(aCenter) : this.center;

        vec3.copy(this.position,eye);
        mat4.identity(this.viewMatrix);
        mat4.lookAt(this.viewMatrix,eye,this.center,this.up)
        return this;
    }

    /**
     * Sets the zoom of the camera
     * @param zoom {number} the zoom amount.
     */
    setZoom(zoom:number){
        this.zoom = zoom;
        this.position = [0,0,zoom];

        this.cameraLookAt([0,0,0])
        mat4.translate(this.viewMatrix,this.viewMatrix,[0,0,zoom]);

        return this;
    }
}

/**
 * The basic definition of a PerspectiveCamera
 */
export class PerspectiveCamera extends CameraBase{

    constructor({
                    fov = Math.PI / 4,
                    aspect = window.innerWidth / window.innerHeight,
                    near = 0.1,
                    far = 1000.0
                }={}) {
        super();

        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;


        mat4.perspective(this.projectionMatrix,fov,aspect,near,far);

        return this;
    }

    resize(aspectRatio:number): void {
        this.aspect = aspectRatio;
        mat4.perspective(this.projectionMatrix,this.fov,this.aspect,this.near,this.far);
    }


}

/**
 * Basic components of an orthographic camera
 */
export class OrthoCamera extends CameraBase{

    constructor(fov:number,aspect:number,near:number,far:number) {
        super();
        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        mat4.perspective(this.projectionMatrix,fov,aspect,near,far);

        return this;
    }

}