// ページの読み込みを待つ

function init() {

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
    ca = document.getElementById("myCanvas");

    Screen.showCursor = false;
	// マウスカーソルを画面内にロックする
    Screen.lockCursor = true;

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
    //const material = new THREE.MeshStandardMaterial({color: 0xFF0000});
    //const geometry = new THREE.BoxGeometry(4000, 100, 4000);
    //const box = new THREE.Mesh(geometry, material);
    //box.position.set(0,0,0)

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
        ElementRequestPointerLock(ca);
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

    }
}