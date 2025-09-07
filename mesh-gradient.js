/**
 * MeshGradient Shader Implementation
 * Based on Paper Design Shaders - adapted for XMB Portfolio
 */

class MeshGradientRenderer {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with id "${canvasId}" not found`);
            return;
        }

        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        this.options = {
            colors: options.colors || ['#000000', '#2d5a27', '#4a7c59', '#1a3b1a'],
            speed: options.speed || 0.3,
            distortion: options.distortion || 0.8,
            swirl: options.swirl || 0.1,
            opacity: options.opacity || 1.0,
            wireframe: options.wireframe || false,
            ...options
        };

        this.time = 0;
        this.animationId = null;
        this.program = null;
        this.uniformLocations = {};
        
        this.init();
    }

    init() {
        // Ensure canvas is properly sized on init
        setTimeout(() => {
            this.resizeCanvas();
            this.setupShaders();
            this.setupGeometry();
            this.render();
        }, 100);
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        // Force canvas to be full window size
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        
        // Ensure canvas stays in background
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '-100';
        this.canvas.style.pointerEvents = 'none';
        
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    setupShaders() {
        const vertexShaderSource = `
            attribute vec4 a_position;
            varying vec2 v_objectUV;
            
            void main() {
                gl_Position = a_position;
                v_objectUV = a_position.xy;
            }
        `;

        const fragmentShaderSource = `
            #ifdef GL_ES
            precision mediump float;
            #endif
            
            uniform float u_time;
            uniform vec4 u_colors[4];
            uniform float u_colorsCount;
            uniform float u_distortion;
            uniform float u_swirl;
            uniform float u_opacity;
            uniform vec2 u_resolution;
            
            varying vec2 v_objectUV;
            
            #define PI 3.14159265359
            #define TWO_PI 6.28318530718
            
            mat2 rotate(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat2(c, -s, s, c);
            }
            
            vec2 getPosition(int i, float t) {
                float a = float(i) * 0.37;
                float b = 0.6 + mod(float(i), 3.0) * 0.3;
                float c = 0.8 + mod(float(i + 1), 4.0) * 0.25;
                float x = sin(t * b + a);
                float y = cos(t * c + a * 1.5);
                return 0.5 + 0.5 * vec2(x, y);
            }
            
            void main() {
                vec2 shape_uv = v_objectUV * 0.5 + 0.5;
                float t = 0.5 * u_time;
                float radius = smoothstep(0.0, 1.0, length(shape_uv - 0.5));
                float center = 1.0 - radius;
                
                // Apply distortion
                for (float i = 1.0; i <= 2.0; i++) {
                    shape_uv.x += u_distortion * center / i * sin(t + i * 0.4 * smoothstep(0.0, 1.0, shape_uv.y)) * cos(0.2 * t + i * 2.4 * smoothstep(0.0, 1.0, shape_uv.y));
                    shape_uv.y += u_distortion * center / i * cos(t + i * 2.0 * smoothstep(0.0, 1.0, shape_uv.x));
                }
                
                // Apply swirl
                vec2 uvRotated = shape_uv - vec2(0.5);
                float angle = 3.0 * u_swirl * radius;
                uvRotated = rotate(-angle) * uvRotated;
                uvRotated += vec2(0.5);
                
                vec3 color = vec3(0.0);
                float opacity = 0.0;
                float totalWeight = 0.0;
                
                // Blend colors based on distance
                for (int i = 0; i < 4; i++) {
                    if (i >= int(u_colorsCount)) break;
                    
                    vec2 pos = getPosition(i, t);
                    vec3 colorFraction = u_colors[i].rgb * u_colors[i].a;
                    float opacityFraction = u_colors[i].a;
                    
                    float dist = length(uvRotated - pos);
                    dist = pow(dist, 3.5);
                    float weight = 1.0 / (dist + 1e-3);
                    
                    color += colorFraction * weight;
                    opacity += opacityFraction * weight;
                    totalWeight += weight;
                }
                
                color /= totalWeight;
                opacity /= totalWeight;
                
                // Apply overall opacity
                opacity *= u_opacity;
                
                gl_FragColor = vec4(color, opacity);
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.createProgram(vertexShader, fragmentShader);
        this.gl.useProgram(this.program);

        // Get uniform locations
        this.uniformLocations = {
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            colors: this.gl.getUniformLocation(this.program, 'u_colors'),
            colorsCount: this.gl.getUniformLocation(this.program, 'u_colorsCount'),
            distortion: this.gl.getUniformLocation(this.program, 'u_distortion'),
            swirl: this.gl.getUniformLocation(this.program, 'u_swirl'),
            opacity: this.gl.getUniformLocation(this.program, 'u_opacity'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution')
        };
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }

        return program;
    }

    setupGeometry() {
        // Create a full-screen quad
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    hexToRgba(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return [0, 0, 0, 1];
        
        return [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
            1.0
        ];
    }

    render() {
        if (!this.program) return;

        this.time += 0.016 * this.options.speed;

        // Clear canvas
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Enable blending for transparency
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        // Set uniforms
        this.gl.uniform1f(this.uniformLocations.time, this.time);
        this.gl.uniform1f(this.uniformLocations.colorsCount, this.options.colors.length);
        this.gl.uniform1f(this.uniformLocations.distortion, this.options.distortion);
        this.gl.uniform1f(this.uniformLocations.swirl, this.options.swirl);
        this.gl.uniform1f(this.uniformLocations.opacity, this.options.opacity);
        this.gl.uniform2f(this.uniformLocations.resolution, this.canvas.width, this.canvas.height);

        // Set color uniforms
        const colorArray = new Float32Array(16); // 4 colors * 4 components (RGBA)
        for (let i = 0; i < Math.min(4, this.options.colors.length); i++) {
            const rgba = this.hexToRgba(this.options.colors[i]);
            colorArray[i * 4] = rgba[0];
            colorArray[i * 4 + 1] = rgba[1];
            colorArray[i * 4 + 2] = rgba[2];
            colorArray[i * 4 + 3] = rgba[3];
        }
        this.gl.uniform4fv(this.uniformLocations.colors, colorArray);

        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        // Continue animation
        this.animationId = requestAnimationFrame(() => this.render());
    }

    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.program) {
            this.gl.deleteProgram(this.program);
            this.program = null;
        }
    }
}