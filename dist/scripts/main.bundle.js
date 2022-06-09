/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/index.ts":
/*!******************************!*\
  !*** ./src/scripts/index.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const three_1 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
const OrbitControls_js_1 = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls.js */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
const GLTFLoader_1 = __webpack_require__(/*! three/examples/jsm/loaders/GLTFLoader */ "./node_modules/three/examples/jsm/loaders/GLTFLoader.js");
const Face_Sader_1 = __webpack_require__(/*! ./shaders/Face.Sader */ "./src/scripts/shaders/Face.Sader.ts");
const tweakpane_1 = __webpack_require__(/*! tweakpane */ "./node_modules/tweakpane/dist/tweakpane.js");
const Particles_Shader_1 = __webpack_require__(/*! ./shaders/Particles.Shader */ "./src/scripts/shaders/Particles.Shader.ts");
//
class ModelScene {
    constructor() {
        this.elapsedTime = 0;
        this.numberOfLines = 100;
        this.moveForward = true;
        this.clickElapsedTime = 0;
        this.sizes = {
            height: 0,
            width: 0
        };
        this.tick = () => {
            this.delta = this.clock.getDelta();
            this.elapsedTime += this.delta;
            this.clickDelta = this.clockForClick.getDelta();
            if (this.moveForward)
                this.clickElapsedTime += this.clickDelta;
            else
                this.clickElapsedTime -= this.clickDelta;
            this.canvas.addEventListener('mousedown', () => {
                this.moveForward = true;
                // this.clickDelta = 0;
                this.clockForClick.start();
            });
            this.canvas.addEventListener('mouseup', () => {
                // this.clickDelta = 0;
                this.moveForward = false;
            });
            if (this.faceModel) {
                if (this.faceModel.position.z <= -1.7 && this.moveForward === true) {
                    if (+this.faceModel.position.z.toFixed(1) == -1.7)
                        this.clockForClick.stop();
                    this.faceModel.position.set(0, -3.2, this.clickElapsedTime * 0.40 - 2.1);
                }
                else if (this.faceModel.position.z >= -2.5 && this.moveForward === false) {
                    this.clockForClick.start();
                    if (+this.faceModel.position.z.toFixed(1) == -2.5)
                        this.clockForClick.stop();
                    this.faceModel.position.set(0, -3.2, this.clickElapsedTime * 0.40 - 2.1);
                }
            }
            //
            window.requestAnimationFrame(this.tick);
            if (this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight) {
                this.resize();
            }
            if (!this.faceModel)
                return;
            // render scene into target
            this.face.visible = false;
            this.faceModel.visible = true;
            this.renderer.setRenderTarget(this.target);
            this.renderer.render(this.scene, this.camera);
            this.renderer.setRenderTarget(null);
            this.face.visible = true;
            this.lines.visible = true;
            this.faceModel.visible = false;
            this.planeMaterial.uniforms.tDepth.value = this.target.depthTexture;
            this.planeMaterial.uniforms.cameraNear.value = this.cameraDepth.near;
            this.planeMaterial.uniforms.cameraFar.value = this.cameraDepth.far;
            this.planeMaterial.uniforms.uTime.value = Math.sin(this.elapsedTime) * 0.6;
            this.linesMaterial.uniforms.tDepth.value = this.target.depthTexture;
            this.linesMaterial.uniforms.cameraNear.value = this.cameraDepth.near * 1;
            this.linesMaterial.uniforms.cameraFar.value = this.cameraDepth.far * 1;
            this.linesMaterial.uniforms.uTime.value = Math.sin(this.elapsedTime) * 0.6;
            this.linesMaterial.uniforms.uNoiseTime.value = this.elapsedTime / 1;
            //
            this.particleMaterial.uniforms.uTime.value = this.elapsedTime;
            this.mapControls.update();
            this.renderer.render(this.scene, this.camera);
            // this.renderer.render( this.postScene, this.postCamera );
        };
        this.init();
        console.log('it worked!');
    }
    ;
    init() {
        // Canvas
        this.canvas = document.querySelector('canvas.webglView');
        // Sizes
        this.sizes.width = window.innerWidth,
            this.sizes.height = window.innerHeight;
        // Scene
        this.scene = new three_1.Scene();
        this.scene.background = new three_1.Color('#020021');
        // Camera
        this.camera = new three_1.PerspectiveCamera(25, this.sizes.width / this.sizes.height, 0.1, 500);
        this.cameraDepth = new three_1.PerspectiveCamera(25, this.sizes.width / this.sizes.height, 0.1, 4);
        this.camera.position.set(0, 0, 0.8);
        this.cameraDepth.position.set(0, 0, 0.8);
        this.scene.add(this.camera);
        // Light
        const light = new three_1.PointLight('#ffffff', 4);
        light.position.set(0, 7, 7);
        this.scene.add(light);
        // Controls
        this.mapControls = new OrbitControls_js_1.MapControls(this.camera, this.canvas);
        this.mapControls.enableDamping = true;
        this.mapControls.minDistance = 0.8;
        this.mapControls.maxDistance = 2.5;
        // Renderer
        this.renderer = new three_1.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // Create a render target with depth texture
        this.setupRenderTarget();
        // Resize
        window.addEventListener('resize', this.resize());
        this.clock = new three_1.Clock();
        this.clockForClick = new three_1.Clock(false);
        //f
        this.loadModel();
        // Setup post-processing step
        // this.findingDepth();
        // Face plane Shader
        let planeGeometry = new three_1.PlaneGeometry(5, 5, 400, 400);
        this.planeMaterial = new Face_Sader_1.FaceSheder();
        this.face = new three_1.Mesh(planeGeometry, this.planeMaterial);
        this.face.position.set(0, 0, 1);
        // this.scene.add( this.face );
        // Lines
        this.linesGeometry = new three_1.PlaneBufferGeometry(2, 10, 100, 100);
        this.linesMaterial = new Face_Sader_1.FaceSheder();
        let line = new three_1.Mesh(this.linesGeometry, this.linesMaterial);
        line.position.set(0, 0, 1);
        // this.scene.add( line );
        for (let i = 0; i < this.numberOfLines; i++) {
            this.linesGeometry = new three_1.PlaneBufferGeometry(2, 0.006, 100, 100);
            let lineY = [];
            let len = this.linesGeometry.attributes.position.array.length;
            for (let j = 0; j < len / 3; j++) {
                lineY.push(i / 100);
            }
            this.linesGeometry.setAttribute('lineY', new three_1.BufferAttribute(new Float32Array(lineY), 1));
            this.lines = new three_1.Mesh(this.linesGeometry, this.linesMaterial);
            this.lines.position.y = (i - 40) / 50;
            this.scene.add(this.lines);
        }
        //
        this.debug();
        this.backgroundParticles();
        //
        this.tick();
    }
    ;
    debug() {
        let props = {
            color: '#0f0017'
        };
        const faceDebug = new tweakpane_1.Pane({ title: 'Face' });
        faceDebug.addInput(props, 'color').on('change', () => {
            this.linesMaterial.uniforms.uColor.value.setHex(parseInt(props.color.replace('#', '0x')));
        });
    }
    ;
    loadModel() {
        this.loader = new GLTFLoader_1.GLTFLoader();
        this.loader.load('resources/models/zophrac/male_face/scene.gltf', (gltf) => {
            this.faceModel = gltf.scene.children[0];
            this.faceModel.scale.set(3, 3, 2.5);
            this.faceModel.position.set(0, -3.2, -2.1);
            this.scene.add(this.faceModel);
        });
    }
    ;
    backgroundParticles() {
        const textureLoader = new three_1.TextureLoader();
        const particleTexture = textureLoader.load('/resources/textures/particle1.png');
        this.particleMaterial = new Particles_Shader_1.ParticleShader();
        const particlesGeometry = new three_1.BufferGeometry();
        const count = 1000;
        // this.particleMaterial.size = 0.09;
        // this.particleMaterial.map = particleTexture;
        // this.particleMaterial.transparent = true;
        // this.particleMaterial.alphaMap = particleTexture;
        // this.particleMaterial.alphaTest = 0.001;
        let positions = new Float32Array(count * 3);
        let size = new Float32Array(count);
        let particleColor = new Float32Array(count);
        let blinkStart = new Float32Array(count);
        for (let i = 0; i < count * 3; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1.95;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1.95;
            positions[i * 3 + 2] = (Math.random() - 3) * 1;
            if (Math.abs(positions[i * 3]) < 0.5 && Math.abs(positions[i * 3 + 1]) < 0.63) {
                if (positions[i * 3] >= 0)
                    positions[i * 3] += 1;
                else
                    positions[i * 3] -= 1;
            }
        }
        for (let i = 0; i < count; i++) {
            size[i] = Math.random() / 5;
            particleColor[i] = (Math.random() - 0.83) * 10;
            blinkStart[i] = (Math.random() - 0.5) * 10;
        }
        particlesGeometry.setAttribute('position', new three_1.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('size', new three_1.BufferAttribute(size, 1));
        particlesGeometry.setAttribute('particleColor', new three_1.BufferAttribute(particleColor, 1));
        particlesGeometry.setAttribute('blinkStart', new three_1.BufferAttribute(blinkStart, 1));
        let points = new three_1.Points(particlesGeometry, this.particleMaterial);
        this.scene.add(points);
    }
    ;
    setupRenderTarget() {
        if (this.target)
            this.target.dispose();
        //
        this.target = new three_1.WebGLRenderTarget(window.innerWidth, window.innerHeight);
        this.target.texture.format = three_1.RGBFormat;
        this.target.texture.minFilter = three_1.NearestFilter;
        this.target.texture.magFilter = three_1.NearestFilter;
        this.target.texture.generateMipmaps = false;
        this.target.stencilBuffer = false;
        this.target.depthBuffer = true;
        this.target.depthTexture = new three_1.DepthTexture(window.innerWidth, window.innerHeight);
        this.target.depthTexture.type = three_1.UnsignedShortType;
        this.target.depthTexture.format = three_1.DepthFormat;
    }
    ;
    // public findingDepth () : void {
    //     // Setup post processing stage
    //     this.postCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
    //     this.postMaterial = new ShaderMaterial( {
    //         vertexShader: `
    //         varying vec2 vUv;
    //         void main() {
    //             vUv = uv;
    //             gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //         }
    //         `,
    //         fragmentShader: `
    //         #include <packing>
    //         varying vec2 vUv;
    //         uniform sampler2D tDiffuse;
    //         uniform sampler2D tDepth;
    //         uniform float cameraNear;
    //         uniform float cameraFar;
    //         float readDepth( sampler2D depthSampler, vec2 coord ) {
    //             float fragCoordZ = texture2D( depthSampler, coord ).x;
    //             float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
    //             return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
    //         }
    //         void main() {
    //             //vec3 diffuse = texture2D( tDiffuse, vUv ).rgb;
    //             float depth = readDepth( tDepth, vUv );
    //             gl_FragColor.rgb = 1.0 - vec3( pow( depth, 0.2 ) );
    //             gl_FragColor.a = 1.0;
    //         }
    //         `,
    //         uniforms: {
    //             cameraNear: { value: this.camera.near },
    //             cameraFar: { value: this.camera.far },
    //             tDiffuse: { value: null },
    //             tDepth: { value: null }
    //         }
    //     } );
    //     const postPlane = new PlaneGeometry( 2, 2 );
    //     const postQuad = new Mesh( postPlane, this.postMaterial );
    //     this.postScene = new Scene();
    //     this.postScene.add( postQuad );
    // };
    resize() {
        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;
        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();
        const dpr = this.renderer.getPixelRatio();
        this.target.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
        this.renderer.setSize(this.sizes.width, this.sizes.height);
    }
    ;
}
;
exports["default"] = new ModelScene();


/***/ }),

