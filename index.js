// ページの読み込みを待つ

function init() {

    // サイズを指定
    const width = 960;
    const height = 540;

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#myCanvas')
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // シーンを作成
    const scene = new THREE.Scene();

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height);
    vec = 20;
    acs = 2;
    camera.position.set(0, 0, +1000);

    // 箱を作成
    const geometry = new THREE.BoxGeometry(400, 100, 400);
    const material = new THREE.MeshNormalMaterial();
    const box = new THREE.Mesh(geometry, material);
    scene.add(box);

    tick();

    // 毎フレーム時に実行されるループイベントです
    function tick() {
        //box.rotation.y += 0.01;
        box.position.y += vec
        if(box.position.y > 200 || box.position.y < -200){
            vec *= -acs
            if( Math.abs(vec) > 10 * Math.pow(2,4) + 1 || Math.abs(vec) < 20 - 1 ){
                acs = 1/acs
            }
            if (box.position.y > 0){
                box.position.y = 200;
            }else{
                box.position.y = -200
            }
        }


        
        
        renderer.render(scene, camera); // レンダリング
        requestAnimationFrame(tick);
    }
}