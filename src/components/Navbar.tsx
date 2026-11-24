import React, { useState } from 'react';
import { Download, Volume2, VolumeX, Eye, Box, Sliders } from 'lucide-react';

interface NavbarProps {
  onScrollTo: (sectionId: string) => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onScrollTo, isPaused, onTogglePause }) => {
  const [audioEnabled, setAudioEnabled] = useState(false);

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Mark */}
        <div 
          onClick={() => onScrollTo('hero')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-studio-accent/20 border border-studio-accent/40 flex items-center justify-center text-studio-accent font-mono font-bold text-xs group-hover:scale-105 transition-transform">
            CB
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold tracking-tight text-sm text-white group-hover:text-studio-accent transition-colors">
              Convertible Park Bench
            </span>
            <span className="font-mono text-[9px] tracking-widest text-studio-muted uppercase">
              1800mm CAD Engineered
            </span>
          </div>
        </div>

        {/* Center Chapter Nav (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 glass-panel px-3 py-1.5 rounded-full">
          {[
            { id: 'hero', label: '01 Reveal' },
            { id: 'motion', label: '02 Kinematics' },
            { id: 'engineering', label: '03 Anatomy' },
            { id: 'transformation', label: '04 Mechanism' },
            { id: 'simulator', label: '05 3D Studio' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onScrollTo(item.id)}
              className="px-3.5 py-1 text-xs font-mono text-studio-muted hover:text-white hover:bg-white/5 rounded-full transition-all"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action Deck */}
        <div className="flex items-center gap-2">
          {/* Motion Pause Toggle */}
          <button
            onClick={onTogglePause}
            aria-label={isPaused ? 'Resume Motion' : 'Pause Motion'}
            className={`px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all ${
              isPaused 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'glass-button text-studio-muted hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isPaused ? 'Paused' : 'Motion'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            aria-label="Toggle Sound"
            className="p-2 rounded-full glass-button text-studio-muted hover:text-white"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* 3D Simulator Quick Jump */}
          <button
            onClick={() => onScrollTo('simulator')}
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-studio-accent text-white text-xs font-medium hover:bg-red-600 transition-all shadow-lg shadow-studio-accent/25 hover:shadow-studio-accent/40 active:scale-95"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Interactive 3D</span>
          </button>

          {/* Download CAD Asset */}
          <a
            href="/models/convertible_bench.glb"
            download="convertible_bench.glb"
            className="p-2 rounded-full glass-button text-studio-muted hover:text-white"
            title="Download CAD 3D Asset (.GLB)"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
