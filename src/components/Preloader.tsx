import React, { useEffect, useRef, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('CALIBRATING DWG KINEMATICS');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Progressive loading simulation
  useEffect(() => {
    const stages = [
      { at: 15, text: 'PARSING CAD 1800MM BENCH GEOMETRY' },
      { at: 40, text: 'ASSEMBLING C-SHAPED LEGS & CLEVIS HINGES' },
      { at: 65, text: 'COMPUTING ECCENTRIC 75° PIVOT TRAJECTORY' },
      { at: 85, text: 'CALIBRATING ZERO-OVERLAP CLEARANCES' },
      { at: 98, text: 'CONVERTIBLE PARK BENCH READY' },
    ];

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + Math.floor(Math.random() * 6) + 3);
        const currentStage = stages.find((s) => next >= s.at);
        if (currentStage) setStageText(currentStage.text);

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsTransitioning(true);
          }, 350);
          return 100;
        }
        return next;
      });
    }, 38);

    return () => clearInterval(timer);
  }, []);

  // Apekon Triangular Particle Aperture Animation (Image 1 reference)
  useEffect(() => {
    if (!isTransitioning || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.hypot(width, height) * 0.72;

    const startTime = performance.now();
    const duration = 1400; // 1.4s smooth expanding transition

    // Precalculate equilateral triangle grid coordinates
    const triSize = 26; // Side length of triangle
    const triHeight = (triSize * Math.sqrt(3)) / 2;
    const cols = Math.ceil(width / triSize) + 4;
    const rows = Math.ceil(height / triHeight) + 4;

    interface TriCell {
      x: number;
      y: number;
      dist: number;
      angle: number;
      isUp: boolean;
      noise: number;
    }

    const grid: TriCell[] = [];
    for (let r = -2; r < rows; r++) {
      const y = r * triHeight;
      const xOffset = (r % 2 === 0 ? 0 : triSize / 2);
      for (let c = -2; c < cols; c++) {
        const x = c * triSize + xOffset;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const hash = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
        const noise = hash - Math.floor(hash);

        // Two triangles per hexagon cell (one pointing up, one down)
        grid.push({ x, y, dist, angle, isUp: true, noise });
        grid.push({ x: x + triSize / 2, y: y + triHeight * 0.33, dist, angle, isUp: false, noise: (noise * 1.5) % 1 });
      }
    }

    let animId: number;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Apekon ease: smooth cubic-bezier expansion (power3 in-out)
      const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const radius = easedT * maxRadius;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw outer black backdrop with circular mask
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // 2. Cut central circular aperture revealing the website
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(0, radius - 40), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Draw the dispersion ring of dynamic geometric triangles around the aperture boundary
      const bandWidth = 140; // width of the breaking particle boundary
      grid.forEach((tri) => {
        const diff = tri.dist - radius;

        // Inside the cleared hole: skip
        if (diff < -bandWidth * 0.6) return;
        // Far outside: dark subtle grid
        if (diff > bandWidth * 1.2) return;

        // Near the expanding boundary: triangles break apart, scale down, and disperse
        const factor = Math.max(0, Math.min(1, (diff + bandWidth * 0.5) / bandWidth));
        const scale = Math.max(0.05, factor);
        
        // Push outward along radial vector with noise perturbation
        const push = (1 - factor) * 45 * tri.noise;
        const drawX = tri.x + Math.cos(tri.angle) * push;
        const drawY = tri.y + Math.sin(tri.angle) * push;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate((1 - factor) * (tri.noise - 0.5) * 1.8);

        // Apekon color palette for triangles: crisp white, reflective silver, dark charcoal
        if (tri.noise > 0.65) {
          ctx.fillStyle = `rgba(255, 255, 255, ${factor * 0.95})`;
        } else if (tri.noise > 0.35) {
          ctx.fillStyle = `rgba(180, 180, 190, ${factor * 0.75})`;
        } else {
          ctx.fillStyle = `rgba(25, 25, 28, ${factor * 0.85})`;
        }

        ctx.beginPath();
        const s = (triSize / 2) * scale;
        const h = triHeight * scale;

        if (tri.isUp) {
          ctx.moveTo(0, -h * 0.66);
          ctx.lineTo(s, h * 0.33);
          ctx.lineTo(-s, h * 0.33);
        } else {
          ctx.moveTo(0, h * 0.66);
          ctx.lineTo(s, -h * 0.33);
          ctx.lineTo(-s, -h * 0.33);
        }
        ctx.closePath();
        ctx.fill();

        // Subtle chromatic fringe stroke on perimeter triangles
        if (factor > 0.2 && factor < 0.8) {
          ctx.strokeStyle = tri.noise > 0.5 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(244, 63, 94, 0.3)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ctx.restore();
      });

      if (t < 1) {
        animId = requestAnimationFrame(render);
      } else {
        // Transition fully open
        window.removeEventListener('resize', handleResize);
        onComplete();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isTransitioning, onComplete]);

  // Format counter like Apekon (000, 042, 100)
  const formattedCount = String(progress).padStart(3, '0');

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none select-none">
      {/* 1. Base Loading Screen (fades out as aperture expands) */}
      <div
        className={`absolute inset-0 bg-black flex flex-col justify-between p-8 sm:p-14 transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Top Studio Label */}
        <div className="w-full flex items-center justify-between text-xs font-mono tracking-widest text-white/40 uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-studio-accent animate-ping" />
            <span className="text-white/80 font-bold">CONVERTIBLE PARK BENCH</span>
          </div>
          <span>ATELIER 1800 // DIGITAL EXPERIENCE</span>
        </div>

        {/* Center Emblem Animation */}
        <div className="my-auto flex flex-col items-center justify-center gap-8">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
            {/* Ambient Glow */}
            <div 
              className="absolute inset-0 rounded-full bg-studio-accent/20 blur-2xl transition-opacity duration-500"
              style={{ opacity: progress / 100 }}
            />

            {/* Precision Architectural SVG Emblem */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <path
                d="M20 75 L80 75 M20 75 L20 48 M80 75 L80 48 M20 48 L50 25 L80 25 M32 48 L68 48"
                fill="none"
                stroke="#262626"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 75 L80 75 M20 75 L20 48 M80 75 L80 48 M20 48 L50 25 L80 25 M32 48 L68 48"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="240"
                strokeDashoffset={240 - (progress / 100) * 240}
                className="transition-all duration-75 ease-out"
              />
              <circle
                cx="50"
                cy="25"
                r="3.5"
                className={`transition-all duration-300 ${
                  progress > 50 ? 'fill-studio-accent drop-shadow-[0_0_8px_#f43f5e]' : 'fill-[#333]'
                }`}
              />
            </svg>
          </div>

          <div className="flex flex-col items-center text-center gap-1">
            <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white uppercase">
              Convertible Park Bench
            </h2>
            <span className="font-mono text-xs tracking-[0.25em] text-white/50 uppercase">
              Engineering & 3D Interactive Studio
            </span>
          </div>
        </div>

        {/* Bottom Counter & Stage Ticker */}
        <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 font-mono">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase font-semibold">
              Status
            </span>
            <span className="text-xs text-white/90 font-medium tracking-wider">
              {stageText}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
              {formattedCount}
            </span>
            <span className="text-xs tracking-[0.25em] text-studio-brass uppercase font-bold">
              {progress < 100 ? 'Loading' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Apekon Expanding Triangular Particle Canvas Overlay */}
      {isTransitioning && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          style={{ mixBlendMode: 'normal' }}
        />
      )}
    </div>
  );
};
