/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/Water.ts":
/*!******************************!*\
  !*** ./src/scripts/Water.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Water = void 0;
const three_1 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
const OrbitControls_1 = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
const GLTFLoader_js_1 = __webpack_require__(/*! three/examples/jsm/loaders/GLTFLoader.js */ "./node_modules/three/examples/jsm/loaders/GLTFLoader.js");
const Water_Shader_1 = __webpack_require__(/*! ./shaders/Water.Shader */ "./src/scripts/shaders/Water.Shader.ts");
const tweakpane_1 = __webpack_require__(/*! tweakpane */ "./node_modules/tweakpane/dist/tweakpane.js");
//
class Water {
    constructor() {
        this.elapsedTime = 0;
        this.sizes = {
            width: 0,
            height: 0
        };
        this.tick = () => {
            window.requestAnimationFrame(this.tick);
            this.delta = this.clock.getDelta() * 1000;
            this.elapsedTime += this.delta;
            //
            if (this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight) {
                this.resize();
            }
            // render scene into target
            this.waterMesh.visible = false;
            this.renderer.setRenderTarget(this.target);
            this.renderer.render(this.scene, this.camera);
            this.mapControls.update();
            this.renderer.setRenderTarget(null);
            this.waterMesh.visible = true;
            this.waterMaterial.uniforms.tDepth.value = this.target.depthTexture;
            this.waterMaterial.uniforms.cameraNear.value = this.camera.near;
            this.waterMaterial.uniforms.cameraFar.value = this.camera.far;
            // this.waterMaterial.uniforms.uTime.value = Math.abs( Math.sin( this.elapsedTime / 1068 ) ) + 1;
            this.waterMaterial.uniforms.uTime.value = Math.sin(this.elapsedTime / 1068) + 2; //1068
            // this.postMaterial.uniforms.tDepth.value = this.target.depthTexture;
            // this.postMaterial.uniforms.cameraNear.value = this.camera.near;
            // this.postMaterial.uniforms.cameraFar.value = this.camera.far;
            this.renderer.render(this.scene, this.camera);
            // this.renderer.render( this.postScene, this.postCamera );
            // this.effectComposer.render();
        };
        this.init();
    }
    ;
    init() {
        // Canvas
        this.canvas = document.querySelector('canvas.webglView');
        // Scene
        this.scene = new three_1.Scene();
        this.scene.background = new three_1.Color('#c7c1b7');
        // Camera
        this.camera = new three_1.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100);
        this.camera.position.set(1, 2, 2);
        this.scene.add(this.camera);
        // Controls
        this.mapControls = new OrbitControls_1.MapControls(this.camera, this.canvas);
        this.mapControls.enableDamping = true;
        // Light
        const light = new three_1.PointLight(0xe9f7ec, 1, 100);
        light.position.set(5, 5, 5);
        this.scene.add(light);
        // Plane
        this.loadPlane();
        // Water
        let waterGeom = new three_1.PlaneGeometry(1.9, 1.9);
        this.waterMaterial = new Water_Shader_1.WaterMaterial();
        this.waterMesh = new three_1.Mesh(waterGeom, this.waterMaterial);
        this.waterMesh.rotation.x = -Math.PI / 2;
        this.waterMesh.position.set(0, -0.05, 0);
        this.scene.add(this.waterMesh);
        // Real water depth
        // Renderer
        this.renderer = new three_1.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.scene.add(new three_1.Mesh(new three_1.BoxGeometry(0.2, 0.2, 0.2), new three_1.MeshBasicMaterial({ color: 0xebb734 })));
        // Create a render target with depth texture
        this.setupRenderTarget();
        // Resize
        window.addEventListener('resize', this.resize());
        // Debug
        let props = { waterColor: '#8eb4e6' };
        const waterTwp = new tweakpane_1.Pane({ title: "Water" });
        waterTwp.addInput(props, 'waterColor', { view: 'color', alpha: true, label: 'inner color' }).on('change', (ev) => {
            this.waterMaterial.uniforms.uColor.value.setHex(parseInt(ev.value.replace('#', '0x')));
        });
        this.clock = new three_1.Clock();
        //
        this.tick();
    }
    ;
    findingDepth() {
        // Setup post processing stage
        this.postCamera = new three_1.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.postMaterial = new three_1.ShaderMaterial({
            vertexShader: `
            varying vec2 vUv;

            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
            `,
            fragmentShader: `
            #include <packing>

            varying vec2 vUv;
            uniform sampler2D tDiffuse;
            uniform sampler2D tDepth;
            uniform float cameraNear;
            uniform float cameraFar;


            float readDepth( sampler2D depthSampler, vec2 coord ) {
                float fragCoordZ = texture2D( depthSampler, coord ).x;
                float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
                return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
            }

            void main() {
                //vec3 diffuse = texture2D( tDiffuse, vUv ).rgb;
                float depth = readDepth( tDepth, vUv );

                gl_FragColor.rgb = 1.0 - vec3( pow( depth, 0.2 ) );
                gl_FragColor.a = 1.0;
            }
            `,
            uniforms: {
                cameraNear: { value: this.camera.near },
                cameraFar: { value: this.camera.far },
                tDiffuse: { value: null },
                tDepth: { value: null }
            }
        });
        const postPlane = new three_1.PlaneGeometry(2, 2);
        const postQuad = new three_1.Mesh(postPlane, this.postMaterial);
        this.postScene = new three_1.Scene();
        this.postScene.add(postQuad);
    }
    ;
    loadPlane() {
        // Loading tree
        this.loader = new GLTFLoader_js_1.GLTFLoader();
        this.loader.load('resources/models/plane.gltf', (gltf) => {
            gltf.scene.children[0].scale;
            this.scene.add(gltf.scene.children[0]);
        });
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
exports.Water = Water;
;
exports["default"] = new Water();


/***/ }),

