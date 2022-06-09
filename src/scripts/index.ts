import { BufferAttribute, BufferGeometry, Clock, Color, DepthFormat, DepthTexture, Mesh, MeshBasicMaterial, NearestFilter, OrthographicCamera, PerspectiveCamera, Plane, PlaneBufferGeometry, PlaneGeometry, PointLight, Points, PointsMaterial, RGBFormat, Scene, ShaderMaterial, TextureLoader, UnsignedShortType, WebGLRenderer, WebGLRenderTarget } from "three";
import { MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FaceSheder } from './shaders/Face.Sader';
import { Pane } from "tweakpane";
import { ParticleShader } from './shaders/Particles.Shader';

//

class ModelScene {

    public scene: Scene;
    public camera: PerspectiveCamera;
    public cameraDepth: PerspectiveCamera;
    public canvas: HTMLCanvasElement;
    public plane: Mesh;
    public renderer: WebGLRenderer;
    public mapControls: MapControls;
    public clock: Clock;
    public clockForClick: Clock;
    public loader: GLTFLoader;
    public faceModel: Mesh;
    public face: Mesh;
    public target: WebGLRenderTarget;
    public planeMaterial: FaceSheder;
    public delta: number;
    public elapsedTime: number = 0;
    public numberOfLines: number = 100;
    public lines: Mesh;
    public linesGeometry: PlaneBufferGeometry;
    public moveForward: Boolean = true;
    public particleMaterial: ShaderMaterial;

    public clickElapsedTime: number = 0;
    public clickDelta: number;

    public linesMaterial: ShaderMaterial;
    public postMaterial: ShaderMaterial;
    public postScene: Scene;
    public postCamera: OrthographicCamera;

    private sizes = {

        height: 0,
        width: 0

    };

    constructor () {

        this.init();
        console.log('it worked!');

    };

