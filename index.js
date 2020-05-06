// ページの読み込みを待つ

let active_flag = false;

function ElementRequestPointerLock(element){
    if(element["requestPointerLock"]){
        element["requestPointerLock"]();
        active_flag = true;
        return true;
    }
    return false;
}


function ElementExitPointerLock(element){
    if(element["exitPointerLock"]){
        element["exitPointerLock"]();
        active_flag = false;
        return true;
    }
    return false;
}


class player {
    constructor(height, width,canvas) {

        this.acc_walk = 50;     // 歩く時の加速度
        this.acc_jump = 100;    // ジャンプした時の加速度
        this.roc_turn = 400;    // １回転するマウスの移動ピクセル数
        this.canvas = canvas;

        this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000000);
            this.camera.position.set(0,300,0);
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
                console.log(pos)
            },
            rotation: (rot) => {
                this.movement.vel.rotation.y = rot.y

                console.log("rotation.x : "+rot.x);
                console.log("rotation.y : "+rot.y);
            }
        }
        

        // キーに関する設定
        this.key = {

            get_by_num: function(num){
                for(var k in this){
                    if(this[k].num === num){return k;}
                }
                return(make_key_config(null,null,null,null));
            },

            key_down: (num) => {
                let key_tmp = this.key.get_by_num(num);
                if(!this.key[key_tmp].key_down_flag){
                    this.key[key_tmp].action_down(this.key[key_tmp].argment_down);
                    this.key[key_tmp].key_down_flag = true;
                    console.log("flag"+this.key[key_tmp].num)

                }
            },

            key_up: (num) => {
                let key_tmp = this.key.get_by_num(num);
                if(this.key[key_tmp].key_down_flag){
                    this.key[key_tmp].action_up(this.key[key_tmp].argment_up);
                    this.key[key_tmp].key_down_flag = false;
                }
            },

            w:      make_key_config( 87,   false,   false,   this.add_acc.position,    {x:0, y:0, z:-1 * this.acc_walk},    this.add_acc.position, {x:0, y:0, z:this.acc_walk}          ),
            s:      make_key_config( 83,   false,   false,   this.add_acc.position,    {x:0, y:0, z:this.acc_walk},        this.add_acc.position, {x:0, y:0, z:-1 * this.acc_walk}     ),
            a:      make_key_config( 65,   false,   false,   this.add_acc.position,    {x:-1 * this.acc_walk, y:0, z:0},   this.add_acc.position, {x:this.acc_walk, y:0, z:0}          ),
            d:      make_key_config( 68,   false,   false,   this.add_acc.position,    {x:this.acc_walk, y:0, z:0},        this.add_acc.position, {x:-1 * this.acc_walk, y:0, z:0}     ),
            space:  make_key_config( 32,   false,   false,   this.add_acc.position,    {x:0, y:this.acc_jump, z:0},),
            esc:    make_key_config( 27,   false,   false,   ElementExitPointerLock, this.canvas )

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
            //diff: { x: 0, y: 0,},
            move_flag: false,

            mouse_move: (e) => {
                let rot_tmp = {x:e.movementX, y:e.movementY}
                console.log(e)
                this.add_acc.rotation(rot_tmp);
            },

            mouse_down: (e) => {
                ElementRequestPointerLock(this.canvas);
            }
        }
    }
    



    // 加速度を座標に変換に変換
    acc_to_pos(){
        // 加速度を速度に変換(位置と角度)
        for( var axis in this.movement.acc.position ){

            // 角度の角加速度を角速度，角度に変換
            this.movement.vel.rotation[axis] += this.movement.acc.rotation[axis];
            this.camera.rotation[axis] += ( 2 * Math.PI / this.roc_turn) * this.movement.vel.rotation[axis] 
            this.movement.acc.rotation[axis] = 0;
            this.movement.vel.rotation[axis] = 0;
        }

        this.camera.position.x += this.movement.vel.position.x * Math.cos(this.camera.rotation.y) + this.movement.vel.position.z * Math.sin(this.camera.rotation.y)
        this.camera.position.z += this.movement.vel.position.z * Math.cos(this.camera.rotation.y) + -1 * this.movement.vel.position.x * Math.sin(this.camera.rotation.y)
    }

}


