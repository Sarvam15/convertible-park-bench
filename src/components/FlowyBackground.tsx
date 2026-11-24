import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FlowyBackgroundProps {
  scrollProgress?: number;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Fragment Shader: Liquid-Silk Volumetric Folds with Floating Dust Specks (Apekon Image 2 reference)
const fragmentShader = `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_scroll;
  varying vec2 vUv;

  // Pseudo-random hash for procedural dust specks
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  // Smooth 2D noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal Brownian Motion for undulating silk cloth folds
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.55;
    mat2 rot = mat2(cos(0.45), sin(0.45), -sin(0.45), cos(0.45));
    for (int i = 0; i < 5; ++i) {
      v += a * noise(p);
      p = rot * p * 1.85 + vec2(10.0, 10.0);
      a *= 0.52;
    }
    return v;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    // Subtle mouse inertia displacement
    vec2 m = u_mouse * 0.08;
    vec2 p = uv * 1.4 + m;

    float t = u_time * 0.16;

    // Domain warping simulating volumetric liquid silk folds (Apekon Image 2)
    float q = fbm(p + vec2(0.0, t * 0.4 + u_scroll * 0.8));
    float r = fbm(p + 1.4 * q + vec2(4.2, 1.8) - t * 0.25);
    float s = fbm(p + 2.0 * r + vec2(1.7, 9.2) + t * 0.3);

    // Deep luxury dark background palette (pure velvet blacks, deep graphite, subtle sheen)
    vec3 colDeepBlack = vec3(0.025, 0.027, 0.035);   // Deep space base
    vec3 colDarkSilk  = vec3(0.065, 0.072, 0.090);   // Dark silk cloth fold
    vec3 colHighlight = vec3(0.180, 0.190, 0.220);   // Volumetric light crest

    // Modulate volumetric folds
    float fold = smoothstep(0.15, 0.75, s);
    vec3 col = mix(colDeepBlack, colDarkSilk, fold);

    // Subtle specular crest on the silk folds
    float crest = pow(max(0.0, sin(s * 6.283 + t * 0.5)), 8.0) * 0.20;
    col += colHighlight * crest;

    // Floating Starlight / Dust Particles (Image 2 reference)
    // Distributed in grid cells with randomized positions and twinkling
    vec2 particleCoord = uv * 18.0 + vec2(t * 0.1, t * 0.05);
    vec2 cell = floor(particleCoord);
    vec2 posInCell = fract(particleCoord);
    
    float pHash = hash(cell);
    if (pHash > 0.88) { // sparse distribution
      vec2 pCenter = vec2(hash(cell + 1.0), hash(cell + 2.0));
      float d = length(posInCell - pCenter);
      float twinkle = 0.5 + 0.5 * sin(u_time * 2.5 + pHash * 6.28);
      float particle = smoothstep(0.08, 0.0, d) * twinkle;
      col += vec3(0.85, 0.90, 1.0) * particle * 0.65;
    }

    // Radial vignette for deep cinematic focus
    float vignette = 1.0 - smoothstep(0.6, 1.6, length(uv));
    col *= vignette;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const FlowyBackground: React.FC<FlowyBackgroundProps> = ({ scrollProgress = 0 }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_scroll: { value: 0.0 }
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const handleResize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      uniforms.u_resolution.value.set(W, H);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse Tracking with gentle smoothing
    let targetMouseX = 0;
    let targetMouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      uniforms.u_time.value = elapsedTime;
      uniforms.u_scroll.value = scrollProgress;

      // Mouse inertia
      uniforms.u_mouse.value.x += (targetMouseX - uniforms.u_mouse.value.x) * 0.05;
      uniforms.u_mouse.value.y += (targetMouseY - uniforms.u_mouse.value.y) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />
    </div>
  );
};
