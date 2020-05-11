
class block {
    constructor() {

    }

    make_floor(){
        this.field = {x:200, y:50, z:200},
        this.size = 1000;

        const generation_rate = 0.5;
        //const generation_rate = 0.0;
        const geom = new THREE.Geometry();

        this.box = new Array(this.field.x);;

        for(var i=0; i<this.field.x; i++){ 
            this.box[i] = new Array(this.field.y);

            for(var j=0; j<this.field.y+1; j++){ 
                // box[i][j] = len_z;
                this.box[i][j] = new Array(this.field.z);

                for(var k=0; k<this.field.z; k++ ){
                    this.box[i][j][k] = {x:this.size*i, y:this.size*j, z:this.size*k, exist:false, mesh:false};
                    
                    if( j == 0 ){
                        this.box[i][j][k].exist = true;

                        if( j==0 && k==0 ){
                            const geom_tmp = new THREE.BoxGeometry(this.size * this.field.x, this.size, this.size * this.field.z);
                            this.box[i][j][k].mesh = new THREE.Matrix4();
                            this.box[i][j][k].mesh.makeTranslation(
                                this.size * ( this.field.x - 1) / 2,
                                this.box[i][j][k].y,
                                this.size * ( this.field.z - 1)  /2
                            );
                            geom.merge( geom_tmp, this.box[i][j][k].mesh);
                        }

                    }else if( j < this.field.y - 5 &&   Math.random() <= generation_rate && this.box[i][j-1][k].exist && !( i+k == 0 && j !=0 )){
                        this.box[i][j][k].exist = true;
                        
                        this.box[i][0][k].geom = new THREE.BoxGeometry(this.size, this.size * j, this.size);
                        this.box[i][0][k].mesh = new THREE.Matrix4();
                        this.box[i][0][k].mesh.makeTranslation(
                            this.box[i][0][k].x,
                            (this.size * j )/2,
                            this.box[i][0][k].z
                        );

                    }

                    if( j == this.field.y-1 && this.box[i][1][k].exist ){   
                        geom.merge( this.box[i][0][k].geom, this.box[i][0][k].mesh);
                    }

                    //console.log(i+","+j+","+k+"="+this.box[i][j][k].exist);
                }
            }
      
        }
        const mate = new THREE.MeshLambertMaterial({color: "rgb(100,0,0)"}) 
        this.boxes = new THREE.Mesh(geom, mate);
    }

    


    hit_judge(prev_set, foll_set, hit_position, on_ground, on_ground_check){
        
        for(var axis in hit_position){
            prev_set[axis] -= hit_position[axis];
            foll_set[axis] -= hit_position[axis];
        }


        let set_tmp = {x:prev_set.x, y:prev_set.y, z:prev_set.z};
    
        for(var axis in set_tmp){
            
            if(foll_set[axis] > this.size * ( this.field[axis] -1 + 0.5 ) - 10 ){
                foll_set[axis] = this.size * ( this.field[axis] -1 + 0.5) - 10;
            }else if(foll_set[axis] < this.size * ( -0.5 ) +10){
                foll_set[axis] = this.size * ( -0.5) + 10;
            }


            set_tmp[axis] = foll_set[axis];
            if(!on_ground_check){console.log("(x,y,z): "+
                (Math.round(set_tmp.x/this.size)) +" , "+ (Math.round(set_tmp.y/this.size)) +" , "+ (Math.round(set_tmp.z/this.size)) + 
                "\n : "+ (set_tmp.x/this.size) +" , "+ (set_tmp.y/this.size) + " , "+ (set_tmp.z/this.size) + 
                "\n : "+ set_tmp.x +" , "+ set_tmp.y +" , "+ set_tmp.z +" ( "+ this.size + 
                "\n : "+ prev_set.x +" , "+ prev_set.y +" , "+ prev_set.z +
                "\n : "+ foll_set.x +" , "+ foll_set.y +" , "+ foll_set.z
            )}

            let block_foll = this.box[Math.round(set_tmp.x/this.size)][Math.round(set_tmp.y/this.size)][Math.round(set_tmp.z/this.size)]
            if(!on_ground_check){console.log(Object.keys(block_foll))}


            if(block_foll.exist){
                //console.log("x,y,z:"+Math.round(prev_set.x/this.size)+","+Math.round(prev_set.y/this.size)+","+Math.round(prev_set.z/this.size))
                let block_prev = this.box[Math.round(prev_set.x/this.size)][Math.round(prev_set.y/this.size)][Math.round(prev_set.z/this.size)]
                if(on_ground_check&&axis=="y"){on_ground ++;}
                
            
                if(block_prev[axis]>block_foll[axis]){
                    set_tmp[axis] = (block_prev[axis]+block_foll[axis])/2 + 10;
                }else{
                    set_tmp[axis] = (block_prev[axis]+block_foll[axis])/2 - 10;
                }
            }else{
                if(on_ground_check && axis=="y"){on_ground = 0;}
            }
            //console.log("on_ground:"+ on_ground)
            set_tmp.on_ground = on_ground;
        }

        //set_tmp.y += player_height;
        for(var axis in hit_position){
            set_tmp[axis] += hit_position[axis];
        }

        return(set_tmp);
    }
}