class block {
    constructor(scene) {
        this.boxes = new THREE.Group();    
        this.box_n = 5
        var box = new Array(this.box_n);
    
        for(var i=0; i < this.box_n ; i++){
            box[i] = new THREE.Mesh(
                new THREE.BoxGeometry(4000, 100, 4000),
                new THREE.MeshLambertMaterial({color: "rgb(100,0,0)"})
            );
            box[i].position.set(4000*i,0,4000*i)
            this.boxes.add(box[i])
        }
    

    }
}


function init(){

    elm = document.getElementById("text");


    // サイズを指定
    const width = 960;
    const height = 540;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas')
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    canvas = document.querySelector('#myCanvas')

    // シーンを作成
    const scene = new THREE.Scene();

    // 光源を作成
    const light = [ new THREE.DirectionalLight(0xFFFFFF), new THREE.AmbientLight(0xFFFFFF, 1.0) ];
    light[0].position.set(1000,500,0)
    scene.add(light[0]);
    scene.add(light[1]);

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

        camera.acc_to_pos()


        // レンダリング
        renderer.render(scene, camera.camera); 
        requestAnimationFrame(tick);


        elm.innerHTML = 'camera <br>posi-> x:' + camera.camera.position.x + ', y:' + camera.camera.position.y + ', z:' + camera.camera.position.z +
            '<br>acc -> x:' + camera.movement.acc.position.x + ', y:' + camera.movement.acc.position.y + ', z:' + camera.movement.acc.position.z +
            '<br>vel -> x:' + camera.movement.vel.position.x + ', y:' + camera.movement.vel.position.y + ', z:' + camera.movement.vel.position.z +
            '<br>rota x:' + camera.camera.rotation.x/Math.PI + 'PI, y:' + camera.camera.rotation.y/Math.PI + 'PI, z:' + camera.camera.rotation.z/Math.PI + 'PI'

            
    }



}



