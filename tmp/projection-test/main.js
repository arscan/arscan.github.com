
var container = document.createElement( 'div' ),
    stats = new Stats(), 
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } ), 
    camera = new THREE.OrthographicCamera(0, 1280, 580, 0, -1000, 1000),
    scene = new THREE.Scene(),

    skeletonPanel = createSkeletonPanel(renderer, 250, 400, 512/2+ 500, 512/2+ 60),
    namePanel = createNamePanel(renderer, 400, 400, 300, 512/2 + 60),
    
    projectorPanel = createProjectorPanel(renderer, 1280, 580, [namePanel, skeletonPanel]);
    backgroundPanel = createBackgroundPanel(renderer, 1280, 580),

    bottomPanel = createBottomPanel($("#bottom-panel")),
    
    clock = new THREE.Clock();


// backgroundPanel.quad.position.set(1280/2,580/2, 0);
// projectorPanel.quad.position.set(1280, 580/2, 1);

//remove
// scene.add(skeletonPanel.quad);

//remove
// scene.add(namePanel.quad);

// scene.add(leftQuad);
scene.add(projectorPanel.quad);
scene.add(backgroundPanel.quad);

container.appendChild( stats.domElement );
document.body.appendChild( container );
renderer.setSize( 1280, 580 );
container.appendChild( renderer.domElement );


// createLeftPanel(renderer, /* rendertarget for this panel */);


function render(){
    var time = clock.getElapsedTime();
    stats.update();
    backgroundPanel.render();

    skeletonPanel.quad.position.x = projectorPanel.width / 2 + Math.sin(time/2) * 300;
    skeletonPanel.render();
    namePanel.render();
    projectorPanel.render();

    renderer.render(scene, camera);

    // call render of each
    // render my effect composer

    requestAnimationFrame(render);

    TWEEN.update();
}

render();

$(document).on("click",function(event){
    namePanel.quad.position.set(event.clientX, 580-event.clientY - namePanel.height / 2, 0);

});

