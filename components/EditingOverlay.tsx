import React, { useState, useEffect } from 'react';
import { X, Move, PaintBucket, CheckCircle2, Plus, Trash2, Split, Undo2, Redo2, Circle, Box, Lock, Hammer, Palette, ArrowLeftRight, ArrowUpDown, ChevronsLeftRight, RotateCcw, RotateCw } from 'lucide-react';
import { SymmetryConfig, VoxelMaterial } from '../types';

const SectionLabel: React.FC<{icon: React.ReactNode, label: string}> = ({ icon, label }) => (
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="text-blue-500/50">{icon}</span>
        {label}
    </div>
);

const HistoryButton: React.FC<{onClick: () => void, icon: React.ReactNode, label: string, title: string}> = ({ onClick, icon, label, title }) => (
    <button onClick={onClick} title={title} className="flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-[10px] bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest">
        {icon} {label}
    </button>
);

const ToolBtn: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${active ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>
        {icon}
        <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </button>
);

const BrushBtn: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 py-2 rounded-lg border transition-all ${active ? 'bg-white/10 border-blue-500 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}>
        {icon}
        <span className="text-[8px] font-bold uppercase">{label}</span>
    </button>
);

interface EditingOverlayProps {
    onClose: () => void;
    onSetEditColor: (color: string | null) => void;
    onSetEditMode: (mode: 'move' | 'paint' | 'add' | 'delete' | 'lock' | 'fill') => void;
    symmetry: SymmetryConfig;
    onSetSymmetry: (config: SymmetryConfig) => void;
    brushType: 'single' | 'sphere' | 'box';
    onSetBrushType: (type: 'single' | 'sphere' | 'box') => void;
    brushSize: number;
    onSetBrushSize: (size: number) => void;
    currentMaterial: VoxelMaterial;
    onSetMaterial: (material: VoxelMaterial) => void;
    onUndo: () => void;
    onRedo: () => void;
    dynamicColors: string[];
    onFlipModel: (axis: 'x' | 'y' | 'z') => void;
    onRotateModel: (dir: 'cw' | 'ccw') => void;
}