/***/ "./src/scripts/shaders/Water.Shader.ts":
/*!*********************************************!*\
  !*** ./src/scripts/shaders/Water.Shader.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WaterMaterial = void 0;
const three_6 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
//
class WaterMaterial extends three_6.ShaderMaterial {
    constructor() {
        super();
        this.vertexShader = `
        #include <packing>

        varying vec2 vUv;
        varying vec4 vPos;
        varying vec3 vPosFoam;

        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;

        float readDepth( sampler2D depthSampler, vec2 coord ) {
            float fragCoordZ = texture2D( depthSampler, coord ).x;
            float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }

        void main() {

            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

            vPos = gl_Position.xyzw;

            vUv = uv;

            vPosFoam = position;

        }

        `,
            this.transparent = true;
        this.fragmentShader = `
        #include <packing>
        #define PI 3.1415926538;

        varying vec2 vUv;
        varying float vDepth;
        varying vec4 vPos;
        varying vec3 vPosFoam;

        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;
        uniform vec3 uColor;
        uniform vec3 uFoamColor1;
        uniform vec3 uFoamColor2;
        uniform vec3 uFoamColor3;
        uniform float uTime;

        //	Classic Perlin 2D Noise
        //	by Stefan Gustavson
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

        float getPerlinNoise2d(vec2 P)
        {
            vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
            vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
            Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
            vec4 ix = Pi.xzxz;
            vec4 iy = Pi.yyww;
            vec4 fx = Pf.xzxz;
            vec4 fy = Pf.yyww;
            vec4 i = permute(permute(ix) + iy);
            vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
            vec4 gy = abs(gx) - 0.5;
            vec4 tx = floor(gx + 0.5);
            gx = gx - tx;
            vec2 g00 = vec2(gx.x,gy.x);
            vec2 g10 = vec2(gx.y,gy.y);
            vec2 g01 = vec2(gx.z,gy.z);
            vec2 g11 = vec2(gx.w,gy.w);
            vec4 norm = 1.79284291400159 - 0.85373472095314 *
            vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
            g00 *= norm.x;
            g01 *= norm.y;
            g10 *= norm.z;
            g11 *= norm.w;
            float n00 = dot(g00, vec2(fx.x, fy.x));
            float n10 = dot(g10, vec2(fx.y, fy.y));
            float n01 = dot(g01, vec2(fx.z, fy.z));
            float n11 = dot(g11, vec2(fx.w, fy.w));
            vec2 fade_xy = fade(Pf.xy);
            vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
            float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
            return 2.3 * n_xy;
        }

        float convertDepth ( float depth ) {

            float viewZ = perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
            return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

        }

        float readDepth( sampler2D depthSampler, vec2 coord ) {

            float fragCoordZ = texture2D( depthSampler, coord ).x;
            return convertDepth( fragCoordZ );

        }

        void main() {

            vec2 centeredUv = vUv - 0.5;
            float distanceToCenter = length( centeredUv );

            //

            vec2 vViewportCoord = vPos.xy;
            vViewportCoord /= vPos.w;
            vViewportCoord = vViewportCoord * 0.5 + 0.5;

            float depth = readDepth( tDepth, vViewportCoord );

            // vec3 color = uFoamColor1;

            float waterDepth = ( depth - convertDepth( gl_FragCoord.z ) );

            float perlinNoise = getPerlinNoise2d( centeredUv * 203.0 + uTime / 20.0 );
            vec3 color = uColor;
            float foamDiff = min( ( waterDepth * 700.0 ) / ( uTime ) / 0.55, 1.0 );
            // float foam = clamp( sin( foamDiff * 5.0 * 3.1415 ), 0.0, 1.0 );

            float foam = 1.0 - step( foamDiff - clamp( sin( ( foamDiff + sin( uTime / 30.0 ) ) * 9.0 * 3.1415 ), 0.0, 1.0 ) * ( 1.0 - foamDiff ), perlinNoise );
            // foam += step( foam, perlinNoise );

            // foam += perlinNoise;

            // color = mix( uColor, ( foamNoise + 1.7 ) / 3.0 * uColor, foamDiff );
            // color = mix( ( foamNoise + 1.7 ) * uFoamColor1, uColor, foamDiff );

            color = mix( uFoamColor2, uColor, foamDiff );
            // color = step( foamDiff, uFoamColor1 );

            gl_FragColor.rgb = vec3( color );
            gl_FragColor.a = mix( foam, 0.8, foamDiff + 1.5 );

        }
        `;
        this.uniforms = {
            cameraNear: { value: 0 },
            cameraFar: { value: 0 },
            tDiffuse: { value: null },
            tDepth: { value: null },
            uColor: { value: new three_6.Color(0x8eb4e6) },
            uFoamColor1: { value: new three_6.Color(0xc2e3ff) },
            uFoamColor2: { value: new three_6.Color(0xe6f6ff) },
            uFoamColor3: { value: new three_6.Color(0x000001) },
            uTime: { value: 0 }
        };
    }
}
exports.WaterMaterial = WaterMaterial;
;


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
/******/ 			"water": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/scripts/Water.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=water.js.map