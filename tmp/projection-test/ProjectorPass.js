/**
 * @author rscanlon / http://robscanlon.com/
 */

THREE.ProjectorShaders = {

    Generate: {

        uniforms: {

            tDiffuse: {
                type: "t",
                value: null
            },
            fStepSize: {
                type: "f",
                value: 1.0
            },

            vProjectorLocation: {
                type: "v2",
                value: new THREE.Vector2( 0.0, 1.0 )
            }

        },

        vertexShader: [

            "varying vec2 vUv;",

            "void main() {",

                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"

        ].join("\n"),

        fragmentShader: [

            "#define TAPS_PER_PASS 6.0",

            "varying vec2 vUv;",

            "uniform sampler2D tDiffuse;",

            "uniform vec2 vProjectorLocation;",
            "uniform float fStepSize;", // filter step size

            "void main() {",

                // delta from current pixel to "sun" position

                "vec2 delta = vUv - vProjectorLocation;", // MODIFIED BY RSCANLON TO BE NEGATIVE 1
                "float dist = length( delta );",

                // Step vector (uv space)

                "vec2 stepv = fStepSize * delta / dist;",

                // Number of iterations between pixel and sun

                "vec2 uv = vUv.xy;",
                "vec4 col = vec4(0.0);",

                "for ( float i = 0.0; i < TAPS_PER_PASS; i += 1.0 ) {",
                "  col += texture2D(tDiffuse, uv); ",
                "  uv += stepv; ",
                "}",
                "gl_FragColor = vec4(col / 3.0);",
            "}"

        ].join("\n")

    },

    /**
     * Additively applies god rays from texture tGodRays to a background (tColors).
     * fGodRayIntensity attenuates the god rays.
     */

    'combine': {

        uniforms: {

            tDiffuse: {
                type: "t",
                value: null
            },

            // tBlur: {
            //     type: "t",
            //     value: null
            // },

            tGodRays: {
                type: "t",
                value: null
            },

            tMask: {
                type: "t",
                value: null
            },

            fTick: {
                type: "f",
                value: 0.0
            },

            fGodRayIntensity: {
                type: "f",
                value: 0.69
            },

            vProjectorLocation: {
                type: "v2",
                value: new THREE.Vector2( 0.5, 0.5 )
            }

        },

        vertexShader: [

            "varying vec2 vUv;",

            "void main() {",

                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"

            ].join("\n"),

        fragmentShader: [

            "varying vec2 vUv;",

            "uniform sampler2D tDiffuse;",
            "uniform sampler2D tGodRays;",
            "uniform sampler2D tMask;",
            "uniform float fTick;",

            "uniform vec2 vProjectorLocation;",
            "uniform float fGodRayIntensity;",

            "void main() {",

                // Since THREE.MeshDepthMaterial renders foreground objects white and background
                // objects black, the god-rays will be white streaks. Therefore value is inverted
                // before being combined with tColors
            //
                "vec4 cColors = texture2D(tDiffuse, vUv);",
                "vec4 cGodRays = texture2D(tGodRays, vUv);",
                // "vec4 cMask = texture2D(tMask, vUv);",
                "float offset = (fTick/40.0 );",
                // "float offset = tick;",
                // "float offset = 0.5;",
                // "vec4 cBlur = texture2D(tBlur, vUv);",

                // "cBlur.a = min(cBlur.a,1.0);",
                // "cGodRays.a = max(cGodRays.r + cGodRays.g + cGodRays.b, cBlur.a);",
                "cGodRays.a = min(cGodRays.r + cGodRays.g + cGodRays.b, 1.0);",

                // "cBlur.a = cBlur.a / 8.0;",
                "cGodRays.a = cGodRays.a / 3.0;",

                // "gl_FragColor = (cBlur + cGodRays) / 2.0;", //changed by rscanlon
                "gl_FragColor =cGodRays;", //changed by rscanlon
                // "gl_FragColor.a = max(cBlur.a, cGodRays.a);",
                //

                // "if(cGodRays.a > cBlur.a){",
                // "   gl_FragColor = cGodRays;",
                // "}",


                // "if (cBlur.a > 0.1 && cGodRays.a > 0.1){",
                // "  gl_FragColor = cBlur * 0.8 + cGodrays * 0.2;",
                // "}",

                "if (cColors.a > 0.0){",
                "  gl_FragColor = cColors;",
                "}",

                "gl_FragColor.a = gl_FragColor.a - texture2D(tMask, vec2(mod(vUv.x - offset, 1.0), vUv.y)).r;",


                // "gl_FragColor.a = (texture2D(tGodRays, vUv).r + texture2D(tGodRays,vUv).g + texture2D(tGodRays, vUv).b + texture2D(tColors, vUv).a / 2.0 + texture2D(tBlur,vUv).a);",
                // "gl_FragColor.a = (texture2D(tGodRays, vUv).r + texture2D(tGodRays,vUv).g + texture2D(tGodRays, vUv).b + texture2D(tColors, vUv).a / 2.0 + texture2D(tBlur,vUv).a);",
                // "gl_FragColor.a = 1.0;",

                // "gl_FragColor = texture2D( tBlur, vUv );", //changed by rscanlon


            "}"

        ].join("\n")

    }
};

THREE.ProjectorPass = function ( renderer, projectorLocation) {


    this.textureID = "tDiffuse";
    this.renderer = renderer;

    // this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    this.generateUniforms = THREE.UniformsUtils.clone(THREE.ProjectorShaders.Generate.uniforms);
    this.generateMaterial = new THREE.ShaderMaterial( {

        uniforms: this.generateUniforms,
        vertexShader: THREE.ProjectorShaders.Generate.vertexShader,
        fragmentShader: THREE.ProjectorShaders.Generate.fragmentShader

    } );

    if(projectorLocation !== undefined){
        this.generateUniforms.vProjectorLocation.value = projectorLocation;
    }


    this.renderToScreen = true;

    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;


    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
    this.scene.add( this.quad );
};

function calcStepLen(pass){
        var filterLen = 1.0;
        var TAPS_PER_PASS = 6.0;
        return filterLen * Math.pow(TAPS_PER_PASS, -pass);

}

THREE.ProjectorPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

        if ( this.generateUniforms[ this.textureID ] ) {

            this.generateUniforms[ this.textureID ].value = readBuffer;

        }

        this.generateUniforms.fStepSize.value = calcStepLen(1.0);
        this.quad.material = this.generateMaterial;
        renderer.render( this.scene, this.camera, writeBuffer, this.clear );

        this.generateUniforms[ this.textureID ].value = writeBuffer;
        this.generateUniforms.fStepSize.value = calcStepLen(2.0);
        renderer.render( this.scene, this.camera, readBuffer, this.clear );
        this.generateUniforms[ this.textureID ].value = readBuffer;
        this.generateUniforms.fStepSize.value = calcStepLen(3.0);
        renderer.render( this.scene, this.camera, writeBuffer, this.clear );
        this.generateUniforms[ this.textureID ].value = writeBuffer;
        this.generateUniforms.fStepSize.value = calcStepLen(4.0);
        renderer.render( this.scene, this.camera, readBuffer, this.clear );
        this.generateUniforms[ this.textureID ].value = readBuffer;
        this.generateUniforms.fStepSize.value = calcStepLen(5.0);

        this.needsSwap = false;

        if ( this.renderToScreen ) {

            renderer.render( this.scene, this.camera );

        } else {

            renderer.render( this.scene, this.camera, readBuffer, this.clear );

        }

    }

};
