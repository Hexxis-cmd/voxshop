import React, { useState, useEffect } from 'react';
import { SkeletonDef, SKELETONS } from '../utils/riggingConstants';
import { X, Paintbrush, Play, Square, Download, ChevronRight, Wand2, Box, FileCode, Image, Hammer, Zap } from 'lucide-react';

const SectionLabel: React.FC<{icon: React.ReactNode, label: string}> = ({ icon, label }) => (
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="text-blue-500/50">{icon}</span>
        {label}
    </div>
);

const CpuIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
);

const ExportButton: React.FC<{onClick: () => void, icon: React.ReactNode, label: string, sub: string}> = ({ onClick, icon, label, sub }) => (
    <button onClick={onClick} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group">
        <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-blue-400 transition-colors">{icon}</div>
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">{label}</span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{sub}</span>
        </div>
    </button>
);

interface RiggingOverlayProps {
    initialSkeleton: SkeletonDef | null;
    hasRigData: boolean;
    onClose: () => void;
    onEnablePaint: (boneName: string, color: string) => void;
    onDisablePaint: () => void;
    onAutoRig: (skeleton: SkeletonDef) => void;
    onBuildRig: (skeleton: SkeletonDef) => void;
    onPlayAnimation: (skeleton: SkeletonDef, animName: string, loop: boolean) => void;
    onStopAnimation: () => void;
    onExplodeRig: () => void;
    onExportGLTF: () => void;
    onExportGLTFStatic: () => void;
    onExportOBJ: () => void;
    onExportPLY: () => void;
    onExportSTL: () => void;
    onExportFBX: () => void;
    onExportVOX: () => void;
    onExportQB: () => void;
    onExportPNG: () => void;
    onExportMinecraft: (format: 'nbt' | 'schematic' | 'litematic') => void;
    onExportJSON: () => void;
}

