/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/Fog.ts":
/*!****************************!*\
  !*** ./src/scripts/Fog.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FogScene = void 0;
const three_1 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
const OrbitControls_js_1 = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls.js */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
const FogGfx_1 = __webpack_require__(/*! ./FogGfx */ "./src/scripts/FogGfx.ts");
const tweakpane_1 = __webpack_require__(/*! tweakpane */ "./node_modules/tweakpane/dist/tweakpane.js");
//
class FogScene {
    constructor() {
        this.elapsedTime = 0;
        this.fogMovement = true;
        this.sizes = {
            width: 0,
            height: 0
        };
        this.addRaycasterPointer = (event) => {
            this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.pointer, this.camera);
        };
        this.tick = () => {
            window.requestAnimationFrame(this.tick);
            this.delta = this.clock.getDelta() * 1000;
            this.elapsedTime += this.delta;
            //
            this.intersects = this.raycaster.intersectObject(this.plane)[0].point;
            this.fog.soursePosition.set(this.intersects.x, 0.5, this.intersects.z);
            this.fog.cube.position.set(this.intersects.x, 0.5, this.intersects.z);
            this.fog.update(this.delta, this.intersects, this.fog.externalForce);
            //
            this.fog.material.uniforms.uTime.value = this.elapsedTime;
            //
            if (this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight) {
                this.resize();
            }
            this.mapControls.update();
            this.renderer.render(this.scene, this.camera);
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
        // Sizes
        this.sizes.width = window.innerWidth,
            this.sizes.height = window.innerHeight;
        // Camera
        this.camera = new three_1.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100);
        this.camera.position.set(3, 4, 2);
        this.scene.add(this.camera);
        // Controls
        this.mapControls = new OrbitControls_js_1.MapControls(this.camera, this.canvas);
        this.mapControls.enableDamping = true;
        // Plane
        let planeGeometry = new three_1.PlaneBufferGeometry(3000, 3000, 1, 1);
        let planeMaterial = new three_1.MeshBasicMaterial({ color: '#e6a67a' });
        this.plane = new three_1.Mesh(planeGeometry, planeMaterial);
        this.plane.rotation.x -= Math.PI / 2;
        this.scene.add(this.plane);
        // Renderer
        this.renderer = new three_1.WebGLRenderer({ canvas: this.canvas });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // Resize
        window.addEventListener('resize', this.resize());
        this.clock = new three_1.Clock();
        // Fog
        let props = {
            numberOfSprites: 16,
            height: 1,
            width: 1,
            depth: 1,
            outerColor: '#ff0000',
            innerColor: '#FFCE00',
            newPosition: new three_1.Vector3(0, 0.5, 0)
        };
        this.fog = new FogGfx_1.FogGfx(new three_1.Color().setHex(+props.outerColor.replace('#', '0x')).getHex(), props.numberOfSprites, props.height, props.width, props.depth);
        this.animation = new Animation();
        this.scene.add(this.fog.wrapper);
        props.newPosition = this.fog.newPosition;
        // debug fog
        this.pane = new tweakpane_1.Pane();
        this.pane.element.parentElement.style['width'] = '330px';
        const fogParam = this.pane.addFolder({
            title: 'Fog',
        });
        const fogSize = this.pane.addFolder({
            title: 'Size',
        });
        const fogAnimation = this.pane.addFolder({
            title: 'Animation',
        });
        this.mouseMoveFog('click');
        fogParam.addInput(props, 'outerColor', { view: 'color', alpha: true, label: 'outer color' }).on('change', (ev) => {
            this.fog.outerColor = ev.value;
        });
        fogParam.addInput(props, 'innerColor', { view: 'color', alpha: true, label: 'inner color' }).on('change', (ev) => {
            this.fog.innerColor = ev.value;
        });
        fogAnimation.addInput(this.fog, 'frameDuration', { min: 10, max: 800, label: 'frameDuration' }).on('change', (ev) => {
            this.fog.frameDuration = ev.value;
        });
        fogSize.addInput(this.fog, 'height', { min: 0, max: 5, step: 0.01, label: 'size X' }).on('change', (ev) => {
            this.fog.height = ev.value;
            this.fog.generate(this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition);
        });
        fogSize.addInput(this.fog, 'width', { min: 0, max: 5, step: 0.01, label: 'size Y' }).on('change', (ev) => {
            this.fog.width = ev.value;
            this.fog.generate(this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition);
        });
        fogSize.addInput(this.fog, 'depth', { min: 0, max: 5, step: 0.01, label: 'size Z' }).on('change', (ev) => {
            this.fog.depth = ev.value;
            this.fog.generate(this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition);
        });
        fogParam.addInput(this.fog, 'density', { min: 3, max: 1000, step: 1, label: 'density' }).on('change', (ev) => {
            this.fog.density = ev.value;
            this.fog.generate(this.fog.density, this.fog.height, this.fog.width, this.fog.depth, props.newPosition);
        });
        fogAnimation.addInput(this.fog, 'speedSizeChange', { min: 0, max: 0.5, step: 0.001, label: 'growth speed' }).on('change', (ev) => {
            this.fog.speedSizeChange = ev.value;
        });
        fogSize.addInput(this.fog, 'coordEpearingParticle', { min: 0, max: 1, step: 0.001, label: 'circle of appearance' }).on('change', (ev) => {
            this.fog.coordEpearingParticle = ev.value;
        });
        fogAnimation.addInput(this.fog, 'opacityCoef', { min: 0, max: 0.03, step: 0.001, label: 'fade' }).on('change', (ev) => {
            this.fog.opacityCoef = ev.value;
        });
        fogParam.addInput(this.fog, 'cubeVisibility', { label: 'bounding box' }).on('change', (ev) => {
            if (!ev.value) {
                this.fog.wrapper.remove(this.fog.cube);
            }
            if (ev.value) {
                this.fog.wrapper.add(this.fog.cube);
            }
        });
        fogParam.addInput(this, 'fogMovement', { label: 'mouse follow' }).on('change', (ev) => {
            if (ev.value) {
                let movementProp = 'mousemove';
                this.canvas.removeEventListener('click', this.addRaycasterPointer);
                this.mouseMoveFog(movementProp);
            }
            else {
                let movementProp = 'click';
                this.canvas.removeEventListener('mousemove', this.addRaycasterPointer);
                this.mouseMoveFog(movementProp);
            }
        });
        fogParam.addInput(this.fog.material.uniforms.uOpacity, 'value', { min: 0, max: 0.9, step: 0.001, label: 'opacity' });
        fogSize.addInput(this.fog.externalForce, 'x', { min: -20, max: 20, step: 0.1, label: 'external force X' }).on('change', (ev) => {
            this.fog.externalForce.x = ev.value;
        });
        fogSize.addInput(this.fog.externalForce, 'y', { min: -20, max: 20, step: 0.1, label: 'external force Y' }).on('change', (ev) => {
            this.fog.externalForce.y = ev.value;
        });
        fogSize.addInput(this.fog.externalForce, 'z', { min: -20, max: 20, step: 0.1, label: 'external force Z' }).on('change', (ev) => {
            this.fog.externalForce.z = ev.value;
        });
        //
        this.tick();
    }
    ;
    mouseMoveFog(movementProp) {
        // Raycaster
        this.raycaster = new three_1.Raycaster();
        this.pointer = new three_1.Vector2();
        this.canvas.addEventListener(movementProp, this.addRaycasterPointer);
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
}
exports.FogScene = FogScene;
exports["default"] = new FogScene();


