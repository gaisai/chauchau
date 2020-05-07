

let active_flag = false;

// サイズを指定
const width = window.innerWidth;
const height = window.innerHeight/4*3;

function ElementRequestPointerLock(element){
    element["requestPointerLock"]();
    active_flag = true;
    console.log("active_flag:"+active_flag);
    return;
}

function ElementExitPointerLock(element){
    element["exitPointerLock"]();
    active_flag = false;
    console.log("active_flag:"+active_flag);
    return;
}

test_hit = false;


class player {
    constructor(height, width,canvas) {

        this.acc_walk = 50;     // 歩く時の加速度
        this.acc_jump = 100;    // ジャンプした時の加速度
        this.roc_turn = 800;    // １回転するマウスの移動ピクセル数
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
                position: {x: 0, y: 1300, z: 0 },      // 場所
                rotation: {x: 0, y: 0, z: 0 }       // 角度
            }
        }

        this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 2000000);
            this.camera.position.set(this.movement.set.position.x,this.movement.set.position.y,this.movement.set.position.z);
            //this.camera.rotation.set(Math.PI/2,0,0);
            this.camera.rotation.set(this.movement.set.rotation.x,this.movement.set.rotation.y,this.movement.set.rotation.z);


        this.add_acc = {
            parameter:{x:0,y:0,z:0},

            position: (pos) => {
                this.movement.vel.position.x += pos.x
                this.movement.vel.position.y += pos.y
                this.movement.vel.position.z += pos.z
            },
            rotation: (rot) => {
                this.movement.vel.rotation.y += rot.x
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
                console.log("key_tmp:"+key_tmp)
                if(!key_tmp){return}
                if(!this.key[key_tmp].key_down_flag){
                    this.key[key_tmp].action_down(this.key[key_tmp].argment_down);
                    this.key[key_tmp].key_down_flag = true;
                    console.log("flag"+this.key[key_tmp].num)

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
            space:  make_key_config( 32,   false,   false,   this.add_acc.position,     {x:0, y:this.acc_jump, z:0},        this.add_acc.position,  {x:0, y:this.acc_jump, z:0},        ),
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
    }
    

    // 加速度を座標に変換に変換
    set_move(){
        
        this.movement.set.position.x += this.movement.vel.position.x * Math.cos(this.camera.rotation.y) + this.movement.vel.position.z * Math.sin(this.camera.rotation.y)
        this.movement.set.position.z += this.movement.vel.position.z * Math.cos(this.camera.rotation.y) + -1 * this.movement.vel.position.x * Math.sin(this.camera.rotation.y)
        this.position_flag = false;

        // 角度の角加速度を角速度，角度に変換
        if(this.mouse.move_flag){
            this.camera.rotation.y += ( -2 * Math.PI / this.roc_turn) * this.movement.vel.rotation.y
            this.movement.vel.rotation.y = 0;
            this.mouse.move_flag = false;
        }
    }

    moving(set){
        for(var k in set){
            this.camera.position[k] = set[k];
            this.movement.set.position[k] = set[k];
        }
    }

}


class block {
    constructor(scene) {
        this.field = {x:20, y:3, z:20},
        this.box_n = this.field.x;
        this.size = 1000;
        //this.boxes = new THREE.Group();    
        
        this.generation_rate = 0.1;
        this.box = new Array(this.field.x);;

        let len_y = new Array(this.field.y);
        let len_z = new Array(this.field.z);

        const geom = new THREE.Geometry();

        for(var i=0; i<this.field.x; i++){ 
            // this.box[i] = len_y;
            this.box[i] = new Array(this.field.y);

            for(var j=0; j<this.field.y; j++){ 
                // this.box[i][j] = len_z;
                this.box[i][j] = new Array(this.field.z);

                for(var k=0; k<this.field.z; k++ ){
                    this.box[i][j][k] = {x:this.size*i, y:this.size*j, z:this.size*k, exist:false, mesh:false};
                    
                    if( j == 0 || ( Math.random()<=this.generation_rate && this.box[i][j-1][k].exist ) ){
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
        
        console.log("start")
        console.log(prev_set,foll_set);
        let set_tmp = {x:prev_set.x, y:prev_set.y, z:prev_set.z};
        
        for(var axis in set_tmp){
            console.log(axis)
            
            set_tmp[axis] = foll_set[axis];
            console.log(set_tmp)
            let block_foll = this.box[Math.round(set_tmp.x/this.size)][Math.round(set_tmp.y/this.size)][Math.round(set_tmp.z/this.size)]
            if(block_foll.exist){
                
                let block_prev = this.box[Math.round(prev_set.x/this.size)][Math.round(prev_set.y/this.size)][Math.round(prev_set.z/this.size)]
                console.log(block_prev,block_foll);
                if(block_prev[axis]>block_foll[axis]){
                    set_tmp[axis] = (block_prev[axis]+block_foll[axis])/2 + 10;
                }else{
                    set_tmp[axis] = (block_prev[axis]+block_foll[axis])/2 - 10;
                }

            }
            
            

        }




        return(set_tmp);

    }
}


function init(){
    const start = performance.now();
    elm = document.getElementById("text");

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas')
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    canvas = document.querySelector('#myCanvas')

    // シーンを作成
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 50, 1000000);

    // 光源を作成
    const light = [ new THREE.DirectionalLight(0xFFFFFF,1), new THREE.PointLight(0xFFFFFF, 1, 0, 10000) , new THREE.HemisphereLight(0x888888, 0x0000FF, 1) ];
    
    for(var i=0;i<light.length;i++){
        light[i].position.set(10000*1*(i+1),10000*2*(i+1),10000*3*(i+1)*Math.pow(-1,i));
        light[i].intensity = (i + light.length) /light.length;
        scene.add(light[i]);
    }

    // カメラとボックスを作成
    camera = new player(width,height,canvas);
    box = new block(scene);
    scene.add(box.boxes);

    // イベント時に呼び出される
    canvas.setAttribute('tabindex', 0); // focusしている時のみ、keyDown,up を有効に
    canvas.addEventListener('keydown', onKeyDown, false);
    canvas.addEventListener('keyup', onKeyUp, false);
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);

    function onKeyDown(e){if(active_flag){          // キーが押されたときに動く関数
        camera.key.key_down(e.keyCode);
    }}

    function onKeyUp(e){if(active_flag){            // キーが上げられたときに動く関数
        camera.key.key_up(e.keyCode);
    }}
    
    function onMouseMove(e){if(active_flag){        // マウスが動かされたときに動く関数
        camera.mouse.mouse_move(e);
    }}

    function onMouseDown(e){                        // 左クリックが押されたされたときに動く関数
        
        camera.mouse.mouse_down(e);
    }

    function onMouseUp(e){if(active_flag){          // 左クリックが上げられたときに動く関数
        ;
    }}

    
    tick(); // 毎チック実行する関数

    function tick(){

        if(active_flag){
            camera.set_move();
            camera.moving(box.hit_judge(camera.camera.position, camera.movement.set.position));

        }

        // レンダリング
        renderer.render(scene, camera.camera); 
        requestAnimationFrame(tick);

        b = { x:Math.round(camera.movement.set.position.x/box.size), y:Math.round(camera.movement.set.position.y/box.size), z:Math.round(camera.movement.set.position.z/box.size) };
        elm.innerHTML = 'camera <br>posi-> x:' + camera.camera.position.x + ', y:' + camera.camera.position.y + ', z:' + camera.camera.position.z +
            '<br>acc -> x:' + camera.movement.acc.position.x + ', y:' + camera.movement.acc.position.y + ', z:' + camera.movement.acc.position.z +
            '<br>vel -> x:' + camera.movement.vel.position.x + ', y:' + camera.movement.vel.position.y + ', z:' + camera.movement.vel.position.z +
            '<br>block -> x:' + b.x + ', y:' + b.y + ', z:' + b.z + '(' + box.box[b.x][b.y][b.z].exist + ')'
            '<br>rota x:' + camera.camera.rotation.x/Math.PI + 'PI, y:' + camera.camera.rotation.y/Math.PI + 'PI, z:' + camera.camera.rotation.z/Math.PI + 'PI'

            
    }


    console.log('end: ', performance.now() - start, 'ms');
}

