// browserify source.js -t babelify --outfile index.js

const Stats = require('stats.js');
const stats = new Stats();
const rotateY = require('gl-mat4').rotateY;
const rotateX = require('gl-mat4').rotateX;
const rotateZ = require('gl-mat4').rotateZ;
const scale = require('gl-mat4').scale;
const tween = require('tween.js')

const webgl_support = () => { 
  try{
    var canvas = document.createElement( 'canvas' ); 
    return !! window.WebGLRenderingContext && ( 
                                               canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) );
  }catch( e ) { return false; } 
};

if(!webgl_support()){
  [].forEach.call(document.getElementsByClassName('ok'), (e) => {e.style.display='none';}); 
  [].forEach.call(document.getElementsByClassName('error'), (e) => {e.style.display='';}); 
  throw('Cant set up webgl');
}

stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

let cameraProps = {
  center: [0, 0, 0],
  distance: .2,
  theta: Math.PI/2,
  phi: -Math.PI/3,
  up: [-.5,1,0],
  mouse: true
};

let canvas = document.getElementById('canvas');
canvas.width = window.outerWidth;
canvas.height = window.outerHeight;

const regl = require('regl')({canvas: document.getElementById('canvas'), extensions: ['webgl_depth_texture']}) 
const camera = require('regl-camera')(regl, cameraProps)

const depthBuf = regl.texture({
    width: window.innerWidth,
    height: window.innerHeight,
    format: 'depth', 
    type: 'uint32'
})

const meshFbo = regl.framebuffer({
    color: regl.texture({
        width: window.innerWidth,
        height: window.innerHeight,
    }),
    depth: depthBuf
})

const blurFbo = regl.framebuffer({
    color: regl.texture({
        width: window.innerWidth,
        height: window.innerHeight,
    }),
})
const blurFboPong = regl.framebuffer({
    color: regl.texture({
        width: window.innerWidth,
        height: window.innerHeight,
    }),
})

const dim = 55;

let grid = [];
let points = [];
let lines = [];

/* build grid for reference, add points */

for(let row = 0; row< dim; row++){
  grid[row] = [];
  for(let col = 0; col< dim; col++){
    let coords = [2*row/dim-1, (row % 2) * .01 + 2*col/dim-1, (Math.cos(row/5)) * (Math.sin(col/5 )) / 20  + Math.random() / 200, 1];
    grid[row][col] = coords;
    points.push(coords);
  }
}

/* floating specs */

for(let i= 0; i< 500; i++){
  points.push([Math.random() - .5, Math.random() - .5, (Math.random() - .5) / 4, Math.random() * 2 + 1]);
}

/* build lines */

for(let row = 0; row< dim; row++){
  for(let col = 0; col< dim; col++){
    if(col < dim - 1){
      lines.push([grid[row][col], grid[row][col+1]]);
    }
    if(row < dim - 1){
      lines.push([grid[row][col], grid[row+1][col]]);
    }
    if(row < dim - 1 && col < dim - 1){
      lines.push([grid[row][col], grid[row+1][col+1]]);
    }
    if(row < dim - 5 && col < dim - 5 && Math.random() > .8){
      lines.push([grid[row][col], grid[row + 1][col + 2]]);
    }
  }
}

const drawLines = regl({

  vert: `
  precision mediump float;
  attribute vec4 position;
  uniform vec3 color;
  varying vec3 fragColor;
  varying vec3 eye;
  uniform float time;
  uniform mat4 projection, view;
  void main () {
    float distance = distance((view * vec4(position.xyz,1)).xyz, eye);
    gl_Position = projection * view * vec4(position.xyz, 1);
    fragColor = color + sin(time/2. + position.y * 3.)/3.;
    if(distance * distance > .5){
      // TODO FIGURE OUT DISTANCE
      fragColor = fragColor * (1.5 - (distance * distance) );
    }
  }`,

  frag: `
  precision lowp float;
  varying vec3 fragColor;
  void main () {
    gl_FragColor = vec4(fragColor, 1);
  }`,


  attributes: {
    position: lines
  },
  uniforms: {
    color: [1, 1, .8],
    time: (context) => context.time
  },
  lineWidth: 1,
  primitive: 'lines',
  framebuffer: meshFbo,
  count: lines.length * 2
})

