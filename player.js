class player {
    constructor(canvas) {

        this.acc_walk = 1000*3 / 60;     // 歩く時の加速度
        this.acc_jump = 1000*150 / 600;    // ジャンプした時の加速度
        this.roc_turn = 800;    // １回転するマウスの移動ピクセル数
        this.on_ground = 0;
        this.hit_position = {x:0,y:800,z:0};
        
        
        this.canvas = canvas;
        this.position_flag = false;
        this.rotation_flag = false;
        
        

        
        this.movement = {
            acc: {                        //移動する加速度
                position: {x: 0, y: 0, z: 0 },      // 場所
                rotation: {x: 0, y: 0, z: 0 }       // 角度
            },
            vel: {                        //移動する速度
                position: {x: 0, y: 0, z: 0 },      // 場所
                rotation: {x: 0, y: 0, z: 0 }       // 角度
            },
            set: {
                position: {x: 0, y: 3000, z: 0 },      // 場所
                rotation: {x: 0, y: Math.PI/2, z: 0 }       // 角度
            }
        }

        this.camera = new THREE.PerspectiveCamera(90, width / height, 1, 2000000);
            this.camera.position.set(this.movement.set.position.x,this.movement.set.position.y,this.movement.set.position.z);
            this.camera.rotation.set(this.movement.set.rotation.x,this.movement.set.rotation.y,this.movement.set.rotation.z);
            this.camera.rotation.order = "YZX"

        this.add_acc = {
            parameter:{x:0,y:0,z:0},

            position: (pos) => {
                this.movement.vel.position.x += pos.x
                this.movement.vel.position.z += pos.z

                if((this.on_ground > 0 && pos.y > 0 ) || ( this.on_ground == 0 && pos.y < 0 ) ){
                    this.movement.vel.position.y += pos.y
                    this.on_ground = 1;
                }
            },
            rotation: (rot) => {
                this.movement.vel.rotation.x += rot.x
                this.movement.vel.rotation.y += rot.y
            }
        }

        // キーに関する設定
        this.key = {

            get_by_num: function(num){
                for(var k in this){
                    if(this[k].num === num){return k;}
                }
                return(false);
            },

            key_down: (num) => {
                let key_tmp = this.key.get_by_num(num);
                console.log("key_tmp:"+key_tmp+ num)
                if(!key_tmp){return}
                if(!this.key[key_tmp].key_down_flag){
                    this.key[key_tmp].action_down(this.key[key_tmp].argment_down);
                    this.key[key_tmp].key_down_flag = true;
                }
            },

            key_up: (num) => {
                let key_tmp = this.key.get_by_num(num);
                if(!key_tmp){return}
                if(this.key[key_tmp].key_down_flag){
                    this.key[key_tmp].action_up(this.key[key_tmp].argment_up);
                    this.key[key_tmp].key_down_flag = false;

                }
            },

            w:      make_key_config( 87,   false,   false,   this.add_acc.position,     {x:0, y:0, z:-1 * this.acc_walk},   this.add_acc.position,  {x:0, y:0, z:this.acc_walk}         ),
            s:      make_key_config( 83,   false,   false,   this.add_acc.position,     {x:0, y:0, z:this.acc_walk},        this.add_acc.position,  {x:0, y:0, z:-1 * this.acc_walk}    ),
            a:      make_key_config( 65,   false,   false,   this.add_acc.position,     {x:-1 * this.acc_walk, y:0, z:0},   this.add_acc.position,  {x:this.acc_walk, y:0, z:0}         ),
            d:      make_key_config( 68,   false,   false,   this.add_acc.position,     {x:this.acc_walk, y:0, z:0},        this.add_acc.position,  {x:-1 * this.acc_walk, y:0, z:0}    ),
            r:      make_key_config( 82,   false,   false,   this.restart,              "",                                 function(){;},          ""                                  ),
            space:  make_key_config( 32,   false,   false,   this.add_acc.position,     {x:0, y:this.acc_jump, z:0},        this.add_acc.position,  {x:0, y:0, z:0},                    ),
            esc:    make_key_config( 27,   false,   false,   ElementExitPointerLock,    this.canvas,                        ElementExitPointerLock, this.canvas                         )
        }

        function make_key_config(numb,cont,k_d_f,acti_d,arg_d,acti_u,arg_u){
            let key_tmp = {
                num: numb,
                continuation: cont,
                key_down_flag: k_d_f,
                action_down: acti_d,
                argment_down: arg_d,
                action_up: acti_u,
                argment_up: arg_u
            }
            return(key_tmp);
        }

        // マウスに関する設定
        this.mouse = {
            move_flag: false,

            mouse_move: (e) => {
                let rot_tmp = {x:e.movementX,y:e.movementY}
                this.add_acc.rotation(rot_tmp);
                this.mouse.move_flag = true;
            },

            mouse_down: (e) => {
                ElementRequestPointerLock(this.canvas);
            }
        }
        this.camera.useQuaternion = true;
    }
    
    restart(){
        if(!playing){
            init();
        }

    }

    // 加速度を座標に変換に変換
    set_move(){
        
        this.movement.set.position.x += this.movement.vel.position.x * Math.cos(this.camera.rotation.y) + this.movement.vel.position.z * Math.sin(this.camera.rotation.y)
        this.movement.set.position.z += this.movement.vel.position.z * Math.cos(this.camera.rotation.y) + -1 * this.movement.vel.position.x * Math.sin(this.camera.rotation.y)
        


        if(this.on_ground <= 1 ){
            this.add_acc.position({x:0,y:gravity,z:0});
        }else{
            this.on_ground = 2
            this.movement.vel.position.y = gravity;
        }

        this.movement.set.position.y += this.movement.vel.position.y;
        this.position_flag = false;




        console.log(
            "move before:" + this.movement.set.position.x + "," +  + this.movement.set.position.y + ","  + this.movement.set.position.z + "," 

        )

        // 角度の角加速度を角速度，角度に変換
        if(this.mouse.move_flag){
            this.camera.rotation.x += ( -2 * Math.PI / this.roc_turn) * this.movement.vel.rotation.y
            this.camera.rotation.y += ( -2 * Math.PI / this.roc_turn) * this.movement.vel.rotation.x
            this.movement.vel.rotation.x = 0;
            this.movement.vel.rotation.y = 0;
            this.mouse.move_flag = false;
        }
    }

    moving(set){ 

        this.on_ground = set.on_ground;
        delete set.on_ground;
        for(var k in set){
            if(set[k]==this.camera.position[k] && k == "y"){
                this.movement.vel.position[k] = 0;
            }else{
                this.camera.position[k] = set[k];
                this.movement.set.position[k] = set[k];
            }
        }
    }

}