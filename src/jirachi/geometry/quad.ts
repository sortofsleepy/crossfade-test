import {Geometry} from "../interfaces";
export default class Quad implements Geometry {
    vertices:Array<any> = [];
    normals:Array<any> = [];
    uvs:Array<any> = [];
    indices:Array<any> = [];
    constructor() {
        this.vertices = [-1, -1, -1, 4, 4, -1];
    }
}

