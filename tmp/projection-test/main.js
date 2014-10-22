
var container = document.createElement( 'div' ),
    stats = new Stats(), 
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } ), 
    camera = new THREE.OrthographicCamera(0, 1280, 580, 0, 0, 100),
    scene = new THREE.Scene(),

    targetParams = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat},

    leftPanelTarget = new THREE.WebGLRenderTarget(512, 512, targetParams),
    leftPanel = createLeftPanel(renderer, leftPanelTarget),
    leftQuad = new THREE.Mesh( new THREE.PlaneGeometry(512, 512), new THREE.MeshBasicMaterial({map: leftPanelTarget, transparent: true}))
    leftQuad.material.blending = THREE.AdditiveBlending

    //remove
    skeletonPanelTarget = new THREE.WebGLRenderTarget(250, 400, targetParams),
    skeletonPanel = createSkeletonPanel(renderer, skeletonPanelTarget),
    skeletonQuad = new THREE.Mesh( new THREE.PlaneGeometry(250, 400), new THREE.MeshBasicMaterial({map: skeletonPanelTarget, transparent: true}))
    skeletonQuad.material.blending = THREE.AdditiveBlending

    backgroundPanelTarget = new THREE.WebGLRenderTarget(1280, 580, targetParams),
    backgroundPanel = createBackgroundPanel(renderer, backgroundPanelTarget),
    backgroundQuad = new THREE.Mesh( new THREE.PlaneGeometry(1280, 580), new THREE.MeshBasicMaterial({map: backgroundPanelTarget})),

    bottomPanel = createBottomPanel($("#bottom-panel"))


    ;

leftQuad.position.set(512/2,512/2 + 60, 0);
backgroundQuad.position.set(1280/2,580/2, 0);


//remove
skeletonQuad.position.set(512/2 + 500,512/2 + 60, 0);
scene.add(skeletonQuad);


scene.add(leftQuad);
scene.add(backgroundQuad);

container.appendChild( stats.domElement );
document.body.appendChild( container );
renderer.setSize( 1280, 530 );
container.appendChild( renderer.domElement );


// createLeftPanel(renderer, /* rendertarget for this panel */);


function render(){
    stats.update();
    leftPanel.render();
    backgroundPanel.render();

    // remove
    skeletonPanel.render();

    renderer.render(scene, camera);

    // call render of each
    // render my effect composer

    requestAnimationFrame(render);
}

render();
