
class enemy{
    constructor() {

    }


}



class snowman extends enemy{
    constructor(floor) {
        super();
        this.size = floor.size * 5
        const geom = new THREE.Geometry();
        
        this.belly = new THREE.Mesh(new THREE.SphereGeometry(this.size, 10,10));
        this.belly.position.set(0,0,0);
        THREE.GeometryUtils.merge(geom, this.belly);

        this.head  = new THREE.Mesh(new THREE.OctahedronGeometry(this.size/2));
        this.head.position.set(0,this.size + this.size/2 + this.size/4,0);
        THREE.GeometryUtils.merge(geom, this.head);

        this.hand = {
            left:   new THREE.Mesh(new THREE.SphereGeometry(this.size/2, 10,10)),
            right:  new THREE.Mesh(new THREE.SphereGeometry(this.size/2, 10,10)),
        };

        
        this.hand.left.position.set(
            this.size + this.size/2,
            this.size/2,
            0
        );
        THREE.GeometryUtils.merge(geom, this.hand.left);

        this.hand.right.position.set(
            -1 * (this.size + this.size/2),
            this.size/2,
            0
        );
        THREE.GeometryUtils.merge(geom, this.hand.right);

        

        const mate = new THREE.MeshLambertMaterial({color: "rgb(100,100,100)"}) 
        this.body = new THREE.Mesh(geom, mate);
        this.body.position.set(
            floor.size * ( floor.field.x - 1) / 2 + 1,
            this.size  + floor.size/2,
            floor.size * ( floor.field.z - 1)  /2 + 1
        );

    }

    motion_hummer(){

    }
}