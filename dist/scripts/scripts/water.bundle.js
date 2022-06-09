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
const three_2 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
const OrbitControls_1 = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
const GLTFLoader_js_1 = __webpack_require__(/*! three/examples/jsm/loaders/GLTFLoader.js */ "./node_modules/three/examples/jsm/loaders/GLTFLoader.js");
const Water_Shader_1 = __webpack_require__(/*! ./shaders/Water.Shader */ "./src/scripts/shaders/Water.Shader.ts");
const tweakpane_2 = __webpack_require__(/*! tweakpane */ "./node_modules/tweakpane/dist/tweakpane.js");
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
            this.waterMaterial.uniforms.uTime.value = this.elapsedTime;
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
        this.scene = new three_2.Scene();
        this.scene.background = new three_2.Color('#c7c1b7');
        // Camera
        this.camera = new three_2.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100);
        this.camera.position.set(1, 2, 2);
        this.scene.add(this.camera);
        // Controls
        this.mapControls = new OrbitControls_1.MapControls(this.camera, this.canvas);
        this.mapControls.enableDamping = true;
        // Light
        const light = new three_2.PointLight(0xe9f7ec, 1, 100);
        light.position.set(5, 5, 5);
        this.scene.add(light);
        // Plane
        this.loadPlane();
        // Water
        let waterGeom = new three_2.PlaneGeometry(1.9, 1.9);
        this.waterMaterial = new Water_Shader_1.WaterMaterial();
        this.waterMesh = new three_2.Mesh(waterGeom, this.waterMaterial);
        this.waterMesh.rotation.x = -Math.PI / 2;
        this.waterMesh.position.set(0, -0.05, 0);
        this.scene.add(this.waterMesh);
        // Real water depth
        // Renderer
        this.renderer = new three_2.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.scene.add(new three_2.Mesh(new three_2.BoxGeometry(0.2, 0.2, 0.2), new three_2.MeshBasicMaterial({ color: 0xebb734 })));
        // Create a render target with depth texture
        this.setupRenderTarget();
        // Resize
        window.addEventListener('resize', this.resize());
        // Debug
        let props = { waterColor: '#8eb4e6' };
        const waterTwp = new tweakpane_2.Pane({ title: "Water" });
        // let waterColor = waterTwp.addFolder({ title: 'Water color' });
        waterTwp.addInput(props, 'waterColor', { view: 'color', alpha: true, label: 'inner color' }).on('change', (ev) => {
            this.waterMaterial.uniforms.uColor.value.setHex(parseInt(ev.value.replace('#', '0x')));
        });
        this.clock = new three_2.Clock();
        //
        this.tick();
    }
    ;
    findingDepth() {
        // Setup post processing stage
        this.postCamera = new three_2.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.postMaterial = new three_2.ShaderMaterial({
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
        const postPlane = new three_2.PlaneGeometry(2, 2);
        const postQuad = new three_2.Mesh(postPlane, this.postMaterial);
        this.postScene = new three_2.Scene();
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
        this.target = new three_2.WebGLRenderTarget(window.innerWidth, window.innerHeight);
        this.target.texture.format = three_2.RGBFormat;
        this.target.texture.minFilter = three_2.NearestFilter;
        this.target.texture.magFilter = three_2.NearestFilter;
        this.target.texture.generateMipmaps = false;
        this.target.stencilBuffer = false;
        this.target.depthBuffer = true;
        this.target.depthTexture = new three_2.DepthTexture(window.innerWidth, window.innerHeight);
        this.target.depthTexture.type = three_2.UnsignedShortType;
        this.target.depthTexture.format = three_2.DepthFormat;
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
const three_4 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
//
class WaterMaterial extends three_4.ShaderMaterial {
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

            // if ( ( depth - convertDepth( gl_FragCoord.z ) ) < 0.0018 ) {

            //     vec3 mix = mix( uFoamColor1, uFoamColor2, perlinNoise );
            //     // mix = step( 1.0, mix );
            //     color = mix;

            // }

            float perlinNoise = getPerlinNoise3d( vec3( centeredUv, 1.0 ) );
            vec3 foamNoise = vec3( perlinNoise );
            vec3 color = uColor;
            float foamDiff = 1.0 - min( ( waterDepth * 2500.0 ), 3.0 );
            // float foam = perlinNoise + foamDiff;
            // float foam = step( perlinNoise, sin(foamDiff) );
            float foam = step( foamDiff - sin( foamDiff * 8.0 ), perlinNoise );
            // foam = step( foamDiff - foam, perlinNoise );

            //foam = saturate (sin((foamDiff - _Time.y * _FoamLinesSpeed) * 8 * UNITY_PI));

            // color = mix( uColor, ( foamNoise + 1.7 ) / 1.0 * uColor, foamDiff );
            // color = mix( uColor, ( foamNoise + 1.7 ) * uFoamColor1, foamDiff );

            // vec3 color = smoothstep( waterDepth - 0.8, - waterDepth, foamNoise );

            gl_FragColor.rgba = vec4( color, foam );
            // gl_FragColor.a *= min( waterDepth, 1.0 );

        }
        `;
        this.uniforms = {
            cameraNear: { value: 0 },
            cameraFar: { value: 0 },
            tDiffuse: { value: null },
            tDepth: { value: null },
            uColor: { value: new three_4.Color(0x8eb4e6) },
            uFoamColor1: { value: new three_4.Color(0xc2e3ff) },
            uFoamColor2: { value: new three_4.Color(0xe6f6ff) },
            uFoamColor3: { value: new three_4.Color(0xffffff) },
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
/******/ 			"scripts/water": 0
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