
class point{
    constructor(box) {
        this.number = 10;
        this.size = box.size / 2 * 0.8 ;
        this.object = new Array(this.size);
        this.get = 0;
        this.max_point = this.number *2;

    }

    make_objects(box){
        let geom = new THREE.Geometry();
        
        for(var i=0 ; i<this.number ; i++ ){


            this.object[i] = {x:Math.floor(Math.random() * box.field.x ) * box.size, y: 0, z: Math.floor(Math.random() * box.field.x ) * box.size, matr: true, point:i+1};
            this.object[i].y =  ( box.box[(this.object[i].x/box.size)][this.object[i].y][(this.object[i].z/box.size)].length + 1) * box.size;
            //console.log("length:" + box.box[(this.object[i].x/box.size)][0][(this.object[i].z/box.size)].length +"(" + (this.object[i].x/box.size) + "," + this.object[i].y + "," + (this.object[i].z/box.size) )


            let geom_tmp = new THREE.OctahedronGeometry( this.size );
            this.object[i].matr = new THREE.Matrix4();
            this.object[i].matr.makeTranslation(
                this.object[i].x,
                this.object[i].y,
                this.object[i].z
            );
            geom.merge( geom_tmp, this.object[i].matr);
            
            
        }
        const mate = new THREE.MeshLambertMaterial({color: "rgb(0,0,100)"}) 
        this.objects = new THREE.Mesh(geom, mate);

        return(this.objects)


    }

    check(camera_posi){

        for(var i=0 ;i< this.number; i++){
            if(distance(camera_posi,this.object[i]) < 1000){ 

                console.log("get:"+this.object[i].point)

                this.get += this.object[i].point;       
                this.object.splice(i, 1) ;
                this.number--;

            }
        }

    }

}