export const RiggingOverlay: React.FC<RiggingOverlayProps> = ({
    initialSkeleton,
    hasRigData,
    onClose,
    onEnablePaint,
    onDisablePaint,
    onAutoRig,
    onBuildRig,
    onPlayAnimation,
    onStopAnimation,
    onExplodeRig,
    onExportGLTF,
    onExportGLTFStatic,
    onExportOBJ,
    onExportPLY,
    onExportSTL,
    onExportFBX,
    onExportVOX,
    onExportQB,
    onExportPNG,
    onExportMinecraft,
    onExportJSON
}) => {
    const [selectedSkeleton, setSelectedSkeleton] = useState<SkeletonDef>(initialSkeleton || SKELETONS[0]);
    const [activeBone, setActiveBone] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeAnim, setActiveAnim] = useState<string | null>(null);

    const handleBoneClick = (boneName: string, color: string) => {
        if (activeBone === boneName) {
            setActiveBone(null);
            onDisablePaint();
        } else {
            setActiveBone(boneName);
            onEnablePaint(boneName, color);
        }
    };

    const handlePlayAnim = (animName: string) => {
        setIsPlaying(true);
        setActiveAnim(animName);
        onPlayAnimation(selectedSkeleton, animName, animName !== 'Death');
    };

    const handleStopAnim = () => {
        setIsPlaying(false);
        setActiveAnim(null);
        onStopAnimation();
    };

    return (
        <div className="absolute top-0 right-0 w-80 h-full bg-[#1a1d1f]/95 backdrop-blur-2xl border-l border-white/5 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300 pointer-events-auto z-50">
            
            <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Kinematics Engine</h2>
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest opacity-80">Rigging Pipeline</div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-8 custom-scrollbar">
                
                <div className="flex flex-col gap-3">
                    <SectionLabel icon={<Wand2 size={12} />} label="Skeleton Profile" />
                    <div className="grid grid-cols-1 gap-2">
                        {SKELETONS.map(skel => (
                            <button
                                key={skel.id}
                                onClick={() => { setSelectedSkeleton(skel); handleStopAnim(); }}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                    selectedSkeleton.id === skel.id ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                }`}
                            >
                                <span className="text-xs font-bold uppercase tracking-widest">{skel.name}</span>
                                {selectedSkeleton.id === skel.id && <ChevronRight size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <SectionLabel icon={<CpuIcon size={12} />} label="Automation" />
                    <button 
                        onClick={() => onAutoRig(selectedSkeleton)}
                        className="w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                    >
                        Solve Initial Weights
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <SectionLabel icon={<Paintbrush size={12} />} label="Weight Painting" />
                    <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {selectedSkeleton.bones.map(bone => (
                            <button
                                key={bone.name}
                                onClick={() => handleBoneClick(bone.name, bone.color)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
                                    activeBone === bone.name ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent opacity-60 hover:opacity-100'
                                }`}
                            >
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: bone.color }} />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{bone.name}</span>
                                {activeBone === bone.name && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => onBuildRig(selectedSkeleton)}
                        className="w-full py-3 mt-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
                    >
                        Compile Manual Edits
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    <SectionLabel icon={<Play size={12} />} label="Sequencer" />
                    <div className="grid grid-cols-2 gap-2">
                        {selectedSkeleton.animations.map(anim => (
                            <button
                                key={anim.name}
                                onClick={() => handlePlayAnim(anim.name)}
                                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[10px] font-black tracking-widest transition-all ${
                                    activeAnim === anim.name ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                }`}
                            >
                                <Play size={12} fill={activeAnim === anim.name ? 'currentColor' : 'none'} />
                                {anim.name.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-2 mt-1">
                        {isPlaying && (
                            <button 
                                onClick={handleStopAnim}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-black text-[10px] tracking-widest hover:bg-rose-500/20 transition-all"
                            >
                                <Square size={12} fill="currentColor" /> STOP SEQUENCER
                            </button>
                        )}
                        <button 
                            onClick={onExplodeRig}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-black text-[10px] tracking-widest hover:bg-orange-500/20 transition-all"
                        >
                            <Zap size={12} fill="currentColor" /> SHATTER PREVIEW (PHYSICS)
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <SectionLabel icon={<Download size={12} />} label="Universal Export" />
                    <div className="grid grid-cols-1 gap-2">
                        <ExportButton onClick={onExportGLTF} icon={<Box size={18}/>} label="Rigged + Anims" sub=".GLB" />
                        <ExportButton onClick={onExportGLTFStatic} icon={<Box size={18}/>} label="Rigged Only" sub=".GLB" />
                        <ExportButton onClick={onExportOBJ} icon={<Box size={18}/>} label="Static Mesh" sub=".OBJ" />
                        <ExportButton onClick={onExportPLY} icon={<Box size={18}/>} label="Point Cloud" sub=".PLY" />
                        <ExportButton onClick={onExportSTL} icon={<Box size={18}/>} label="3D Printing" sub=".STL" />
                        <ExportButton onClick={onExportFBX} icon={<Box size={18}/>} label="3D Animation" sub=".GLB" />
                        <ExportButton onClick={onExportVOX} icon={<FileCode size={18}/>} label="MagicaVoxel" sub=".VOX" />
                        <ExportButton onClick={onExportQB} icon={<FileCode size={18}/>} label="Qubicle Asset" sub=".QB" />
                        <ExportButton onClick={onExportPNG} icon={<Image size={18}/>} label="2D Snapshot" sub=".PNG" />
                        <div className="h-px bg-white/5 my-1" />
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => onExportMinecraft('nbt')} className="py-2 rounded-lg bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 font-black text-[8px] uppercase hover:bg-emerald-900/40">.NBT</button>
                            <button onClick={() => onExportMinecraft('schematic')} className="py-2 rounded-lg bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 font-black text-[8px] uppercase hover:bg-emerald-900/40">.SCHEM</button>
                            <button onClick={() => onExportMinecraft('litematic')} className="py-2 rounded-lg bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 font-black text-[8px] uppercase hover:bg-emerald-900/40">.LITE</button>
                        </div>
                        <ExportButton onClick={onExportJSON} icon={<FileCode size={18}/>} label="Workstation Data" sub=".JSON" />
                    </div>
                </div>

            </div>

            <div className="p-5 border-t border-white/5 bg-white/[0.02]">
                <button 
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] text-white bg-slate-700 hover:bg-slate-600 transition-all"
                >
                    Exit Kinematics
                </button>
            </div>

        </div>
    );
};
