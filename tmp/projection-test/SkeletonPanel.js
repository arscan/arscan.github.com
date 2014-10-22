function createSkeletonPanel(renderer, renderTarget){

   var renderScene,
       renderCamera,
       clock,
       renderComposer,
       mainComposer,
       projectorComposer,
       blurComposer;
       // glowComposer;

   var canvasWidth = renderTarget.width;
   var canvasHeight = renderTarget.height;

    var Shaders = {
        skeleton: {
            uniforms : {
                currentTime: {type: 'f', value: 100.0},
            },
            vertexShader: [
                '#define INTRODURATION 5.0',
                'varying vec3 vNormal;',
                'uniform float currentTime;',
                'void main() {',
                '  vNormal = normalize( normalMatrix * normal );',
                '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying vec3 vNormal;',
                'uniform float currentTime;',
                'void main() {',
                '  if(gl_FragCoord.y < currentTime * 150.0){',
                '    float intensity = 1.2 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
                '    vec3 outline = vec3( 0.0708, 0.714, 0.652 ) * pow( intensity, 1.0 );',
                '    gl_FragColor = vec4(outline, intensity);',
                ' } ',
                '}'
            ].join('\n')
        },
        organs: {
            uniforms : {
                currentTime: {type: 'f', value: 100.0},
            },
            vertexShader: [
                '#define INTRODURATION 5.0',
                'varying vec3 vNormal;',
                'uniform float currentTime;',
                'void main() {',
                '  vNormal = normalize( normalMatrix * normal );',
                '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
                '}'
            ].join('\n'),
            fragmentShader: [
                'varying vec3 vNormal;',
                'uniform float currentTime;',
                'uniform vec3 vMyColor;',
                'void main() {',
                '  if(gl_FragCoord.y < currentTime * 150.0){',
                '    float intensity = 1.3 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
                '    vec3 outline = vec3( 0.5708, 0.314, 0.252 ) * pow( intensity, 1.0 );',
                '    gl_FragColor = vec4(outline, intensity);',
                ' } ',
                '}'
            ].join('\n')
        }
    };



    var BLURINESS = 3.9;

    function createRenderTarget(width, height){
        var params = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat};
        return new THREE.WebGLRenderTarget(width, height, params);
    }

    function init(){
        clock = new THREE.Clock();

        // renderCamera = new THREE.PerspectiveCamera( 70, canvasWidth / canvasHeight, 1, 1000 );
        renderCamera = new THREE.OrthographicCamera(0, canvasWidth, canvasHeight, 0, -1000, 1000),
        renderScene = new THREE.Scene();

        var loader = new THREE.OBJLoader();

        var skeletonMaterial = new THREE.ShaderMaterial({
            uniforms: Shaders.skeleton.uniforms,
            vertexShader: Shaders.skeleton.vertexShader,
            fragmentShader: Shaders.skeleton.fragmentShader,
            shading: THREE.SmoothShading
        });

        var organMaterial = new THREE.ShaderMaterial({
            uniforms: Shaders.organs.uniforms,
            vertexShader: Shaders.organs.vertexShader,
            fragmentShader: Shaders.organs.fragmentShader,
        });

        skeletonMaterial.transparent = true;
        
        organMaterial.transparent = true;

        skeletonMaterial.blending = THREE.AdditiveBlending;
        organMaterial.blending = THREE.AdditiveBlending;

        loader.load( 'skeleton2.obj', function ( skeletonObject ) {

            skeletonObject.children[0].geometry.mergeVertices();
            skeletonObject.children[0].geometry.computeVertexNormals();
            skeletonObject.children[0].scale.set(1.5,1.5,1.5);
            skeletonObject.children[1].geometry.computeVertexNormals();
            skeletonObject.children[1].scale.set(1.5,1.5,1.5);

            skeletonObject.children[0].material = skeletonMaterial;
            skeletonObject.children[1].material = organMaterial;

            skeletonObject.position.set(canvasWidth/2, canvasHeight/8, 0);

            renderScene.add(skeletonObject);

        });

        renderComposer = new THREE.EffectComposer(renderer, renderTarget);
        renderComposer.addPass(new THREE.RenderPass(renderScene, renderCamera));

        var renderScenePass = new THREE.TexturePass(renderComposer.renderTarget2);

        // projectorComposer = new THREE.EffectComposer(renderer, createRenderTarget(canvasWidth/1.5, canvasHeight/1.5));
        // projectorComposer.addPass(renderScenePass);
        // projectorComposer.addPass(new THREE.ProjectorPass(renderer, new THREE.Vector2(-.18, 0)));

        blurComposer = new THREE.EffectComposer(renderer, createRenderTarget(canvasWidth/4, canvasHeight/4));
        blurComposer.addPass(renderScenePass);
        blurComposer.addPass(new THREE.ShaderPass(THREE.HorizontalBlurShader, {h: BLURINESS / (canvasWidth/4)}));
        blurComposer.addPass(new THREE.ShaderPass(THREE.VerticalBlurShader, {v: BLURINESS / (canvasHeight/4)}));
        blurComposer.addPass(new THREE.ShaderPass(THREE.HorizontalBlurShader, {h: (BLURINESS/4) / (canvasWidth/4)}));
        blurComposer.addPass(new THREE.ShaderPass(THREE.VerticalBlurShader, {v: (BLURINESS/4) / (canvasHeight/4)}));
        blurComposer.addPass(new THREE.ShaderPass(THREE.HorizontalBlurShader, {h: (BLURINESS/4) / (canvasWidth/4)}));
        blurComposer.addPass(new THREE.ShaderPass(THREE.VerticalBlurShader, {v: (BLURINESS/4) / (canvasHeight/4)}));
        blurComposer.addPass(new THREE.ShaderPass(THREE.VerticalBlurShader, {v: (BLURINESS/4) / (canvasHeight/4)}));


        // mainComposer = new THREE.EffectComposer(renderer, createRenderTarget(canvasWidth, canvasHeight));
        mainComposer = new THREE.EffectComposer(renderer, renderTarget);
        mainComposer.addPass(renderScenePass);
        mainComposer.addPass(new THREE.ShaderPass(THREE.FXAAShader, {resolution: new THREE.Vector2(1/canvasWidth, 1/canvasHeight)}));

        // glowComposer = new THREE.EffectComposer(renderer, createRenderTarget(canvasWidth, canvasHeight));
        // glowComposer.addPass(renderScenePass);

        // glowComposer.addPass(new THREE.ShaderPass( THREE.HorizontalBlurShader, {h: 2/canvasWidth} ));
        // glowComposer.addPass(new THREE.ShaderPass(THREE.VerticalBlurShader, {v: 2/canvasHeight}));
        // glowComposer.addPass(new THREE.ShaderPass( THREE.HorizontalBlurShader, {h: 1/canvasWidth} ));
        // glowComposer.addPass(new THREE.ShaderPass(THREE.VerticalBlurShader, {v: 1/canvasHeight}));

        var addPass = new THREE.ShaderPass(THREE.AdditiveBlendShader);
        addPass.uniforms['tAdd'].value = blurComposer.writeBuffer;
        mainComposer.addPass(addPass);

        var addPass2 = new THREE.ShaderPass(THREE.AdditiveBlendShader);
        addPass2.uniforms['tAdd'].value = blurComposer.writeBuffer;
        mainComposer.addPass(addPass2);


        // setInterval(function(){
        //     addPass3.enabled = !addPass3.enabled;
        // }, 1000);

        // renderScenePass.uniforms[ "tDiffuse" ].value = fullResolutionComposer.renderTarget2;
    }

    function render(){
        // renderer.render(mainScene, camera);
        var time = clock.getElapsedTime();

        if(renderScene.children.length > 0){
            renderScene.children[0].rotation.y -= .005;
        }

        TWEEN.update();

        Shaders.skeleton.uniforms.currentTime.value = time -6;
        Shaders.organs.uniforms.currentTime.value = time -7;
        renderComposer.render();

        blurComposer.render();
        blurComposer.render();
        // glowComposer.render();

        mainComposer.render();

    }

    init();

    return Object.freeze({
        render: render



    });
}

