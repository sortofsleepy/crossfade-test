/**
 * Simple representation of axis aligned bounding box.
 * based on code from David li.
 */
class AABB {

    min:Array<number>;
    max:Array<number>;

    /**
     * constructor, takes 2 arrays specifying 2 vertices marking the min and the max of the box
     * @param min {Array}
     * @param max {Array}
     */
    constructor(min,max){
        this.min = [min[0],min[1],min[2]];
        this.max = [max[0],max[1],max[2]];
    }

    /**
     * Returns a random point from the box.
     * @returns {Array}
     */
    randomPoint(){
        let point = [];
        for (let i = 0; i < 3; ++i) {
            point[i] = this.min[i] + Math.random() * (this.max[i] - this.min[i]);
        }
        return point;
    }

    /**
     * Compute volume that can fit in the bounding box.
     */
    computeVolume(){
        let vol = 1;
        for(let i = 0; i < 3; ++i){
            vol *= (this.max[i] - this.min[i]);
        }

        return vol;
    }
}

export default AABB;