
class block {
    constructor(scene) {
        this.field = {x:30, y:5, z:30},
        this.box_n = this.field.x;
        this.size = 1000;
        //this.boxes = new THREE.Group();    
        
        this.generation_rate = 0.3;
        this.box = new Array(this.field.x);;

        const geom = new THREE.Geometry();

        for(var i=0; i<this.field.x; i++){ 
            // this.box[i] = len_y;
            this.box[i] = new Array(this.field.y);

            for(var j=0; j<this.field.y+1; j++){ 
                // this.box[i][j] = len_z;
                this.box[i][j] = new Array(this.field.z);

                for(var k=0; k<this.field.z; k++ ){
                    this.box[i][j][k] = {x:this.size*i, y:this.size*j, z:this.size*k, exist:false, mesh:false};
                    
                    if( j == 0 || ( j < 3 &&   Math.random()<=this.generation_rate && this.box[i][j-1][k].exist ) ){
                        this.box[i][j][k].exist = true;
                    }

                    if(this.box[i][j][k].exist){
                        const geom_tmp = new THREE.BoxGeometry(this.size, this.size, this.size);
                        this.box[i][j][k].mesh = new THREE.Matrix4();
                        this.box[i][j][k].mesh.makeTranslation(
                            this.box[i][j][k].x,
                            this.box[i][j][k].y,
                            this.box[i][j][k].z
                        );
                        geom.merge( geom_tmp, this.box[i][j][k].mesh);
                    }
                }
            }
            const mate = new THREE.MeshLambertMaterial({color: "rgb(100,0,0)"}) 
            this.boxes = new THREE.Mesh(geom, mate);
        }
    }

    hit_judge(prev_set, foll_set){
        prev_set.y -= player_height;
        foll_set.y -= player_height;
        let set_tmp = {x:prev_set.x, y:prev_set.y, z:prev_set.z};
    
        for(var axis in set_tmp){
            
            if(foll_set[axis] > this.size * ( this.field[axis] -1 + 0.5 ) ){
                
                foll_set[axis] = this.size * ( this.field[axis] -1 + 0.5) - 10;
                console.log(axis,":",foll_set[axis]);
            }else if(foll_set[axis] < this.size * ( -0.5 )){
                foll_set[axis] = this.size * ( -0.5) + 10;
                console.log(axis,":",foll_set[axis]);
            }

            set_tmp[axis] = foll_set[axis];
            let block_foll = this.box[Math.round(set_tmp.x/this.size)][Math.round((set_tmp.y)/this.size)][Math.round(set_tmp.z/this.size)]

            if(block_foll.exist){
                let block_prev = this.box[Math.round(prev_set.x/this.size)][Math.round(prev_set.y/this.size)][Math.round(prev_set.z/this.size)]
                if(axis=="y"){on_ground ++;}
            
                if(block_prev[axis]>block_foll[axis]){
                    set_tmp[axis] = (block_prev[axis]+block_foll[axis])/2 + 10;
                }else{
                    set_tmp[axis] = (block_prev[axis]+block_foll[axis])/2 - 10;
                }
            }else{
                if(axis=="y"){on_ground = 0;}
            }
        }

        set_tmp.y += player_height;
        return(set_tmp);
    }
}
