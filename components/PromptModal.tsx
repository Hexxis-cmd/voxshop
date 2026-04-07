import React, { useState, useEffect } from 'react';
import { X, Wand2, Sparkles, AlertCircle, Cpu, Settings2, Activity } from 'lucide-react';
import { DetailLevel, Pose } from '../types';

interface PromptModalProps {
  isOpen: boolean;
  mode: 'create' | 'morph' | 'rebuild';
  onClose: () => void;
  onSubmit: (prompt: string, detail: DetailLevel, pose: Pose) => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, mode, onClose, onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [detail, setDetail] = useState<DetailLevel>(DetailLevel.MEDIUM);
  const [pose, setPose] = useState<Pose>(Pose.AUTO);

  useEffect(() => {
    if (isOpen) {
        setPrompt('');
        setDetail(DetailLevel.MEDIUM);
        setPose(Pose.AUTO);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt, detail, pose);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#1a1d1f] border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
                <Cpu size={18} className="text-blue-500" />
            </div>
            <div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                    {mode === 'create' ? 'Synthesize New Asset' : mode === 'rebuild' ? 'AI Reconstruction Target' : 'Refine Current Grid'}
                </h2>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    Neural Sculpting Pipeline
                </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="p-6 space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-end px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Natural Language Instruction</label>
                        <Sparkles size={14} className="text-blue-500/50" />
                    </div>
                    <textarea
                        autoFocus
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={mode === 'create' ? "Describe the model you want to create (e.g., 'A mechanical spider with glass eyes')..." : "Describe the changes (e.g., 'Add a metallic helmet' or 'Change colors to neon green')..."}
                        className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all resize-none leading-relaxed font-medium"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                            <Settings2 size={12} /> Target Detail
                        </label>
                        <select 
                            value={detail} 
                            onChange={(e) => setDetail(e.target.value as DetailLevel)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 appearance-none"
                        >
                            <option value={DetailLevel.LOW}>Low (Fast / Blocky)</option>
                            <option value={DetailLevel.MEDIUM}>Medium (Standard)</option>
                            <option value={DetailLevel.HIGH}>High (Max Density)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                            <Activity size={12} /> Structural Pose
                        </label>
                        <select 
                            value={pose} 
                            onChange={(e) => setPose(e.target.value as Pose)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 appearance-none"
                        >
                            <option value={Pose.AUTO}>Auto-Determine</option>
                            <option value={Pose.T_POSE}>T-Pose (Universal Biped)</option>
                            <option value={Pose.A_POSE}>A-Pose (Modern Biped)</option>
                            <option value={Pose.NEUTRAL_STAND}>Neutral Stand (Quadruped)</option>
                            <option value={Pose.SAWHORSE}>Sawhorse Pose (45° legs)</option>
                            <option value={Pose.WINGS_SPREAD}>Wings-Spread Glide (Bird)</option>
                            <option value={Pose.TORPEDO}>I-Pose/Torpedo (Fish/Snake)</option>
                            <option value={Pose.STAR_POSE}>Star-Pose (Spider/Octopus)</option>
                            <option value={Pose.MOUTH_OPEN}>Mouth-Open (Face)</option>
                        </select>
                    </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-4">
                    <AlertCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Pro Tip</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            {mode === 'create' 
                                ? "Use T-Pose or A-Pose for humanoid characters to ensure automatic rigging works perfectly." 
                                : "The AI will respect your 'Locked' voxels. Use the Lock tool in the Sculpting Studio to protect parts of your model."
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!prompt.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:grayscale text-white font-black text-[11px] uppercase tracking-[0.2em] px-8 py-3 rounded-xl shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Wand2 size={16} />
                    Begin Synthesis
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};