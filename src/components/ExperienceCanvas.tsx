import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BenchModel } from '../three/BenchModel';
import { createMaterialLibrary } from '../three/Materials';
import { createLightingStudio, StudioStage } from '../three/LightingStudio';

interface ExperienceCanvasProps {
  scrollProgress: number; // 0.0 to 1.0 normalized across narrative sections
  isPaused: boolean;
}

export const ExperienceCanvas: React.FC<ExperienceCanvasProps> = ({ scrollProgress, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const studioRef = useRef<StudioStage | null>(null);
  const modelRef = useRef<BenchModel | null>(null);
  const matLibRef = useRef<ReturnType<typeof createMaterialLibrary> | null>(null);

  // Keep live refs to avoid stale closure in the 60fps renderLoop
  const scrollProgressRef = useRef(scrollProgress);
  scrollProgressRef.current = scrollProgress;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  // Smooth lerped progress
  const currentPRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const matLib = createMaterialLibrary();
    matLibRef.current = matLib;

    const stage = createLightingStudio(canvasRef.current, {
      dprMax: 2,
      bgColor: 'transparent',
      fogNear: 5,
      fogFar: 18,
      isMobile: window.innerWidth < 768
    });
    studioRef.current = stage;

    const model = new BenchModel(matLib.materials);
    modelRef.current = model;
    stage.scene.add(model.root);

    const handleResize = () => {
      stage.resize(window.innerWidth, window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      animId = requestAnimationFrame(renderLoop);
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!isPausedRef.current) {
        // Exponential decay smoothing (similar to Kerfmoor's ease function)
        const target = scrollProgressRef.current;
        currentPRef.current += (target - currentPRef.current) * (1 - Math.exp(-8 * dt));
      }

      const p = THREE.MathUtils.clamp(currentPRef.current, 0, 1);
      const W = window.innerWidth;
      const H = window.innerHeight;
      const isDesktop = W >= 960;

      // ==========================================
      // CONTINUOUS 1-FLOW CHOREOGRAPHY (p = 0.00 -> 1.00)
      // Completely smooth, monotonic rotation without snap cuts or reversals
      // Unified parametric curves for rotation, horizontal travel, explosion, and transformation
      // ==========================================

      if (modelRef.current) {
        const m = modelRef.current;

        // 1. Continuous Graceful Rotation around Y axis (starts at 20° beauty angle and rotates continuously to ~195°)
        const rotY = 0.35 + p * (Math.PI * 0.95);
        m.root.rotation.set(0, rotY, 0);

        // 2. Smooth Horizontal Screen Travel (moves gracefully across screen and settles)
        // Travels left during motion story, returns smoothly to center for anatomy & transformation
        const travelU = Math.sin(p * Math.PI);
        const travelX = -0.32 * travelU;
        m.root.position.set(travelX, 0, 0);

        // 3. Exploded Engineering View (smooth continuous bell curve peaking at p = 0.55)
        let exploded = 0.0;
        if (p >= 0.35 && p <= 0.75) {
          if (p < 0.55) {
            const t = (p - 0.35) / 0.20;
            exploded = Math.sin(t * Math.PI * 0.5) * 0.90;
          } else {
            const t = (p - 0.55) / 0.20;
            exploded = Math.cos(t * Math.PI * 0.5) * 0.90;
          }
        }
        m.setExploded(exploded);

        // 4. Kinematic Transformation: smoothly unfolds backrest to flat table at p >= 0.65
        let transformProgress = 0.0;
        if (p >= 0.65) {
          const t = Math.min(1.0, (p - 0.65) / 0.30);
          // Smoothstep Hermite easing: 3t^2 - 2t^3
          transformProgress = t * t * (3.0 - 2.0 * t);
        }
        m.setTransformation(transformProgress);

        // 5. Continuous Camera Spline
        const camRadius = 3.6 - Math.sin(p * Math.PI) * 0.45;
        const camY = 1.35 + Math.sin(p * Math.PI * 0.8) * 0.50;
        const camAngle = 0.55 + p * 0.75;

        stage.camera.position.set(
          camRadius * Math.sin(camAngle),
          camY,
          camRadius * Math.cos(camAngle)
        );
        stage.camera.lookAt(travelX * 0.4, 0.45, 0);

        // Desktop Viewport Horizon Parallax
        if (isDesktop) {
          const offsetNorm = THREE.MathUtils.lerp(-0.12, -0.16, Math.sin(p * Math.PI));
          stage.camera.setViewOffset(W, H, W * offsetNorm, 0, W, H);
        }

        // Dynamic Lighting Modulation
        stage.keyLight.intensity = THREE.MathUtils.lerp(1.2, 2.8, Math.min(1, p * 2.5));
        stage.sheenLight.intensity = THREE.MathUtils.lerp(0.4, 1.4, Math.min(1, p * 2));
      }

      // Hide or fade out when scrolling past narrative into simulator section
      if (canvasRef.current) {
        if (p > 0.98) {
          canvasRef.current.style.opacity = '0';
          canvasRef.current.style.pointerEvents = 'none';
        } else {
          canvasRef.current.style.opacity = '1';
        }
      }

      stage.renderer.render(stage.scene, stage.camera);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      stage.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-500">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
