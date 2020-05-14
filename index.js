

let active_flag = false;

let flame = 0;
let time = 0




// サイズを指定
const width = window.innerWidth;
const height = window.innerHeight/5*3;
const player_height = 800;

const s_flame = 1/60;
const base_size = 1000; //メートル扱いする
const gravity = -1 * base_size *  5 * s_flame;

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

playing = false;
test_hit = false;


function init(){
    playing = true;
    const start = performance.now();
    elm = document.getElementById("text");

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas')
    });
    renderer.setPixelRatio(1);
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
    camera = new player(canvas);
    box = new block();
    box.make_floor();
    //scene.add(box.boxes);


    boss = new snowman(box)
    //boss.add(scene);
    scene.add(boss.body)
    boss.action = boss.motion_hummer

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
        
        let flame_time = performance.now();

        if(active_flag){
            camera.set_move();
            camera.moving( box.hit_judge( camera.camera.position, camera.movement.set.position, camera.hit_position ,camera.on_ground ,true));
        }

        boss.action()

        // レンダリング
        renderer.render(scene, camera.camera); 
        


        elm.innerHTML = //"<br>Point:" + points.get + "/" + points.max_point + 
            "<br>time" + (flame_time - time) +
            '<br>size : ' + box.field.x + ',' + box.field.y + ',' + box.field.z + 
            '<br>camera <br>posi-> x:' + camera.camera.position.x + ', y:' + camera.camera.position.y + ', z:' + camera.camera.position.z +
            '<br>acc -> x:' + camera.movement.acc.position.x + ', y:' + camera.movement.acc.position.y + ', z:' + camera.movement.acc.position.z +
            '<br>vel -> x:' + camera.movement.vel.position.x + ', y:' + camera.movement.vel.position.y + ', z:' + camera.movement.vel.position.z +
            '<br>rota x:' + camera.camera.rotation.x/Math.PI + 'PI, y:' + camera.camera.rotation.y/Math.PI + 'PI, z:' + camera.camera.rotation.z/Math.PI + 'PI'+
            '<br>qua x:' + camera.camera.quaternion.x/Math.PI + 'PI, y:' + camera.camera.quaternion.y/Math.PI + 'PI, z:' + camera.camera.quaternion.z/Math.PI + 'PI'   

        time = performance.now()
        requestAnimationFrame(tick);    
    }


    console.log('end: ', performance.now() - start, 'ms');
}



function distance( a, b ){
    
    dis = Math.sqrt( Math.pow((a.x - b.x),2) + Math.pow((a.y - b.y),2) + Math.pow((a.z - b.z),2))
    return(dis)

}


