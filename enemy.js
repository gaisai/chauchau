
class enemy{
    constructor() {

    }

}


class snowman extends enemy{
    constructor(floor) {
        super();

        this.size = floor.size * 5
        this.action = "";
        this.action_flame = 0;

        const mate = new THREE.MeshLambertMaterial({color: "rgb(100,100,100)"}) 
        
        this.belly = new THREE.Mesh(new THREE.SphereGeometry(this.size, 10,10),mate);
        this.belly.position.set(0,0,0);

        this.head  = new THREE.Mesh(new THREE.OctahedronGeometry(this.size/2),mate);
        this.head.position.set(0,this.size + this.size/2 + this.size/4,0);

        this.hand = {
            left:   new THREE.Mesh(new THREE.SphereGeometry(this.size/2, 10,10),mate),
            right:  new THREE.Mesh(new THREE.SphereGeometry(this.size/2, 10,10),mate),
        };

        //左手初期位置
        this.hand.left.position.set( 
            0, 
            this.size/2, 
            this.size + this.size/2
        );

        //右手初期位置
        this.hand.right.position.set( 
            0, 
            this.size/2,  
            -1 * (this.size + this.size/2)
        );
        console.log(this.hand.right.position)


        this.body = new THREE.Group();
        this.body.add(this.belly, this.head, this.hand.left, this.hand.right)
        this.body.position.set(
            floor.size * ( floor.field.x - 1) / 2 + 1,
            this.size  + floor.size/2,
            floor.size * ( floor.field.z - 1)  /2 + 1
        );

    }


    motion_hummer(){

        console.log("start")
        let base_flame = 1 / s_flame 

        if( this.action_flame < 0.5 /base_flame ){
            let doing = 0.5 * base_flame;

            console.log("up:"+doing+", "+this.action_flame)
            
            this.hand.right.position.x += this.size / doing
            this.hand.right.position.z += this.size / doing
            this.hand.right.position.y += (this.size * 2) / doing

        }else if( this.action_flame < 0.6 /base_flame){
            let doing = 0.1 * base_flame;

            console.log("down:"+doing+", "+this.action_flame)
            
            this.hand.right.position.y += -1 * (this.size * ( 2 + 0.5 + 0.5 ) ) / doing

        }else if(this.action_flame < 1 /base_flame){
            let doing = 0.4 * base_flame;
            
            console.log("stop:"+doing+", "+this.action_flame)

        }else if(this.action_flame < 1.5 /base_flame){
            let doing = 0.5 * base_flame;
            
            console.log("restart:"+doing+", "+this.action_flame)
            
            this.hand.right.position.x -= (this.size) / doing
            this.hand.right.position.z -= (this.size) / doing
            this.hand.right.position.y -= ((this.size * 2) - (this.size * ( 2 + 0.5 + 0.5 ) )) / doing
            
        }else{
            console.log("finish"+", "+this.action_flame)
            this.action_flame = 0;
            //this.action = this.action;
            return;
        }
        
        this.action_flame++ ;
        console.log("action2:"+ this.action_flame)
    }


}