    public init () : void {

        // Canvas
        this.canvas = document.querySelector( 'canvas.webglView' ) as HTMLCanvasElement;

        // Sizes
        this.sizes.width = window.innerWidth,
        this.sizes.height = window.innerHeight;

        // Scene
        this.scene = new Scene();
        this.scene.background = new Color( '#020021' );

        // Camera
        this.camera = new PerspectiveCamera( 25, this.sizes.width / this.sizes.height, 0.1, 500 );
        this.cameraDepth = new PerspectiveCamera( 25, this.sizes.width / this.sizes.height, 0.1, 4 );
        this.camera.position.set( 0, 0, 0.8 );
        this.cameraDepth.position.set( 0, 0, 0.8 );
        this.scene.add( this.camera );

        // Light
        const light = new PointLight( '#ffffff', 4 );
        light.position.set( 0, 7, 7 );
        this.scene.add( light );

        // Controls
        this.mapControls = new MapControls( this.camera, this.canvas );
        this.mapControls.enableDamping = true;
        this.mapControls.minDistance = 0.8;
        this.mapControls.maxDistance = 2.5;

        // Renderer
        this.renderer = new WebGLRenderer( { canvas: this.canvas } );
        this.renderer.setSize( this.sizes.width, this.sizes.height );
        this.renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) );

        // Create a render target with depth texture
		this.setupRenderTarget();

        // Resize
        window.addEventListener( 'resize', this.resize() );

        this.clock = new Clock();
        this.clockForClick = new Clock( false );

        //f

        this.loadModel();

        // Setup post-processing step
		// this.findingDepth();

        // Face plane Shader
        let planeGeometry = new PlaneGeometry( 5, 5, 400, 400 );
        this.planeMaterial = new FaceSheder();
        this.face = new Mesh( planeGeometry, this.planeMaterial );
        this.face.position.set( 0, 0, 1 );
        // this.scene.add( this.face );

        // Lines
        this.linesGeometry = new PlaneBufferGeometry( 2, 10, 100, 100 );
        this.linesMaterial = new FaceSheder();
        let line = new Mesh( this.linesGeometry, this.linesMaterial );
        line.position.set( 0, 0, 1 );
        // this.scene.add( line );

        for ( let i = 0; i < this.numberOfLines; i ++ ) {

            this.linesGeometry = new PlaneBufferGeometry( 2, 0.006, 100, 100 );
            let lineY = [];
            let len = this.linesGeometry.attributes.position.array.length;

            for ( let j = 0; j < len / 3; j ++ ) {

                lineY.push( i / 100 );

            }

            this.linesGeometry.setAttribute( 'lineY', new BufferAttribute( new Float32Array( lineY ), 1 ) );

            this.lines = new Mesh( this.linesGeometry, this.linesMaterial );
            this.lines.position.y = ( i - 40 ) / 50;
            this.scene.add( this.lines );

        }

        //

        this.debug();

        this.backgroundParticles();

        //

        this.tick();

    };

    public debug () : void {

        let props = {

            color: '#0f0017'

        }

        const faceDebug = new Pane( { title: 'Face' } );
        faceDebug.addInput( props, 'color' ).on( 'change', () => {

            this.linesMaterial.uniforms.uColor.value.setHex( parseInt( props.color.replace( '#', '0x' ) ) )

        } );

    };

    public loadModel () : void {

        this.loader = new GLTFLoader();
        this.loader.load(

            'resources/models/zophrac/male_face/scene.gltf',
            ( gltf ) => {

                this.faceModel = gltf.scene.children[0] as Mesh;
                this.faceModel.scale.set( 3, 3, 2.5 );
                this.faceModel.position.set( 0, - 3.2, - 2.1 );
                this.scene.add( this.faceModel );

            }

        )

    };

    public backgroundParticles () : void {

        const textureLoader = new TextureLoader();
        const particleTexture = textureLoader.load( '/resources/textures/particle1.png' );

        this.particleMaterial = new ParticleShader();
        const particlesGeometry = new BufferGeometry();
        const count = 1000;
        // this.particleMaterial.size = 0.09;
        // this.particleMaterial.map = particleTexture;
        // this.particleMaterial.transparent = true;
        // this.particleMaterial.alphaMap = particleTexture;
        // this.particleMaterial.alphaTest = 0.001;

        let positions = new Float32Array( count * 3 );
        let size = new Float32Array( count );
        let particleColor = new Float32Array( count );
        let blinkStart = new Float32Array( count );

        for( let i = 0; i < count * 3; i ++ ) {

            positions[ i * 3 ] = ( Math.random() - 0.5 ) * 1.95;
            positions[ i * 3 + 1 ] = ( Math.random() - 0.5 ) * 1.95;
            positions[ i * 3 + 2 ] = ( Math.random() - 3 ) * 1;

            if ( Math.abs( positions[ i * 3 ] ) < 0.5 && Math.abs( positions[ i * 3 + 1 ] ) < 0.63 ) {

                if ( positions[ i * 3 ] >= 0 ) positions[ i * 3 ] += 1;
                else positions[ i * 3 ] -= 1

            }

        }

        for ( let i = 0; i < count; i ++ ) {

            size[ i ] = Math.random() / 5;
            particleColor[ i ] = (Math.random() - 0.83) * 10;
            blinkStart[ i ] = ( Math.random() - 0.5 ) * 10;

        }

        particlesGeometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
        particlesGeometry.setAttribute( 'size', new BufferAttribute( size, 1 ) );
        particlesGeometry.setAttribute( 'particleColor', new BufferAttribute( particleColor, 1 ) );
        particlesGeometry.setAttribute( 'blinkStart', new BufferAttribute( blinkStart, 1 ) );

        let points = new Points( particlesGeometry, this.particleMaterial );

        this.scene.add( points );

    };

    public setupRenderTarget () : void {

        if ( this.target ) this.target.dispose();

        //

        this.target = new WebGLRenderTarget( window.innerWidth,  window.innerHeight );
        this.target.texture.format = RGBFormat;
        this.target.texture.minFilter = NearestFilter;
        this.target.texture.magFilter = NearestFilter;
        this.target.texture.generateMipmaps = false;
        this.target.stencilBuffer = false;
        this.target.depthBuffer = true;
        this.target.depthTexture = new DepthTexture( window.innerWidth, window.innerHeight );
        this.target.depthTexture.type = UnsignedShortType;
        this.target.depthTexture.format = DepthFormat;

    };

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

    public resize () : any {

        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;

        this.camera.aspect = this.sizes.width / this.sizes.height;
        this.camera.updateProjectionMatrix();

        const dpr = this.renderer.getPixelRatio();
        this.target.setSize( window.innerWidth * dpr, window.innerHeight * dpr );
        this.renderer.setSize( this.sizes.width, this.sizes.height );

    };

    public tick = () : void => {

        this.delta = this.clock.getDelta();
        this.elapsedTime += this.delta;

        this.clickDelta = this.clockForClick.getDelta();

        if ( this.moveForward ) this.clickElapsedTime += this.clickDelta;
        else this.clickElapsedTime -= this.clickDelta;

        this.canvas.addEventListener( 'mousedown', () => {

            this.moveForward = true;

            // this.clickDelta = 0;
            this.clockForClick.start();

        } );

        this.canvas.addEventListener( 'mouseup', () => {

            // this.clickDelta = 0;
            this.moveForward = false;

        } );

        if ( this.faceModel ) {

            if ( this.faceModel.position.z <= - 1.7 && this.moveForward === true ) {

                if ( + this.faceModel.position.z.toFixed(1) == - 1.7 ) this.clockForClick.stop();

                this.faceModel.position.set( 0, -3.2, this.clickElapsedTime * 0.40 - 2.1 );

            } else if ( this.faceModel.position.z >= - 2.5 && this.moveForward === false ) {

                this.clockForClick.start();
                if ( + this.faceModel.position.z.toFixed(1) == - 2.5 ) this.clockForClick.stop();
                this.faceModel.position.set( 0, -3.2, this.clickElapsedTime * 0.40 - 2.1 );

            }

        }

        //

        window.requestAnimationFrame( this.tick );

        if ( this.sizes.width !== window.innerWidth || this.sizes.height !== window.innerHeight ) {

            this.resize();

        }

        if ( ! this.faceModel ) return;

        // render scene into target
        this.face.visible = false;
        this.faceModel.visible = true;
        this.renderer.setRenderTarget( this.target );
        this.renderer.render( this.scene, this.camera );

        this.renderer.setRenderTarget( null );

        this.face.visible = true;
        this.lines.visible = true;
        this.faceModel.visible = false;
        this.planeMaterial.uniforms.tDepth.value = this.target.depthTexture;
        this.planeMaterial.uniforms.cameraNear.value = this.cameraDepth.near;
        this.planeMaterial.uniforms.cameraFar.value = this.cameraDepth.far;
        this.planeMaterial.uniforms.uTime.value = Math.sin( this.elapsedTime ) * 0.6;

        this.linesMaterial.uniforms.tDepth.value = this.target.depthTexture;
        this.linesMaterial.uniforms.cameraNear.value = this.cameraDepth.near * 1;
        this.linesMaterial.uniforms.cameraFar.value = this.cameraDepth.far * 1;
        this.linesMaterial.uniforms.uTime.value = Math.sin( this.elapsedTime ) * 0.6;
        this.linesMaterial.uniforms.uNoiseTime.value = this.elapsedTime / 1;

        //

        this.particleMaterial.uniforms.uTime.value = this.elapsedTime;

        this.mapControls.update();
        this.renderer.render( this.scene, this.camera );
        // this.renderer.render( this.postScene, this.postCamera );

    };

};

export default new ModelScene();