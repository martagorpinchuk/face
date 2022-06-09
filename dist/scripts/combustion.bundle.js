/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/Combustion.ts":
/*!***********************************!*\
  !*** ./src/scripts/Combustion.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CombustionGfx = void 0;
const three_3 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
const OrbitControls_2 = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
const GLTFLoader_1 = __webpack_require__(/*! three/examples/jsm/loaders/GLTFLoader */ "./node_modules/three/examples/jsm/loaders/GLTFLoader.js");
const tweakpane_3 = __webpack_require__(/*! tweakpane */ "./node_modules/tweakpane/dist/tweakpane.js");
const _ombustion_Shader_1 = __webpack_require__(/*! ./shaders/Сombustion.Shader */ "./src/scripts/shaders/Сombustion.Shader.ts");
class CombustionGfx {
    constructor() {
        this.delta = 0;
        this.elapsedTime = 0;
        this.timeCoef = 1;
        this.timeStop = false;
        this.sizes = {
            width: 0,
            height: 0
        };
        this.tick = () => {
            window.requestAnimationFrame(this.tick);
            if (this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight) {
                this.resize();
            }
            //
            // this.cubeMaterial.uniforms.uTime.value = this.elapsedTime / 10 / 1000 * this.timeCoef;
            if (this.timeStop) {
                this.delta = this.clock.getDelta() * 1000;
                this.elapsedTime += this.delta;
            }
            else {
                this.clock.running = false;
            }
            if (this.potatoMaterial)
                this.potatoMaterial.uniforms.uTime.value = this.elapsedTime / 10 / 1000;
            //
            this.mapControls.update();
            this.renderer.render(this.scene, this.camera);
        };
        this.init();
        console.log('combustion');
    }
    ;
    init() {
        // Canvas
        this.canvas = document.querySelector('canvas.webglView');
        // Scene
        this.scene = new three_3.Scene();
        this.scene.background = new three_3.Color('#78614c');
        // Camera
        this.camera = new three_3.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 1000);
        this.camera.position.set(0, 10, 10);
        this.scene.add(this.camera);
        // Controls
        this.mapControls = new OrbitControls_2.MapControls(this.camera, this.canvas);
        this.mapControls.enableDamping = true;
        // Renderer
        this.renderer = new three_3.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        // Plane
        let planeGeometry = new three_3.PlaneBufferGeometry(3000, 3000, 1, 1);
        let planeMaterial = new three_3.MeshBasicMaterial({ color: '#453322' });
        let plane = new three_3.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x -= Math.PI / 2;
        this.scene.add(plane);
        /// Light
        const light = new three_3.PointLight(0xe9f7ec, 1, 500);
        light.position.set(1, 3, 5);
        this.scene.add(light);
        // Cube
        // this.cubeMaterial = new СombustionMaterial();
        this.cubeGeometry = new three_3.BoxBufferGeometry(1, 1, 1);
        this.cube = new three_3.Mesh(this.cubeGeometry, this.cubeMaterial);
        this.cube.position.set(0, 0.5, 0);
        // this.scene.add( this.cube );
        this.clock = new three_3.Clock();
        this.potatoLoading();
        if (this.potato) {
            this.potato.rotation.z += Math.PI;
            this.potato.position.y = 1.35;
        }
        this.debug();
        //
        this.tick();
    }
    ;
    debug() {
        const combustionTwp = new tweakpane_3.Pane({ title: "Combustion" });
        combustionTwp.addInput(this, 'timeStop', { title: 'Time stop' }).on('change', () => {
            if (this.timeStop) {
                this.timeCoef = this.elapsedTime;
                this.potatoMaterial.uniforms.uTime.value = this.timeCoef / 10 / 100;
                // this.clock.stop;
                // console.log(this.elapsedTime);
                // this.timeCoef = 0;
            }
            else
                this.timeCoef = 1;
        });
        combustionTwp.addInput(this, 'timeCoef', { min: 0.00001, max: 1 });
        // combustionTwp.addInput( this, 'timeStop', { title: 'Restart model' } ).on( 'change', () => {
        //     this.potatoMaterial.uniforms.uTime.value = 0;
        // } );
    }
    ;
    resize() {
        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;
        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
    ;
    potatoLoading() {
        // this.potatoMaterial = new СombustionMaterial();
        // Loading potato_character
        this.loader = new GLTFLoader_1.GLTFLoader();
        this.loader.load('resources/models/potato_character/scene.gltf', (gltf) => {
            this.potato = gltf.scene.children[0];
            this.potato.traverse((item) => {
                if (item instanceof three_3.Mesh && item.material instanceof three_3.Material) {
                    // @ts-ignore
                    this.potatoMaterial = new _ombustion_Shader_1.СombustionMaterial({ color: 0xffffff });
                    // @ts-ignore
                    this.potatoMaterial.uniforms.tDiffuse.value = item.material.map;
                    // @ts-ignore
                    item.material = this.potatoMaterial;
                }
                this.potato.rotation.z += Math.PI;
                this.potato.position.y = 1.35;
                this.scene.add(this.potato);
            });
        });
    }
    ;
}
exports.CombustionGfx = CombustionGfx;
;
exports["default"] = new CombustionGfx();


/***/ }),

/***/ "./src/scripts/shaders/Сombustion.Shader.ts":
/*!**************************************************!*\
  !*** ./src/scripts/shaders/Сombustion.Shader.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["СombustionMaterial"] = exports.uNoise = void 0;
const three_5 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
//
// perlin noise texture
exports.uNoise = new three_5.TextureLoader().load('resources/textures/tNoise.png');
class СombustionMaterial extends three_5.ShaderMaterial {
    constructor() {
        super();
        this.transparent = true;
        this.vertexShader = `
        varying vec2 vUv;

        void main() {

            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );

            vUv = uv;

        }
        `,
            this.fragmentShader = `
        varying vec2 vUv;

        uniform sampler2D uNoise;
        uniform float uTime;
        uniform vec3 uColor;
        uniform sampler2D tDiffuse;

        void main() {

            vec2 newUv = vUv;
            vec2 displUV = texture2D( uNoise, vUv ).xy + uTime / 5.0;
            vec4 potatoTexture = texture2D( tDiffuse, vUv );

            float col = pow( clamp( mix( 0.5, texture2D( uNoise, newUv + displUV ).x, 2.0 ), 0.0, 1.0 ), 20.0 );

            float nn = texture2D( uNoise, newUv / 15.0 + displUV ).r;
            gl_FragColor.rgb = vec3( max( 1.0, 24.0 * smoothstep( 1.0 - uTime / 0.7, 1.0 - uTime / 1.0, nn ) ) ) * potatoTexture.rgb;
            gl_FragColor.a = 1.0 - smoothstep( 1.0 - uTime / 0.8, 1.0 - uTime / 1.0, nn );

        }
        `,
            this.uniforms = {
                uTime: { value: 0.0 },
                uNoise: { value: exports.uNoise },
                uColor: { value: new three_5.Color(0xff0000) },
                tDiffuse: { value: null }
            };
    }
}
exports["СombustionMaterial"] = СombustionMaterial;
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
/******/ 			"combustion": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/scripts/Combustion.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=combustion.js.map