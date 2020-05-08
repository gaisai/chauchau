
class block {
    constructor() {

    }

    make_floor(){
        this.field = {x:50, y:50, z:50},
        this.size = 1000;

        const generation_rate = 0.5;
        const geom = new THREE.Geometry();

        this.box = new Array(this.field.x);;

        for(var i=0; i<this.field.x; i++){ 
            this.box[i] = new Array(this.field.y);

            for(var j=0; j<this.field.y+1; j++){ 
                // box[i][j] = len_z;
                this.box[i][j] = new Array(this.field.z);

                for(var k=0; k<this.field.z; k++ ){
                    this.box[i][j][k] = {x:this.size*i, y:this.size*j, z:this.size*k, exist:false, mesh:false};
                    
                    if( j == 0 || ( j < this.field.y - 5 &&   Math.random() <= generation_rate && this.box[i][j-1][k].exist ) ){
                        this.box[i][j][k].exist = true;
                    }

                    if( i+k == 0 && j !=0 ){
                        this.box[i][j][k].exist = false;
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

                    //console.log(i+","+j+","+k+"="+this.box[i][j][k].exist);
                }
            }
      
        }
        const mate = new THREE.MeshLambertMaterial({color: "rgb(100,0,0)"}) 
        this.boxes = new THREE.Mesh(geom, mate);
    }

    make_sphere(floor){
        this.size = 2000
        this.hit_position = {x:this.size/2, y:this.size/2,z:this.size/2}
        this.acc = {x:0, y:gravity, z:0};
        this.vel = {x:0, y:0, z:0};
        this.move_max = 1000 / 600;
        this.on_ground = 0;
        this.counter = 0;


        const geometry = new THREE.SphereGeometry( this.size, 100,100 );
        const material = new THREE.MeshLambertMaterial( {color: "rgb(0,100,0)" } );
        this.sphere = new THREE.Mesh( geometry, material );
        

        let posi = { x:(floor.field.x -2 ) * floor.size, y:(floor.field.y -2 ) * floor.size, z:(floor.field.z -2 ) * floor.size }
        
        this.sphere.position.set(posi.x,posi.y,posi.z)
        console.log(this.sphere)

    }

    move_sphere(floor,player){
        let move_tmp = {x:0,y:0,z:0};
        let hit = {x:0,y:0,z:0};
        let rand = Math.random();


        let dist = {
            /*
            x:(player.camera.position.x - this.sphere.position.x) / (floor.size*floor.field.x) * player.acc_walk,
            y:(player.camera.position.y - this.sphere.position.y) / Math.pow(10,3) + floor.size,
            z:(player.camera.position.z - this.sphere.position.z) / (floor.size*floor.field.x) * player.acc_walk
            */
            x:(player.camera.position.x - this.sphere.position.x) / floor.size * this.counter,
            y:(player.camera.position.y - this.sphere.position.y) / floor.field.y + (floor.size *  floor.field.y / player.acc_walk)  ,
            z:(player.camera.position.z - this.sphere.position.z) / floor.size * this.counter
            
        }
        
        if(this.on_ground == 0){
            dist.y = 0;
            //dist.x = 0;
            //dist.z = 0;
            this.vel.x = 0;
            this.vel.z = 0;
        }else{
            this.vel.y = 0;
            this.vel.x = 0;
            this.vel.z = 0;
        }

        for(var axis in this.acc){
           this.acc[axis] = dist[axis];
       
            if(axis == "y"){
                this.acc[axis] += gravity;
            }

            this.vel[axis] += this.acc[axis];
            move_tmp[axis] = this.sphere.position[axis] + this.vel[axis];
        }

        move_tmp =floor.hit_judge(this.sphere.position, move_tmp, hit ,this.on_ground, true)
        enemy.sphere.position.set(move_tmp.x,move_tmp.y,move_tmp.z)
        this.on_ground = move_tmp.on_ground
        //console.log("s on ground:"+this.on_ground)

        if(this.counter < floor.size){
            this.counter += 0.005;
        }
       
        


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