/***/ }),

/***/ "./src/scripts/FogGfx.ts":
/*!*******************************!*\
  !*** ./src/scripts/FogGfx.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FogGfx = void 0;
const three_3 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
const Fog_Shader_1 = __webpack_require__(/*! ./shaders/Fog.Shader */ "./src/scripts/shaders/Fog.Shader.ts");
//
class FogGfx {
    //
    constructor(color, numberOfSprites, height, width, depth) {
        this.numberOfSprites = 60;
        this.height = 1;
        this.width = 1;
        this.depth = 1;
        this.density = 105;
        this.velocity = [];
        this.positions = [];
        this.randomPos = (Math.random() - 0.5) * 2;
        this.speedSizeChange = 0.137;
        this.coordEpearingParticle = 0.3;
        this.opacityCoef = 0.00999;
        this.wrapper = new three_3.Object3D();
        this.newPosition = new three_3.Vector3(0, 0.5, 0);
        this.soursePosition = new three_3.Vector3(0, 0.5, 0);
        this.cubeVisibility = true;
        this.sizeCoef = 0.1;
        this.externalForce = new three_3.Vector3(0, 0, 0);
        this._frameDuration = 300;
        this.height = height;
        this.width = width;
        this.depth = depth;
        this.numberOfSprites = numberOfSprites;
        // create fog
        this.material = new Fog_Shader_1.FogMaterial();
        this.material.side = three_3.DoubleSide;
        this.material.uniforms.uColor.value.setHex(color);
        this.material.uniforms.uFrameDuration.value = this._frameDuration;
        this.generate(this.density, this.height, this.width, this.depth, this.newPosition);
    }
    ;
    generate(density, height, width, depth, newPosition) {
        const boxGeometry = new three_3.BoxGeometry(1, 1, 1);
        const boxMaterial = new three_3.MeshBasicMaterial({ color: 0x00ff00 });
        boxMaterial.wireframe = true;
        if (!this.cube) {
            this.cube = new three_3.Mesh(boxGeometry, boxMaterial);
            this.wrapper.add(this.cube);
        }
        if (this.mesh) {
            this.geometry.dispose();
            boxGeometry.dispose();
            this.wrapper.remove(this.mesh);
        }
        this.newPosition.x = newPosition.x;
        this.newPosition.y = newPosition.y;
        this.newPosition.z = newPosition.z;
        this.height = height;
        this.width = width;
        this.depth = depth;
        let fogPointPosition = new three_3.Vector3(0, 0, 0);
        this.numberOfSprites = density * height * width * depth;
        let size = [], uv, offsetFrame = [], sizeIncrease = [], opacityDecrease = [], color = [];
        const transformRow1 = [];
        const transformRow2 = [];
        const transformRow3 = [];
        const transformRow4 = [];
        for (let i = 0; i < this.numberOfSprites; i++) {
            let x = (Math.random() - 0.5) * width;
            let y = Math.random() * height;
            let z = (Math.random() - 0.5) * depth;
            let distanceX = fogPointPosition.x - x;
            let distanceY = y - fogPointPosition.y;
            let distanceZ = fogPointPosition.z - z;
            if (Math.abs(distanceX) > width / 2.5 - Math.random() - 0.5) {
                distanceX -= Math.random() - 0.5;
            }
            if (Math.abs(distanceY) > height / 2.5 - Math.random() - 0.5) {
                distanceY -= Math.random() - 0.5;
            }
            if (Math.abs(distanceZ) > depth / 2.5 - Math.random() - 0.5) {
                distanceZ -= Math.random() - 0.5;
            }
            let scaleX = 1;
            let scaleY = 1;
            let scaleZ = 1;
            const rotationX = 0;
            const rotationY = 0;
            const rotationZ = 0;
            let transformMatrix = new three_3.Matrix4().compose(new three_3.Vector3(distanceX, distanceY, distanceZ), new three_3.Quaternion().setFromEuler(new three_3.Euler(rotationX, rotationY, rotationZ)), new three_3.Vector3(scaleX, scaleY, scaleZ)).toArray();
            transformRow1.push(transformMatrix[0], transformMatrix[1], transformMatrix[2], transformMatrix[3]);
            transformRow2.push(transformMatrix[4], transformMatrix[5], transformMatrix[6], transformMatrix[7]);
            transformRow3.push(transformMatrix[8], transformMatrix[9], transformMatrix[10], transformMatrix[11]);
            transformRow4.push(transformMatrix[12], transformMatrix[13], transformMatrix[14], transformMatrix[15]);
            size.push(Math.random());
            sizeIncrease.push(Math.random() * 0.02);
            opacityDecrease.push(Math.random());
            this.velocity.push((Math.random() - 0.5) * 2 / 100, (Math.random() - 0.5) * 2 / 100, (Math.random() - 0.5) * 2 / 100);
            offsetFrame.push(Math.floor(Math.random() * 50 * 16));
        }
        this.positions = [
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0
        ];
        uv = [
            0, 0,
            1, 0,
            1, 1,
            1, 1,
            0, 1,
            0, 0
        ];
        this.geometry = new three_3.InstancedBufferGeometry();
        this.geometry.setAttribute('position', new three_3.Float32BufferAttribute(this.positions, 3));
        this.geometry.setAttribute('uv', new three_3.Float32BufferAttribute(uv, 2));
        this.geometry.setAttribute('transformRow1', new three_3.InstancedBufferAttribute(new Float32Array(transformRow1), 4));
        this.geometry.setAttribute('transformRow2', new three_3.InstancedBufferAttribute(new Float32Array(transformRow2), 4));
        this.geometry.setAttribute('transformRow3', new three_3.InstancedBufferAttribute(new Float32Array(transformRow3), 4));
        this.geometry.setAttribute('transformRow4', new three_3.InstancedBufferAttribute(new Float32Array(transformRow4), 4));
        this.geometry.setAttribute('offsetFrame', new three_3.InstancedBufferAttribute(new Float32Array(offsetFrame), 1));
        this.geometry.setAttribute('velocity', new three_3.InstancedBufferAttribute(new Float32Array(this.velocity), 3));
        this.geometry.setAttribute('opacityDecrease', new three_3.InstancedBufferAttribute(new Float32Array(opacityDecrease), 1));
        this.geometry.setAttribute('size', new three_3.InstancedBufferAttribute(new Float32Array(size), 1));
        this.mesh = new three_3.Mesh(this.geometry, this.material);
        this.wrapper.add(this.mesh);
    }
    ;
    update(delta, intersects, externalForce) {
        for (let i = 0; i < this.numberOfSprites; i++) {
            const newSize = this.geometry.attributes.size.getX(i) + this.speedSizeChange * this.sizeCoef;
            this.geometry.attributes.size.setX(i, newSize);
            let velosityX = this.geometry.attributes.velocity.getX(i);
            let velosityY = this.geometry.attributes.velocity.getY(i);
            let velosityZ = this.geometry.attributes.velocity.getZ(i);
            let newPosX = this.geometry.attributes.transformRow4.getX(i);
            let newPosY = this.geometry.attributes.transformRow4.getY(i);
            let newPosZ = this.geometry.attributes.transformRow4.getZ(i);
            let velosityAccelerationX = (intersects.x - newPosX + externalForce.x) / 200;
            let velosityAccelerationY = (intersects.y - newPosY + externalForce.y) / 200;
            ;
            let velosityAccelerationZ = (intersects.z - newPosZ + externalForce.z) / 200;
            const newOpacity = this.geometry.attributes.opacityDecrease.getX(i) - this.opacityCoef;
            this.geometry.attributes.opacityDecrease.setX(i, newOpacity);
            newPosX += ((velosityX + velosityAccelerationX * newOpacity) * delta) / 16;
            newPosY += ((velosityY + velosityAccelerationY * newOpacity) * delta) / 16;
            newPosZ += ((velosityZ + velosityAccelerationZ * newOpacity) * delta) / 16;
            if (newOpacity <= 0.001) {
                newPosX = (Math.random() - 0.5) * this.coordEpearingParticle + this.soursePosition.x;
                newPosY = (Math.random() - 0.5) * this.coordEpearingParticle + this.soursePosition.y;
                newPosZ = (Math.random() - 0.5) * this.coordEpearingParticle + this.soursePosition.z;
                this.geometry.attributes.size.setX(i, 0);
                this.geometry.attributes.opacityDecrease.setX(i, 1);
            }
            this.geometry.attributes.transformRow4.setX(i, newPosX);
            this.geometry.attributes.transformRow4.setY(i, newPosY);
            this.geometry.attributes.transformRow4.setZ(i, newPosZ);
        }
        this.geometry.attributes.opacityDecrease.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.transformRow4.needsUpdate = true;
    }
    ;
    //
    get frameDuration() {
        return this._frameDuration;
    }
    ;
    set frameDuration(frameDuration) {
        this.material.uniforms.uFrameDuration.value = frameDuration;
        this._frameDuration = this.material.uniforms.uFrameDuration.value;
    }
    ;
    get outerColor() {
        return this._outerColor;
    }
    ;
    set outerColor(color) {
        this._outerColor = color;
        if (typeof color === 'string') {
            this.material.uniforms.uColor.value.setHex(parseInt(color.replace('#', '0x')));
        }
        else {
            this.material.uniforms.uColor.value.setHex(color);
        }
    }
    ;
    get innerColor() {
        return this._innerColor;
    }
    ;
    set innerColor(color) {
        this._innerColor = color;
        if (typeof color === 'string') {
            this.material.uniforms.uInnerColor.value.setHex(parseInt(color.replace('#', '0x')));
        }
        else {
            this.material.uniforms.uInnerColor.value.setHex(color);
        }
    }
    ;
}
exports.FogGfx = FogGfx;


