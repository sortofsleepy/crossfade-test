import ObjLoader from './ObjLoader'

/**
 * A basic asset loader for loading multiple assets.
 */
export default class AssetLoader {
    /**
     * Loads image assets. Returns array once all images are loaded
     * @param images {Array} an array of image objects.
     * @param progress {Function} a callback function used to keep track of image loading progress.
     */
    static async loadImageAssets(images:Array<HTMLImageElement>,progress:Function = null) {

        let numImages = images.length;
        let count = 0;

        return await new Promise((res,rej) =>{

            images.forEach(img =>{

                img.addEventListener("load",()=>{
                    if(count === numImages || count === 0){
                        res(images);
                    }else {
                        count++;
                        if(progress !== null){
                            progress((count / numImages) * 100);
                        }
                    }
                });

                img.addEventListener("error",e =>{
                    rej(e)
                })
            })
        });
    }

    /**
     * Basic asset loader. supports a variety of formats including Image elements and .obj files
     * @param assets {Array} an array of assets to load
     */
    static async loadAssets(assets:Array<any>){
        let numAssets = assets.length;
        let count  = 0;

        let promises = assets.map(async asset =>{

            // if asset is image
            if(asset instanceof Image){

                return await new Promise((res,rej) =>{
                    asset.onload = () => {
                        res(asset);
                    };

                    asset.onerror = e =>{
                        rej(e)
                    }
                })
            }


            if(typeof asset === "string"){
                const res = await fetch(asset);
                if(asset.search(".obj")){
                    const text = await res.text()
                    let processObj = (data) =>{
                        return ObjLoader.parse(data);
                    }
                    return await processObj(text);
                }
            }
        })

        return await Promise.all(promises);
    }

}