const drawPoints = regl({

  vert: `
  precision mediump float;
  attribute vec4 position;
  uniform vec3 color;
  uniform float time;
  varying vec3 fragColor;
  varying vec3 eye;
  uniform mat4 projection, view;
  void main () {
    float zPos=position.z;
    float distance = distance((view * vec4(position.xy,zPos,1)).xyz, eye);
    gl_PointSize = 4.0 * 1.0/distance;
    fragColor = color;
    if(distance * distance > .5){
      fragColor = fragColor * (1.5 - (distance * distance) );
    }
    if(position.a > 1.){
      // floating specs
      zPos = position.z + sin(time * cos((position.a - 1.5) * 10.) / 5.)/50.;//-(position.z - 1.);
      gl_PointSize = 2.0 * 1.0/distance * (position.a - 1.);
    } else {
      // grid points
      fragColor = fragColor + sin(time/2. + position.y * 3.)/3.;
    }
    gl_Position = projection * view * vec4(position.xy,zPos, 1);
  }`,

  frag: `
  precision lowp float;
  varying vec3 fragColor;
  varying float alpha;
  void main () {
    if (length(gl_PointCoord.xy - 0.5) > 0.5) {
      discard;
    }
    gl_FragColor = vec4(fragColor, 1.);
  }`,

  attributes: {
    position: points
  },
  uniforms: {
    color: [1, 1, .8],
    time: (context) => context.time
  },
  primitive: 'points',
  framebuffer: meshFbo,
  count: points.length,
})

const drawHBlurredFbo = regl({
  frag: `
  precision mediump float;

  uniform sampler2D tex;
  uniform float h;

  varying vec2 vUv;

  void main() {

    vec4 sum = vec4( 0.0 );

    sum += texture2D( tex, vec2( vUv.x - 5.0 * h, vUv.y ) )/11.0;
    sum += texture2D( tex, vec2( vUv.x - 4.0 * h, vUv.y ) )/11.0;
    sum += texture2D( tex, vec2( vUv.x - 3.0 * h, vUv.y ) )/11.0;
    sum += texture2D( tex, vec2( vUv.x - 2.0 * h, vUv.y ) )/11.0;
    sum += texture2D( tex, vec2( vUv.x - 1.0 * h, vUv.y ) )/11.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y ) ) / 11.0;
    sum += texture2D( tex, vec2( vUv.x + 1.0 * h, vUv.y ) )/11.0;
    sum += texture2D( tex, vec2( vUv.x + 2.0 * h, vUv.y ) )/11.0;
    sum += texture2D( tex, vec2( vUv.x + 3.0 * h, vUv.y ) )/11.0;
    sum += texture2D( tex, vec2( vUv.x + 4.0 * h, vUv.y ) )/11.0;
    sum += texture2D( tex, vec2( vUv.x + 5.0 * h, vUv.y ) )/11.0;

    gl_FragColor = sum;

  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = 0.5 * (position + 1.0);
    gl_Position = vec4(position, 0, 1);
  }`,
  attributes: {
    position: [ -4, -4, 4, -4, 0, 4 ]
  },
  uniforms: {
    tex: regl.prop('tex'),
    h: ({viewportWidth}) => 1.0 / viewportWidth
  },
  framebuffer: regl.prop('dest'),
  count: 3
})

const drawVBlurredFbo = regl({
  frag: `
  precision mediump float;

  uniform sampler2D tex;
  uniform float v;

  varying vec2 vUv;

  void main() {

    vec4 sum = vec4( 0.0 );

    sum += texture2D( tex, vec2( vUv.x, vUv.y - 6.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y - 5.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y - 4.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y - 3.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y - 2.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y - 1.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y + 1.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y + 2.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y + 3.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y + 4.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y + 5.0 * v ) )/13.0;
    sum += texture2D( tex, vec2( vUv.x, vUv.y - 6.0 * v ) )/13.0;

    gl_FragColor = sum;

  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = 0.5 * (position + 1.0);
    gl_Position = vec4(position, 0, 1);
  }`,
  attributes: {
    position: [ -4, -4, 4, -4, 0, 4 ]
  },
  uniforms: {
    tex: regl.prop('tex'),
    v: ({viewportHeight}) => 1.0 / viewportHeight
  },
  framebuffer: regl.prop('dest'),
  count: 3
})

