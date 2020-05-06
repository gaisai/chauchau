

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


class player {
    constructor(height, width,canvas) {

        this.acc_walk = 50;     // 歩く時の加速度
        this.acc_jump = 100;    // ジャンプした時の加速度
        this.roc_turn = 800;    // １回転するマウスの移動ピクセル数
        this.canvas = canvas;
        this.position_flag = false;
        this.rotation_flag = false;

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000000);
            this.camera.position.set(0,1200,0);
            //this.camera.rotation.set(Math.PI/2,0,0);
            this.camera.rotation.set(0,0,0);
        
        this.movement = {
            acc: {                        //移動する加速度
                position: {x: 0, y: 0, z: 0 },      // 場所
                rotation: {x: 0, y: 0, z: 0 }       // 角度
            },
            vel: {                        //移動する速度
                position: {x: 0, y: 0, z: 0 },      // 場所
                rotation: {x: 0, y: 0, z: 0 }       // 角度
            }
        }

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
    acc_to_pos(){
        this.camera.position.x += this.movement.vel.position.x * Math.cos(this.camera.rotation.y) + this.movement.vel.position.z * Math.sin(this.camera.rotation.y)
        this.camera.position.z += this.movement.vel.position.z * Math.cos(this.camera.rotation.y) + -1 * this.movement.vel.position.x * Math.sin(this.camera.rotation.y)
        this.position_flag = false;

        // 角度の角加速度を角速度，角度に変換
        if(this.mouse.move_flag){
            this.camera.rotation.y += ( -2 * Math.PI / this.roc_turn) * this.movement.vel.rotation.y
            this.movement.vel.rotation.y = 0;
            this.mouse.move_flag = false;
        }
    }

}


class block {
    constructor(scene) {
        this.field = {x:20, y:3, z:20},
        this.box_n = this.field.x;
        this.size = 1000;
        this.boxes = new THREE.Group();    
        this.generation_rate = 0.1;
        this.box = new Array(this.field.x);;

        let len_y = new Array(this.field.y);
        let len_z = new Array(this.field.z);

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
                        this.box[i][j][k].mesh = new THREE.Mesh(
                            new THREE.BoxGeometry(this.size, this.size, this.size),
                            new THREE.MeshLambertMaterial({color: "rgb(100,0,0)"})                
                        );
                        this.box[i][j][k].mesh.position.set( this.box[i][j][k].x, this.box[i][j][k].y, this.box[i][j][k].z );
                        this.boxes.add(this.box[i][j][k].mesh)
                    }

                }
            }
        }
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

    /*
    boxes = new THREE.Group()
    box = new THREE.Mesh(
        new THREE.BoxGeometry(4000,200,4000),
        new THREE.MeshLambertMaterial({color: "rgb(100,0,0)"})
    );
    boxes.add(box)
    scene.add(boxes);
    */


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
            camera.acc_to_pos()
        }

        // レンダリング
        renderer.render(scene, camera.camera); 
        requestAnimationFrame(tick);

        elm.innerHTML = 'camera <br>posi-> x:' + camera.camera.position.x + ', y:' + camera.camera.position.y + ', z:' + camera.camera.position.z +
            '<br>acc -> x:' + camera.movement.acc.position.x + ', y:' + camera.movement.acc.position.y + ', z:' + camera.movement.acc.position.z +
            '<br>vel -> x:' + camera.movement.vel.position.x + ', y:' + camera.movement.vel.position.y + ', z:' + camera.movement.vel.position.z +
            '<br>rota x:' + camera.camera.rotation.x/Math.PI + 'PI, y:' + camera.camera.rotation.y/Math.PI + 'PI, z:' + camera.camera.rotation.z/Math.PI + 'PI'

            
    }


    console.log('end: ', performance.now() - start, 'ms');
}