/***/ "./src/scripts/shaders/Face.Sader.ts":
/*!*******************************************!*\
  !*** ./src/scripts/shaders/Face.Sader.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FaceSheder = void 0;
const three_2 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
class FaceSheder extends three_2.ShaderMaterial {
    constructor() {
        super();
        this.transparent = true;
        this.vertexShader = `
        #include <packing>

        varying vec2 vUv;
        varying vec2 vUvLines;
        varying vec3 vNormal;
        varying vec3 vPosition;

        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float uTime;
        uniform float uNoiseTime;

        attribute float lineY;

        //	Classic Perlin 3D Noise
        //	by Stefan Gustavson
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

        float getPerlinNoise3d( vec3 P ) {

            vec3 Pi0 = floor(P); // Integer part for indexing
            vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
            Pi0 = mod(Pi0, 289.0);
            Pi1 = mod(Pi1, 289.0);
            vec3 Pf0 = fract(P); // Fractional part for interpolation
            vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;

            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 / 7.0;
            vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec4 gx1 = ixy1 / 7.0;
            vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);

            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);

            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
            return 2.2 * n_xyz;

        }
        //

        float readDepth( sampler2D depthSampler, vec2 coord ) {
            float fragCoordZ = texture2D( depthSampler, coord ).x;
            float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }

        void main () {

            float noise = getPerlinNoise3d( vec3(  vec2( uv.x, lineY ) * 70.0, uNoiseTime / 1.0 ) ) / 2.0;
            float depth = readDepth( tDepth, vec2( uv.x, lineY ) ) * 10.0;
            vec3 pos = position;
            pos.z += ( 1.0 - depth ); //- uTime;
            pos.y += noise * 0.01;

            gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

            vUv = uv;
            vUvLines = vec2( uv.x, lineY );
            vNormal = normal;
            vPosition = pos;

        }
        `,
            this.fragmentShader = `
        #include <packing>

        varying vec2 vUv;
        varying vec2 vUvLines;
        varying vec3 vNormal;
        varying vec3 vPosition;

        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform float uTime;
        uniform vec3 uDirection;
        uniform vec3 uLightColor;
        uniform vec3 uColor;
        uniform vec3 uColor2;
        uniform vec3 uColor3;

        float readDepth( sampler2D depthSampler, vec2 coord ) {
            float fragCoordZ = texture2D( depthSampler, coord ).x;
            float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }

        void main() {

            // Diffuse
            vec3 norm = normalize( vNormal );
            float diff = max( dot( norm, uDirection ), 0.0 );
            vec3 diffuse = uLightColor * diff;

            //vec3 diffuse = texture2D( tDiffuse, vUv ).rgb;
            float depth = readDepth( tDepth, vUvLines ) * 2.6;

            // vec3 color = mix( uColor, uLightColor, 0.1 );
            // vec3 color = step( uColor, vec3( vUvLines, 1.0 ) );
            // vec3 color = step( depth, uColor2 );
            // color += step( depth * 1.2, uColor );
            gl_FragColor.rgb = mix( ( 1.0 - vec3( depth ) + uColor2 ), ( 1.0 - vec3( depth ) + uColor ), depth * 0.6 );  // working
            // gl_FragColor.rgb = mix( gl_FragColor.rgb, uColor3, 0.7 );
            // gl_FragColor.rgb = ( 1.0 - vec3( depth ) + color ); //* vec3(diffuse);
            gl_FragColor.a = step( depth, 1.0 );

        }
        `,
            this.uniforms = {
                cameraNear: { value: 0 },
                cameraFar: { value: 0 },
                tDiffuse: { value: null },
                tDepth: { value: null },
                uTime: { value: 0 },
                uColor: { value: new three_2.Color(0x00106b) },
                uNoiseTime: { value: 0 },
                uDirection: { value: new three_2.Vector3(1.0, 0.2, 0.4) },
                uLightColor: { value: new three_2.Color(0xf7f9fc) },
                uColor2: { value: new three_2.Color(0x260007) },
                uColor3: { value: new three_2.Color(0x230040) }
            };
    }
    ;
}
exports.FaceSheder = FaceSheder;


/***/ }),

