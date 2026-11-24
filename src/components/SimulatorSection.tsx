import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BenchModel, PartInfo, BenchMode } from '../three/BenchModel';
import { createMaterialLibrary, WoodType, SteelFinish } from '../three/Materials';
import { createLightingStudio, StudioStage } from '../three/LightingStudio';
import { 
  RotateCw, Layers, Sparkles, Check, 
  Maximize2, Compass, Wrench, ShieldCheck, 
  Info, RefreshCw, Box, Armchair, Coffee, Users
} from 'lucide-react';

export const SimulatorSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Studio & Model state refs
  const studioRef = useRef<StudioStage | null>(null);
  const modelRef = useRef<BenchModel | null>(null);
  const matLibRef = useRef<ReturnType<typeof createMaterialLibrary> | null>(null);

  // UI Interactive States
  const [mode, setMode] = useState<BenchMode>('bench');
  const [explodedAmount, setExplodedAmount] = useState(0.0);
  const [selectedWood, setSelectedWood] = useState<WoodType>('teak');
  const [selectedSteel, setSelectedSteel] = useState<SteelFinish>('anthracite');
  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);
  const [catalog] = useState<PartInfo[]>(() => BenchModel.getPartCatalog());

  // Kinematic animation refs to completely prevent React closure staleness
  const currentKinematicRef = useRef(0.0); // 0 = bench, 1 = table, -1 = extra_seating
  const targetKinematicRef = useRef(0.0);

  // Orbit drag state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 3.8, theta: 0.75, phi: 1.1 });
  const targetLookAt = useRef(new THREE.Vector3(0, 0.45, 0));

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Initialize Material Library
    const matLib = createMaterialLibrary();
    matLibRef.current = matLib;

    // Initialize Lighting & Stage with PURE WHITE STUDIO BACKGROUND
    const stage = createLightingStudio(canvasRef.current, {
      dprMax: 2,
      bgColor: '#ffffff',
      fogNear: 10,
      fogFar: 30,
      isMobile: window.innerWidth < 768
    });
    studioRef.current = stage;

    // Build Model
    const model = new BenchModel(matLib.materials);
    modelRef.current = model;
    stage.scene.add(model.root);

    // Initial camera placement
    updateCameraPosition();

    // Resize observer
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      stage.resize(w, h);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // 60fps Render & Animation Loop
    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (time: number) => {
      animId = requestAnimationFrame(renderLoop);
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth kinematic interpolation reading live refs
      if (modelRef.current) {
        const cur = currentKinematicRef.current;
        const tgt = targetKinematicRef.current;
        if (Math.abs(cur - tgt) > 0.0005) {
          const next = THREE.MathUtils.lerp(cur, tgt, Math.min(1, dt * 7.5));
          currentKinematicRef.current = next;
          modelRef.current.setKinematicValue(next);
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

  function updateCameraPosition() {
    if (!studioRef.current) return;
    const { camera } = studioRef.current;
    const { radius, theta, phi } = sphericalRef.current;

    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(targetLookAt.current);
  }

  // Pointer Drag Handlers for 360° orbit
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    sphericalRef.current.theta -= dx * 0.007;
    sphericalRef.current.phi = THREE.MathUtils.clamp(
      sphericalRef.current.phi - dy * 0.007,
      0.15,
      Math.PI / 2 - 0.02
    );

    updateCameraPosition();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    sphericalRef.current.radius = THREE.MathUtils.clamp(
      sphericalRef.current.radius + e.deltaY * 0.004,
      2.0,
      7.0
    );
    updateCameraPosition();
  };

  // Preset Views
  const setPresetView = (type: 'iso' | 'side' | 'front' | 'top') => {
    if (type === 'iso') {
      sphericalRef.current = { radius: 3.8, theta: 0.75, phi: 1.1 };
    } else if (type === 'side') {
      sphericalRef.current = { radius: 3.4, theta: Math.PI / 2, phi: 1.45 };
    } else if (type === 'front') {
      sphericalRef.current = { radius: 3.8, theta: 0.0, phi: 1.45 };
    } else if (type === 'top') {
      sphericalRef.current = { radius: 4.2, theta: 0.0, phi: 0.2 };
    }
    updateCameraPosition();
  };

  // Kinematic Configuration Toggles with smooth 3D unfolding animations
  const setConfigurationMode = (newMode: BenchMode) => {
    setMode(newMode);
    if (newMode === 'bench') {
      targetKinematicRef.current = 0.0;
    } else {
      // Extra seating and Work bench are identical 750mm communal surface
      targetKinematicRef.current = 1.0;
    }
  };

  // Exploded Slider
  const handleExplodeChange = (val: number) => {
    setExplodedAmount(val);
    modelRef.current?.setExploded(val);
  };

  // Material Changes
  const handleWoodChange = (wood: WoodType) => {
    setSelectedWood(wood);
    matLibRef.current?.updateMaterials(wood, selectedSteel);
  };

  const handleSteelChange = (steel: SteelFinish) => {
    setSelectedSteel(steel);
    matLibRef.current?.updateMaterials(selectedWood, steel);
  };

  // Part Inspector
  const handleSelectPart = (part: PartInfo) => {
    if (selectedPart?.id === part.id) {
      setSelectedPart(null);
      modelRef.current?.highlightPart(null);
    } else {
      setSelectedPart(part);
      modelRef.current?.highlightPart(part.meshNames[0]);
    }
  };

  // Reassemble Kinetic Animation
  const triggerReassemble = () => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const val = Math.max(0, 0.8 - (step * 0.08));
      handleExplodeChange(val);
      if (val <= 0) {
        clearInterval(interval);
        handleExplodeChange(0);
      }
    }, 30);
  };

  return (
    <section id="simulator" className="relative min-h-screen py-24 px-6 bg-[#0c0d10] border-t border-white/10 tech-grid">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-studio-accent/15 border border-studio-accent/30 text-studio-accent font-mono text-xs mb-3">
              <Box className="w-3.5 h-3.5" />
              <span>05 // INTERACTIVE 3D PRODUCT SIMULATOR</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-white">
              Convertible Park Bench Studio
            </h2>
          </div>
          <p className="text-sm font-mono text-studio-muted max-w-md">
            Drag to rotate 360°. Click any mode below to trigger the physical unfolding transformation in real-time, or inspect precision CAD tolerances.
          </p>
        </div>

        {/* Main Simulator Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* 3D Viewport Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Viewport Canvas Card — Pure White Studio */}
            <div 
              ref={containerRef}
              className="relative w-full h-[540px] sm:h-[620px] rounded-3xl overflow-hidden bg-white shadow-2xl border-4 border-white/20 group select-none cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
            >
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Viewport HUD Overlays (High-Contrast for White Background) */}
              <div className="absolute top-5 left-5 pointer-events-none flex flex-col gap-1 bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="font-mono text-[10px] tracking-widest text-slate-500 uppercase font-bold">
                  ACTIVE CONFIGURATION
                </span>
                <span className="font-display text-lg font-black text-slate-900 tracking-tight">
                  {mode === 'table' && 'Convertible Work Bench / Table'}
                  {mode === 'bench' && 'Ergonomic Park Bench'}
                  {mode === 'extra_seating' && 'Convertible Work Bench / Communal Table'}
                </span>
                <span className="font-mono text-xs text-rose-600 font-semibold">
                  {mode === 'table' && 'Height: 750 mm Flat Tabletop (140mm Clearance Gap · Locked)'}
                  {mode === 'bench' && 'Backrest: Upright Ergonomic Incline (Slats Inward · Locked)'}
                  {mode === 'extra_seating' && 'Height: 750 mm Flat Communal Surface (140mm Clearance Gap · Locked)'}
                </span>
              </div>

              {/* Camera Presets Deck */}
              <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-200/80 shadow-sm pointer-events-auto">
                <Compass className="w-3.5 h-3.5 text-slate-500 ml-1" />
                <button
                  onClick={() => setPresetView('iso')}
                  className="px-2.5 py-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 font-semibold rounded-full hover:bg-slate-100 transition-colors"
                >
                  Isometric
                </button>
                <button
                  onClick={() => setPresetView('side')}
                  className="px-2.5 py-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 font-semibold rounded-full hover:bg-slate-100 transition-colors"
                >
                  Side
                </button>
                <button
                  onClick={() => setPresetView('front')}
                  className="px-2.5 py-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 font-semibold rounded-full hover:bg-slate-100 transition-colors"
                >
                  Front
                </button>
                <button
                  onClick={() => setPresetView('top')}
                  className="px-2.5 py-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 font-semibold rounded-full hover:bg-slate-100 transition-colors"
                >
                  Plan
                </button>
              </div>

              {/* Bottom Drag Guidance Badge */}
              <div className="absolute bottom-5 left-5 pointer-events-none bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-sm flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 text-slate-600 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="font-mono text-[11px] text-slate-700 font-medium">
                  360° Drag Orbit · Scroll to Zoom
                </span>
              </div>

              {/* Live Status Pill */}
              <div className="absolute bottom-5 right-5 pointer-events-none bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-mono text-[10px] text-slate-700 font-bold uppercase">
                  PBR Studio White · 60 FPS
                </span>
              </div>
            </div>

            {/* Quick Inspection Pill Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-studio-muted">
                <Info className="w-4 h-4 text-studio-accent" />
                <span>Selected Part:</span>
                <span className="text-white font-medium">
                  {selectedPart ? selectedPart.name : 'Click any component below to inspect CAD tolerances'}
                </span>
              </div>
              <button
                onClick={triggerReassemble}
                className="glass-button px-3.5 py-1.5 rounded-lg text-xs font-mono text-studio-muted hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Kinetic Reassemble</span>
              </button>
            </div>
          </div>

          {/* Interactive Control Deck Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            {/* 1. Mode Switcher (Park Bench vs Extra Seating vs Work Bench) */}
            <div className="glass-panel p-5 rounded-3xl flex flex-col gap-3 border border-white/10">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] tracking-wider text-studio-muted uppercase font-bold">
                  1. Kinematic Configuration
                </span>
                <span className="text-[10px] font-mono text-studio-accent bg-studio-accent/15 px-2 py-0.5 rounded-full">
                  Unfolding 3D Animation
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 bg-black/50 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setConfigurationMode('bench')}
                  className={`py-3 px-1 rounded-xl font-display text-[11px] font-bold tracking-tight transition-all flex flex-col items-center justify-center gap-1 text-center ${
                    mode === 'bench'
                      ? 'bg-studio-accent text-white shadow-lg shadow-studio-accent/40 scale-[1.02]'
                      : 'text-studio-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Armchair className="w-4 h-4 mb-0.5" />
                  <span>PARK BENCH</span>
                  <span className="font-mono text-[8px] opacity-80">Upright Backrest</span>
                </button>
                <button
                  onClick={() => setConfigurationMode('extra_seating')}
                  className={`py-3 px-1 rounded-xl font-display text-[11px] font-bold tracking-tight transition-all flex flex-col items-center justify-center gap-1 text-center ${
                    mode === 'extra_seating'
                      ? 'bg-studio-accent text-white shadow-lg shadow-studio-accent/40 scale-[1.02]'
                      : 'text-studio-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Users className="w-4 h-4 mb-0.5" />
                  <span>EXTRA SEATING</span>
                  <span className="font-mono text-[8px] opacity-80">750mm Tabletop</span>
                </button>
                <button
                  onClick={() => setConfigurationMode('table')}
                  className={`py-3 px-1 rounded-xl font-display text-[11px] font-bold tracking-tight transition-all flex flex-col items-center justify-center gap-1 text-center ${
                    mode === 'table'
                      ? 'bg-studio-accent text-white shadow-lg shadow-studio-accent/40 scale-[1.02]'
                      : 'text-studio-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Coffee className="w-4 h-4 mb-0.5" />
                  <span>WORK BENCH</span>
                  <span className="font-mono text-[8px] opacity-80">750mm Tabletop</span>
                </button>
              </div>
            </div>

            {/* 2. Exploded Anatomy Slider */}
            <div className="glass-panel p-5 rounded-3xl flex flex-col gap-3 border border-white/10">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] tracking-wider text-studio-muted uppercase flex items-center gap-1.5 font-bold">
                  <Layers className="w-3.5 h-3.5 text-studio-accent" />
                  <span>2. Exploded Engineering View</span>
                </span>
                <span className="font-mono text-xs text-white font-semibold">
                  {Math.round(explodedAmount * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodedAmount}
                onChange={(e) => handleExplodeChange(parseFloat(e.target.value))}
                className="w-full accent-studio-accent cursor-pointer h-2 bg-white/10 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-studio-muted">
                <span>Assembled (0%)</span>
                <span>Component Separation (100%)</span>
              </div>
            </div>

            {/* 3. Materials Customizer */}
            <div className="glass-panel p-5 rounded-3xl flex flex-col gap-4 border border-white/10">
              {/* Wood Type */}
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] tracking-wider text-studio-muted uppercase flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-studio-brass" />
                  <span>3. Architectural Wood Species</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'teak', name: 'Teak (Original)', color: '#c68c53' },
                    { id: 'walnut', name: 'American Walnut', color: '#4a3222' },
                    { id: 'oak', name: 'Smoked Oak', color: '#d8c29d' },
                    { id: 'ash', name: 'Scandinavian Ash', color: '#e8dbca' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => handleWoodChange(w.id as WoodType)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        selectedWood === w.id
                          ? 'border-studio-accent bg-studio-accent/15 text-white'
                          : 'border-white/5 bg-black/30 text-studio-muted hover:border-white/20'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-black/40 flex-shrink-0" style={{ backgroundColor: w.color }} />
                      <span className="text-xs font-medium truncate">{w.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Steel Finish */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <span className="font-mono text-[11px] tracking-wider text-studio-muted uppercase font-bold">
                  Structural Steel Coating
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'anthracite', name: 'Anthracite (S275)', color: '#24272c' },
                    { id: 'raw', name: 'Raw Industrial Steel', color: '#5a5e66' },
                    { id: 'white', name: 'Satin Pearl White', color: '#e2e5ea' },
                    { id: 'green', name: 'Forest Green (Architectural)', color: '#223528' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSteelChange(s.id as SteelFinish)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        selectedSteel === s.id
                          ? 'border-studio-accent bg-studio-accent/15 text-white'
                          : 'border-white/5 bg-black/30 text-studio-muted hover:border-white/20'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-black/40 flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-xs font-medium truncate">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Component Parts Inspector List */}
            <div className="glass-panel p-5 rounded-3xl flex flex-col gap-3 border border-white/10">
              <span className="font-mono text-[11px] tracking-wider text-studio-muted uppercase flex items-center gap-1.5 font-bold">
                <Wrench className="w-3.5 h-3.5 text-studio-accent" />
                <span>4. Component Inspector (CAD Callouts)</span>
              </span>
              <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                {catalog.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => handleSelectPart(part)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between text-xs ${
                      selectedPart?.id === part.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                        : 'border-white/5 bg-black/20 text-studio-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{part.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">{part.category} · {part.dimensions}</span>
                    </div>
                    {selectedPart?.id === part.id && (
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Part Detail Drawer */}
            {selectedPart && (
              <div className="glass-panel p-5 rounded-3xl border border-cyan-400/40 bg-cyan-950/20 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                    PART SPECIFICATION // {selectedPart.category}
                  </span>
                  <button 
                    onClick={() => { setSelectedPart(null); modelRef.current?.highlightPart(null); }}
                    className="text-studio-muted hover:text-white text-xs font-mono"
                  >
                    Close ×
                  </button>
                </div>
                <h4 className="font-display font-bold text-base text-white">
                  {selectedPart.name}
                </h4>
                <div className="text-xs text-white/80 leading-relaxed">
                  {selectedPart.description}
                </div>
                <div className="pt-2 border-t border-cyan-400/20 flex justify-between font-mono text-[10px] text-studio-muted">
                  <span>Material: <strong className="text-white">{selectedPart.material}</strong></span>
                  <span>Dim: <strong className="text-white">{selectedPart.dimensions}</strong></span>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