export const EditingOverlay: React.FC<EditingOverlayProps> = ({
    onClose,
    onSetEditColor,
    onSetEditMode,
    symmetry,
    onSetSymmetry,
    brushType,
    onSetBrushType,
    brushSize,
    onSetBrushSize,
    currentMaterial,
    onSetMaterial,
    onUndo,
    onRedo,
    dynamicColors,
    onFlipModel,
    onRotateModel,
}) => {
    const [mode, setMode] = useState<'move' | 'paint' | 'add' | 'delete' | 'lock' | 'fill'>('move');
    const [selectedColor, setSelectedColor] = useState<string>('#3b82f6');

    useEffect(() => {
        onSetEditMode(mode);
        if (mode === 'move' || mode === 'delete' || mode === 'lock') {
            onSetEditColor(null);
        } else {
            onSetEditColor(selectedColor);
        }

    }, [mode, selectedColor, onSetEditColor, onSetEditMode]);

    const toggleSymmetry = (axis: 'x' | 'y' | 'z') => {
        onSetSymmetry({ ...symmetry, [axis]: !symmetry[axis] });
    };

    return (
        <div className="absolute top-0 right-0 w-80 h-full bg-[#1a1d1f]/95 backdrop-blur-2xl border-l border-white/5 shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300 pointer-events-auto z-50">
            
            <div className="flex items-center justify-between p-5 border-b border-white/5">
                <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Sculpting Studio</h2>
                    <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest opacity-80">Manual Override</div>
                </div>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    <X size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-2">
                    <HistoryButton onClick={onUndo} icon={<Undo2 size={16} />} label="UNDO" title="Revert last operation" />
                    <HistoryButton onClick={onRedo} icon={<Redo2 size={16} />} label="REDO" title="Repeat operation" />
                </div>

                <div className="flex flex-col gap-3">
                    <SectionLabel icon={<Hammer size={12} />} label="Active Tool" />
                    <div className="grid grid-cols-3 gap-2">
                        <ToolBtn active={mode === 'move'} onClick={() => setMode('move')} icon={<Move size={16}/>} label="Move" />
                        <ToolBtn active={mode === 'paint'} onClick={() => setMode('paint')} icon={<PaintBucket size={16}/>} label="Paint" />
                        <ToolBtn active={mode === 'add'} onClick={() => setMode('add')} icon={<Plus size={16}/>} label="Add" />
                        <ToolBtn active={mode === 'delete'} onClick={() => setMode('delete')} icon={<Trash2 size={16}/>} label="Delete" />
                        <ToolBtn active={mode === 'lock'} onClick={() => setMode('lock')} icon={<Lock size={16}/>} label="Lock" />
                        <ToolBtn active={mode === 'fill'} onClick={() => setMode('fill')} icon={<PaintBucket size={16}/>} label="Fill" />
                    </div>
                </div>

                {mode !== 'move' && mode !== 'lock' && mode !== 'fill' && (
                    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex flex-col gap-3">
                            <SectionLabel icon={<Circle size={12} />} label="Brush Geometry" />
                            <div className="grid grid-cols-3 gap-2">
                                <BrushBtn active={brushType === 'single'} onClick={() => onSetBrushType('single')} icon={<Plus size={14}/>} label="Point" />
                                <BrushBtn active={brushType === 'sphere'} onClick={() => onSetBrushType('sphere')} icon={<Circle size={14}/>} label="Sphere" />
                                <BrushBtn active={brushType === 'box'} onClick={() => onSetBrushType('box')} icon={<Box size={14}/>} label="Cube" />
                            </div>
                        </div>

                        {brushType !== 'single' && (
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Brush Magnitude</span>
                                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{brushSize}px</span>
                                </div>
                                <input type="range" min="1" max="8" value={brushSize} onChange={(e) => onSetBrushSize(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <SectionLabel icon={<Split size={12} />} label="Mirror Pipeline" />
                    <div className="grid grid-cols-3 gap-2">
                        {(['x', 'y', 'z'] as const).map(axis => (
                            <button
                                key={axis}
                                onClick={() => toggleSymmetry(axis)}
                                className={`py-2 rounded-lg font-black text-xs border transition-all ${
                                    symmetry[axis] ? 'bg-blue-500 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                }`}
                            >
                                {axis.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <SectionLabel icon={<ArrowLeftRight size={12} />} label="Transform" />
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => onFlipModel('x')} className="flex flex-col items-center gap-1 py-2 rounded-lg border bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white transition-all">
                            <ArrowLeftRight size={14} />
                            <span className="text-[8px] font-bold uppercase">Flip X</span>
                        </button>
                        <button onClick={() => onFlipModel('y')} className="flex flex-col items-center gap-1 py-2 rounded-lg border bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white transition-all">
                            <ArrowUpDown size={14} />
                            <span className="text-[8px] font-bold uppercase">Flip Y</span>
                        </button>
                        <button onClick={() => onFlipModel('z')} className="flex flex-col items-center gap-1 py-2 rounded-lg border bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white transition-all">
                            <ChevronsLeftRight size={14} />
                            <span className="text-[8px] font-bold uppercase">Flip Z</span>
                        </button>
                        <button onClick={() => onRotateModel('ccw')} className="flex flex-col items-center gap-1 py-2 rounded-lg border bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white transition-all">
                            <RotateCcw size={14} />
                            <span className="text-[8px] font-bold uppercase">Rot CCW</span>
                        </button>
                        <button onClick={() => onRotateModel('cw')} className="flex flex-col items-center gap-1 py-2 rounded-lg border bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-white transition-all col-start-3">
                            <RotateCw size={14} />
                            <span className="text-[8px] font-bold uppercase">Rot CW</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <SectionLabel icon={<Box size={12} />} label="Material Tag" />
                    <div className="grid grid-cols-2 gap-2">
                        {(['STANDARD', 'METALLIC', 'GLASS', 'EMISSIVE'] as const).map(mat => (
                            <button
                                key={mat}
                                onClick={() => onSetMaterial(VoxelMaterial[mat])}
                                className={`py-2 rounded-lg font-black text-[9px] border tracking-tighter transition-all ${
                                    currentMaterial === VoxelMaterial[mat] ? 'bg-white/10 border-blue-500 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
                                }`}
                            >
                                {mat}
                            </button>
                        ))}
                    </div>
                </div>

                {(mode === 'paint' || mode === 'add' || mode === 'fill') && (
                    <div className="flex flex-col gap-5 animate-in slide-in-from-right-2 duration-300">
                        <div className="flex flex-col gap-3">
                            <SectionLabel icon={<Palette size={12} />} label="Infinite Color Picker" />
                            <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 shadow-inner" style={{ backgroundColor: selectedColor }}>
                                    <input 
                                        type="color" 
                                        value={selectedColor} 
                                        onChange={(e) => setSelectedColor(e.target.value)}
                                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Color Selection</span>
                                    <span className="text-[9px] font-mono text-slate-500 uppercase">{selectedColor}</span>
                                </div>
                            </div>
                        </div>

                        {dynamicColors.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <SectionLabel icon={<PaintBucket size={12} />} label="Model Theme Palette" />
                                <div className="grid grid-cols-6 gap-2 bg-black/20 p-2 rounded-lg max-h-32 overflow-y-auto custom-scrollbar">
                                    {dynamicColors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            title={`Theme Color: ${color}`}
                                            className={`w-full aspect-square rounded border transition-all ${
                                                selectedColor === color ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-white/10 hover:border-white/30'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            <div className="p-5 border-t border-white/5 bg-white/[0.02]">
                <button 
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                >
                    <CheckCircle2 size={16} />
                    Commit Edits
                </button>
            </div>

        </div>
    );
};