function init_o() {

    


    keydown_a = 0
    keydown_d = 0
    keydown_w = 0
    keydown_s = 0
    keydown_space = 0

    mouse_x = 0;
    mouse_y = 0;
    mouse_diff_x = 0
    mouse_diff_y = 0 
    mouse_move =0 ;

    elm = document.getElementById("text");

    // サイズを指定
    const width = 960;
    const height = 540;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas')
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    canvas = document.querySelector('#myCanvas')

    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成
    const camera_x_x = 0;
    const camera_x_y = 200;
    const camera_x_z = 1000;
    camera_v_x = 0;
    camera_v_z = 0;
    camera_v_y = 0;
    camera_a_y =0;
    const camera_speed = 50;
    const camera_a_jump = 100;
    const camera_a_grav = -5;

    camera_rota_x = 0;//上下
    camera_rota_y = 0;//左右
    camera_rota_z = 0;//正面むいて左右回転
    camera_rota_flag =0;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000000);
    camera.position.set(camera_x_x, camera_x_y, camera_x_z);
    camera.rotation.set(camera_rota_x, camera_rota_y, camera_rota_z);


    // 箱を作成
    boxes = new THREE.Group();    
    box_n = 5
    var box = new Array(box_n);

    for(i=0; i < box_n ; i++){
        box[i] = new THREE.Mesh(
            new THREE.BoxGeometry(4000, 100, 4000),
            new THREE.MeshLambertMaterial({color: "rgb(100,0,0)"})
        );
        box[i].position.set(4000*i,0,4000*i)
        boxes.add(box[i])
    }

    scene.add(boxes);
    
    const light = new THREE.DirectionalLight(0xFFFFFF);
    const light_2 = new THREE.AmbientLight(0xFFFFFF, 1.0);
    light.position.set(1000,500,0)
    scene.add(light);
    scene.add(light_2);

    // イベント時に呼び出される
    canvas.setAttribute('tabindex', 0); // focusしている時のみ、keyDown,up を有効に
    canvas.addEventListener('keydown', onKeyDown, false);
    canvas.addEventListener('keyup', onKeyUp, false);
    canvas.addEventListener('mousemove', onMouseMove, false);
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);


    console.log(camera.rotation);
    tick();

    // ****************************************
    // 毎フレーム時に実行されるループイベント関数
    // ****************************************
    function tick() {

        //ジャンプした場合，上(yの正)にジャンプ力だけ速度をあげる．
        if(camera_a_y > 0){
            camera_v_y += camera_a_y;
            camera_a_y = 0;
        }

        //地面に足がついていない場合，下(ｙの負)に重力分だけ速度をあげる．
        if(camera.position.y > camera_x_y){
            camera_v_y += camera_a_grav;
        }

        //速度分だけカメラを移動する．
        camera.position.x += camera_v_x * Math.cos(camera.rotation.y) + camera_v_z * Math.sin(camera.rotation.y)
        camera.position.z += camera_v_z * Math.cos(camera.rotation.y) + -1 * camera_v_x * Math.sin(camera.rotation.y)
        camera.position.y += camera_v_y ;

        //障害物があるときはその前で止まる
        if(camera.position.y <  camera_x_y){
            camera.position.y = camera_x_y;
            camera_v_y = 0;
        }

        //角度速度だけカメラを回す．
        if(mouse_move == 1){
            camera.rotation.y += mouse_diff_x
            //camera.rotation.x += mouse_diff_y
            mouse_move = 0
        }


        // レンダリング
        renderer.render(scene, camera); 
        requestAnimationFrame(tick);

        // 情報を出す
        elm.innerHTML = 'camera x-> x:' + camera.position.x + ', y:' + camera.position.y + ', z:' + camera.position.z +
                        '<br>rota x:' + camera.rotation.x/Math.PI + 'PI, y:' + camera.rotation.y/Math.PI + 'PI, z:' + camera.rotation.z/Math.PI + 'PI' +
                        '<br>mouse x:' + mouse_diff_x + ', y:' + mouse_diff_y
        
    }

    // ****************************************
    // キーが押されたときに動く関数
    // ****************************************
    function onKeyDown(e){
        var str = e.keyCode;
        switch(str){
            case 65:
                if(keydown_a == 0){
                    camera_v_x += -camera_speed;
                    keydown_a = 1;
                }
                break;
            case 68:
                if(keydown_d == 0){
                    camera_v_x += camera_speed;
                    keydown_d = 1;
                }
                break;
            case 87:
                if(keydown_w == 0){
                    camera_v_z += -camera_speed;
                    keydown_w = 1;
                }
                break;
            case 83:
                if(keydown_s == 0){
                    camera_v_z += camera_speed;
                    keydown_s = 1;
                }
                break;
            case 32:
                if(keydown_space == 0 && camera_v_y == 0){
                    camera_a_y = camera_a_jump
                    keydown_space = 1;
                }
            case 27://esc
                ElementExitPointerLock(e);
                mouse_move = 0;
                break;
            default:
                break;
        }


        console.log(str)
    }

    // ****************************************
    // キーが上げられたときに動く関数
    // ****************************************
    function onKeyUp(e){
        var str = e.keyCode;
        switch(str){
            case 65:
                camera_v_x -= -camera_speed;
                keydown_a = 0;
                break;
            case 68:
                camera_v_x -= camera_speed;
                keydown_d = 0;
                break;
            case 87:
                camera_v_z -= -camera_speed;
                keydown_w = 0;
                break;
            case 83:
                camera_v_z -= camera_speed;
                keydown_s = 0;
                break;
            case 32:
                keydown_space = 0;
                break;
            default:
                break;
        }
        console.log("-" + str)
    }
    // ****************************************
    // マウスが動かされたときに動く関数
    // ****************************************
    function onMouseMove(e){
        mouse_diff_x = Math.PI * -1 * e.movementX/400
        mouse_diff_y = Math.PI * e.movementY/400
        mouse_move = 1;
        console.log("mousemove")
        console.log(mouse_x+":"+mouse_y)
        
    }

    // ****************************************
    // 左クリックが押されたされたときに動く関数
    // ****************************************
    function onMouseDown(e){
        ElementRequestPointerLock(canvas);
        
    }

    function ElementRequestPointerLock(element){
        if(element["requestPointerLock"]){
            element["requestPointerLock"]();
            return true;
        }
		return false;
    }
    
    function ElementExitPointerLock(element){
        if(element["exitPointerLock"]){
            element["exitPointerLock"]();
            return true;
        }
		return false;
    }

    // ****************************************
    // 左クリックが上げられたときに動く関数
    // ****************************************
    function onMouseUp(){
        console.log('omanko');
    }
}