/***/ "./src/scripts/shaders/Particles.Shader.ts":
/*!*************************************************!*\
  !*** ./src/scripts/shaders/Particles.Shader.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParticleShader = void 0;
const three_3 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
//
let loader = new three_3.TextureLoader();
let particleTexture = loader.load('resources/textures/particle2.png');
class ParticleShader extends three_3.ShaderMaterial {
    constructor() {
        super();
        this.transparent = true,
            this.vertexShader = `
        attribute float size;
        attribute vec3 customColor;
        attribute vec3 particleColor;
        attribute float blinkStart;

        varying vec3 vColor;
        varying vec3 vParticleColor;
        varying float vBlinkStart;

        uniform float uTime;

        void main() {

            vColor = customColor;

            vec4 mvPosition = modelViewMatrix * vec4( position + sin( uTime / 10.0 ) / 20.0 + cos( uTime / 10.0 ) / 20.0, 1.0 );

            gl_PointSize = size * ( 300.0 / -mvPosition.z );

            gl_Position = projectionMatrix * mvPosition;

            vParticleColor = particleColor;
            vBlinkStart = blinkStart;

        }
        `,
            this.fragmentShader = `
        uniform vec3 uColor;
        uniform sampler2D uPointTexture;
        uniform float uTime;

        varying vec3 vColor;
        varying vec3 vParticleColor;
        varying float vBlinkStart;

        void main() {

            gl_FragColor = vec4( vParticleColor + uColor * vec3( 0.0, 0.0, abs( sin( uTime / 2.0 + vBlinkStart ) ) ), 0.45 );
            // gl_FragColor = vec4( color * vec3( abs( sin( uTime ) ) + 0.3 ), 1.0 );

            gl_FragColor = gl_FragColor * texture2D( uPointTexture, gl_PointCoord );
            // gl_FragColor.a = 0.25;

        }
        `,
            this.uniforms = {
                uColor: { value: new three_3.Color(0x5796fa) },
                uPointTexture: { value: particleTexture },
                uTime: { value: 0 }
            };
    }
}
exports.ParticleShader = ParticleShader;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunklive_city"] = self["webpackChunklive_city"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/scripts/index.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map