/***/ }),

/***/ "./src/scripts/shaders/Fog.Shader.ts":
/*!*******************************************!*\
  !*** ./src/scripts/shaders/Fog.Shader.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FogMaterial = void 0;
const three_5 = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
// import FogScene from '../index';
let randomnum = Math.random();
const textureLoader = new three_5.TextureLoader();
const fogTexture = textureLoader.load('resources/textures/fog1.png');
const noise = textureLoader.load('resources/textures/tNoise.png');
class FogMaterial extends three_5.ShaderMaterial {
    constructor() {
        super();
        this.vertexShader = `
            attribute vec4 transformRow1;
            attribute vec4 transformRow2;
            attribute vec4 transformRow3;
            attribute vec4 transformRow4;
            attribute float offsetFrame;
            attribute float size;
            attribute vec3 velocity;
            attribute float opacityDecrease;

            varying vec2 vUv;
            varying float vOffsetFrame;
            varying float vCurrentFrameId;
            varying float vNextFrameId;
            varying float vOpacityDecrease;
            varying float vOpacity;
            varying vec3 vPosition;

            uniform float uRandomNum;
            uniform sampler2D uNoise;
            uniform float uTime;
            uniform float uFrameDuration;
            uniform float uOpacity;

            void main() {

                float numOfFrames = 16.0;

                float currentFrameId = mod( floor( mod( uTime + offsetFrame, numOfFrames * uFrameDuration ) / uFrameDuration ), numOfFrames );

                float nextFrameId;
                if ( currentFrameId == numOfFrames - 1.0 ) {

                    nextFrameId = 0.0;

                } else {

                    nextFrameId = currentFrameId + 1.0;

                }

                mat4 transforms = mat4(
                    transformRow1,
                    transformRow2,
                    transformRow3,
                    transformRow4
                );

                gl_Position = projectionMatrix * ( modelViewMatrix * transforms * vec4(0.0, 0.0, 0.0, 1.0) + vec4( position * size, 1.0 ) );

                vUv = uv;
                vOffsetFrame = offsetFrame;
                vNextFrameId = nextFrameId;
                vCurrentFrameId  = currentFrameId;
                vOpacityDecrease = opacityDecrease;
                vOpacity = uOpacity;
                vPosition = transformRow4.xyz;

            }
        `;
        this.depthWrite = false;
        this.transparent = true;
        // this.wireframe = true;
        this.fragmentShader = `
            varying vec2 vUv;
            varying float vOffsetFrame;
            varying float vCurrentFrameId;
            varying float vNextFrameId;
            varying float vOpacityDecrease;
            varying float vOpacity;
            varying vec3 vPosition;

            uniform sampler2D uPointTexture;
            uniform float alphaTest;
            uniform vec3 uColor;
            uniform float uTime;
            uniform float uFrameDuration;
            uniform vec3 uInnerColor;

            void main() {

                gl_FragColor = vec4( uColor, 0.04 );

                //

                vec4 offsets;

                offsets.y = floor( vCurrentFrameId / 4.0 ) * 0.25;
                offsets.x = mod( vCurrentFrameId, 4.0 ) * 0.25;

                offsets.w = floor( vNextFrameId / 4.0 ) * 0.25;
                offsets.z = mod( vNextFrameId, 4.0 ) * 0.25;

                //

                vec4 texture1 = texture2D( uPointTexture, vec2( vUv.x * 0.25 + offsets.x, vUv.y * 0.25 + offsets.y ) );
                vec4 texture2 = texture2D( uPointTexture, vec2( vUv.x * 0.25 + offsets.z, vUv.y * 0.25 + offsets.w ) );

                float fragmentTime = mod( uTime + vOffsetFrame, uFrameDuration ) / uFrameDuration;

                gl_FragColor = mix( texture1, texture2, fragmentTime );
                vec3 finalColor = uColor;

                finalColor = mix( uColor, uInnerColor, step( 0.3, vOpacityDecrease ) * vOpacityDecrease );

                gl_FragColor *= vec4( finalColor, vOpacityDecrease * vOpacity );

                if ( gl_FragColor.a < alphaTest ) discard;

            }
        `;
        this.uniforms = {
            uRandomNum: { value: randomnum },
            uPointTexture: { value: fogTexture },
            uNoise: { value: noise },
            alphaTest: { value: 0.0001 },
            uColor: { value: new three_5.Color(0x1A75FF) },
            uTime: { value: 0.0 },
            uTimeX: { value: 0.0 },
            uTimeY: { value: 0.0 },
            uFrameDuration: { value: 16.0 },
            uOpacity: { value: 0.9 },
            uInnerColor: { value: new three_5.Color(0xFFCE00) }
        };
    }
}
exports.FogMaterial = FogMaterial;


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
/******/ 			"scripts/fog": 0
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/scripts/Fog.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=fog.js.map