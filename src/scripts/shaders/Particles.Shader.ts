import { Color, ShaderMaterial, TextureLoader } from "three";


//


let loader = new TextureLoader();
let particleTexture = loader.load( 'resources/textures/particle2.png' );

export class ParticleShader extends ShaderMaterial {

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

            uColor: { value: new Color( 0x5796fa ) },
            uPointTexture: { value: particleTexture },
            uTime: { value: 0 }

        }

    }

}