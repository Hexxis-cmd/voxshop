import React, { useState } from 'react';
import { X, Layers, Sparkles, Sun, Box } from 'lucide-react';

export interface RenderSettings {
  solidPreview: boolean;
  bloomEnabled: boolean;
  bloomStrength: number;
  toneMapping: 'none' | 'cinematic' | 'filmic';
  bakedAO: boolean;
  bakedAOStrength: number;
}

export const DEFAULT_RENDER_SETTINGS: RenderSettings = {
  solidPreview: false,
  bloomEnabled: true,
  bloomStrength: 0.4,
  toneMapping: 'none',
  bakedAO: false,
  bakedAOStrength: 0.5,
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: RenderSettings;
  onChange: (settings: RenderSettings) => void;
}

const Toggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-slate-300 font-bold">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${value ? 'bg-blue-600' : 'bg-white/10'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; disabled?: boolean }> = ({ label, value, min, max, step, onChange, disabled }) => (
  <div className={`space-y-1 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    <div className="flex justify-between">
      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{label}</span>
      <span className="text-[10px] text-slate-400 font-mono">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
    />
  </div>
);

const SectionLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
    <span className="text-blue-500/50">{icon}</span>
    {label}
  </div>
);

export const RenderSettingsOverlay: React.FC<Props> = ({ isOpen, onClose, settings, onChange }) => {
  if (!isOpen) return null;

  const set = (patch: Partial<RenderSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="fixed bottom-24 left-4 z-[90] w-72 bg-[#1a1d1f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-blue-500" />
          <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Render Settings</span>
        </div>
        <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

        <div className="space-y-3">
          <SectionLabel icon={<Box size={12} />} label="Surface Mode" />
          <Toggle label="Merge Surfaces (Solid)" value={settings.solidPreview} onChange={v => set({ solidPreview: v })} />
          <div className={`rounded-lg px-3 py-2 border transition-colors ${settings.solidPreview ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/5'}`}>
            <p className="text-[9px] text-blue-200/70 leading-relaxed">
              {settings.solidPreview ? 'Merges flat same-color surfaces into clean geometry — how your model looks in a game engine.' : 'Individual voxels visible — edit mode view.'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabel icon={<Sun size={12} />} label="Ambient Occlusion" />
          <Toggle label="Baked AO (Viewport + Export)" value={settings.bakedAO} onChange={v => set({ bakedAO: v })} />
          <Slider label="Strength" value={settings.bakedAOStrength} min={0.1} max={1.0} step={0.05} onChange={v => set({ bakedAOStrength: v })} disabled={!settings.bakedAO} />
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
            <p className="text-[9px] text-blue-200/70 leading-relaxed">Darkens voxels that are surrounded by neighbors — adds depth to corners, armpits, gaps between body parts. Baked into the mesh so it shows up in any game engine on export.</p>
          </div>
        </div>

        <div className="space-y-3">
          <SectionLabel icon={<Sparkles size={12} />} label="Bloom" />
          <Toggle label="Bloom Glow" value={settings.bloomEnabled} onChange={v => set({ bloomEnabled: v })} />
          <Slider label="Strength" value={settings.bloomStrength} min={0.0} max={2.0} step={0.05} onChange={v => set({ bloomStrength: v })} disabled={!settings.bloomEnabled} />
        </div>

        <div className="space-y-3">
          <SectionLabel icon={<Box size={12} />} label="Tone Mapping" />
          <div className="grid grid-cols-3 gap-1.5">
            {(['none', 'cinematic', 'filmic'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => set({ toneMapping: mode })}
                className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${
                  settings.toneMapping === mode
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {mode === 'none' ? 'Off' : mode === 'cinematic' ? 'Cinema' : 'ACES'}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-slate-600 px-0.5">ACES Filmic gives the most realistic color range. Cinema is warmer. Off is neutral.</p>
        </div>

      </div>
    </div>
  );
};
