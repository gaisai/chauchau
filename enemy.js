
class enemy{
    make_sphere(floor){
        this.size = 2000
        this.hit_position = {x:this.size/2, y:this.size/2,z:this.size/2}
        this.acc = {x:0, y:gravity, z:0};
        this.vel = {x:0, y:0, z:0};
        this.move_max = 1000 / 600;
        this.on_ground = 0;
        this.counter = 0;
        let color = "rgb(0,100,0)"

        const geometry = new THREE.SphereGeometry( this.size, 100,100 );
        const material = new THREE.MeshLambertMaterial( {color:  color} );
        this.sphere = new THREE.Mesh( geometry, material );
        

        let posi = { x:(floor.field.x -2 ) * floor.size, y:(floor.field.y -2 ) * floor.size, z:(floor.field.z -2 ) * floor.size }
        
        this.sphere.position.set(posi.x,posi.y,posi.z)
        console.log(this.sphere)

    }

    hopping_sphere(floor,player){
        let move_tmp = {x:0,y:0,z:0};
        let hit = {x:0,y:0,z:0};
        let rand = Math.random();

        let dist = {
            x:(player.camera.position.x - this.sphere.position.x) / floor.size * this.counter,
            y:(player.camera.position.y - this.sphere.position.y) / floor.field.y + (floor.size *  floor.field.y / player.acc_walk)  ,
            z:(player.camera.position.z - this.sphere.position.z) / floor.size * this.counter
        }
        
        if(this.on_ground == 0){
            dist.y = 0;
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
        this.sphere.position.set(move_tmp.x,move_tmp.y,move_tmp.z)
        this.on_ground = move_tmp.on_ground
        //console.log("s on ground:"+this.on_ground)

        if(this.counter < floor.size){
            this.counter += 0.001;
        }
    } 

    crawling_sphere(floor,player){
        let foll = {
            x:(player.camera.position.x - this.sphere.position.x) ,
            y:(player.camera.position.y - this.sphere.position.y) ,
            z:(player.camera.position.z - this.sphere.position.z) 
        }

        let dist = Math.sqrt( Math.pow(foll.x,2) + Math.pow(foll.y,2) + Math.pow(foll.z,2));
        console.log(            
            "dist;" + dist + 
            "\np: "  + player.camera.position.x + "," + player.camera.position.y + "," +player.camera.position.z + 
            "\nt: "  + this.sphere.position.x + "," + this.sphere.position.y + "," +this.sphere.position.z 
        )
        for(let axis in foll){
            this.sphere.position[axis] += foll[axis] / dist * this.counter
        }
        if(this.counter < player.acc_walk){
            this.counter += 0.01;
        }

    }
}