const drawFinalFbo = regl({
  frag: `
  precision mediump float;
  varying vec2 uv;
  uniform sampler2D meshTex;
  uniform sampler2D depthTex;
  uniform sampler2D blurTex;
  uniform float wRcp, hRcp;
  void main() {

    vec3 blurred = vec3(texture2D(blurTex, uv)) * 1.3;
    vec3 orig = vec3(texture2D(meshTex, uv)) + blurred;
    float dValue = texture2D(depthTex, uv).r; 
    vec3 finalColor;
    float diff = 0.;
    if(dValue > .93 && dValue < .98){
      if(dValue > .955){
        diff = (dValue - .955) * 40.;
      } else {
        diff = (.955 - dValue) * 40.;
      }
      // finalColor =vec3(diff);
      finalColor = (blurred * diff) + (orig * (1. -diff));
    } else {
      finalColor = blurred;
    }
    // finalColor = finalColor + texture2D(dustTex, uv).rgb; 
    gl_FragColor.rgb =  finalColor + vec3(0.,.1,.2) * ((1.-uv.x)*2. * (uv.y*2.));
  }`,

  vert: `
  precision mediump float;
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = 0.5 * (position + 1.0);
    gl_Position = vec4(position, 0, 1);
  }`,
  attributes: {
    position: [ -4, -4, 4, -4, 0, 4 ]
  },
  uniforms: {
    meshTex: ({count}) => meshFbo,
    depthTex: ({count}) => meshFbo.depth,
    blurTex: ({count}) => blurFboPong,
  },
  blend: {
    enable: true,
    func: {src: 1, dst: 1},
    color: [0, 0, 0, 0]
  },
  count: 3
})


let rotate = {x: 0, y: -Math.PI/8, z: 0}

setInterval(function(){
  new tween.Tween(rotate).easing(tween.Easing.Quartic.InOut).to(
    { x: Math.random() * 2 * Math.PI,
      y: Math.random() * 2 *  Math.PI,
      z: Math.random() * 2 * Math.PI 
  }, 3000).start();
}, 5000);

const clear = () => { regl.clear({ color: [0, 0, 0, 1], depth: 1 }) };

regl.frame(({viewportWidth, viewportHeight}) => {
  stats.begin();
  // cameraProps['distance'] = .1;

  tween.update();
  camera((state) => {

    clear()
    meshFbo.use(clear);
    blurFbo.use(clear);
    blurFboPong.use(clear);

    meshFbo.resize(viewportWidth, viewportHeight);
    blurFbo.resize(viewportWidth, viewportHeight);
    blurFboPong.resize(viewportWidth, viewportHeight);

    rotateX(state.view, state.view, rotate.x);
    rotateY(state.view, state.view, rotate.y);
    rotateZ(state.view, state.view, rotate.z);

    drawLines();
    drawPoints();

    drawVBlurredFbo({dest: blurFbo, tex: meshFbo});
    blurFboPong.use(clear);
    drawHBlurredFbo({dest: blurFboPong, tex: blurFbo});
    blurFbo.use(clear);
    drawVBlurredFbo({dest: blurFbo, tex: blurFboPong});
    blurFboPong.use(clear);
    drawHBlurredFbo({dest: blurFboPong, tex: blurFbo});
    // blurFbo.use(clear);
    // drawVBlurredFbo({dest: blurFbo, tex: blurFboPong});
    // blurFboPong.use(clear);
    // drawHBlurredFbo({dest: blurFboPong, tex: blurFbo});

    drawFinalFbo();
  });
  stats.end();
});

