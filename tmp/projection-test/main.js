
    var stats;
    stats = new Stats();
var container;
var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );

container = document.createElement( 'div' );
container.appendChild( stats.domElement );
document.body.appendChild( container );
renderer.setSize( 512, 512 );
container.appendChild( renderer.domElement );


createLeftPanel(renderer, 512, 512);
// createLeftPanel(renderer, /* rendertarget for this panel */);


function render(){

    // call render of each
    // render my effect composer

    // requestAnimationFrame(render);
}

render();
