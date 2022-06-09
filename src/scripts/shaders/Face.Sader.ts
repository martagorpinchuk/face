import { Color, ShaderMaterial, Vector2, Vector3 } from 'three';


export class FaceSheder extends ShaderMaterial {

    constructor () {

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
            uColor: { value: new Color( 0x00106b ) },
            uNoiseTime: { value: 0 },
            uDirection: { value: new Vector3( 1.0, 0.2, 0.4 ) },
            uLightColor: { value: new Color( 0xf7f9fc ) },
            uColor2: { value: new Color( 0x260007 ) },
            uColor3: { value: new Color( 0x230040 ) }

        }

    };

}