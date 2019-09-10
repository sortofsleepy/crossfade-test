import {Geometry} from "../interfaces";

/**
 * Based off of @vorg's primitive-plane package.
 * Mostly the same but with some minor modifications.
 * https://github.com/vorg/primitive-plane
 */
export default class Plane implements Geometry{
    vertices:Array<any> = [];
    normals:Array<any> = [];
    indices:Array<any> = [];
    uvs:Array<any> = [];
    constructor(sx=1,sy=1,nx=1,ny=1,options?){
        let quads = (options && options.quads) ? options.quads : false
        let resolution = (options && options.resolution) ? options.resolution : 1


        for (let iy = 0; iy <= ny; iy++) {
            for (let ix = 0; ix <= nx; ix++) {
                let u = ix / nx
                let v = iy / ny

                let x = -sx / 2 + u * sx // starts on the left
                let y = sy / 2 - v * sy // starts at the top
                let z = (ix * resolution);


                this.vertices.push(x, y, 0)
                this.uvs.push(u, 1.0 - v)
                this.normals.push(0, 0, 1)

                if (iy < ny && ix < nx) {
                    if (quads) {
                        this.indices.push([iy * (nx + 1) + ix, (iy + 1) * (nx + 1) + ix, (iy + 1) * (nx + 1) + ix + 1, iy * (nx + 1) + ix + 1])
                    } else {
                        this.indices.push([iy * (nx + 1) + ix, (iy + 1) * (nx + 1) + ix + 1, iy * (nx + 1) + ix + 1])
                        this.indices.push([(iy + 1) * (nx + 1) + ix + 1, iy * (nx + 1) + ix, (iy + 1) * (nx + 1) + ix])
                    }
                }
            }
        }

        // unroll indices
        let idx = [];
        this.indices.forEach(set => {
            set.forEach(itm => {
                idx.push(itm);
            })
        })

        this.indices = idx;
    }
}