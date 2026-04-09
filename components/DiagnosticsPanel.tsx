import React, { useMemo, useState } from 'react';
import { X, Download, Copy, Trash2, Check } from 'lucide-react';
import { DiagnosticLogEntry, LogLevel } from '../services/logger';

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

interface DiagnosticsPayload {
  timestamp: string;
  appVersion: string;
  browserUserAgent: string;
  settingsSummary: {
    render: Record<string, unknown>;
    ai: {
      mode: string;
      model: string;
      endpointHost: string;
    };
  };
  voxelStateSummary: {
    voxelCount: number;
    appState: string;
  };
  logs: DiagnosticLogEntry[];
}

interface DiagnosticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  logs: DiagnosticLogEntry[];
  onClear: () => void;
  appVersion: string;
  settingsSummary: DiagnosticsPayload['settingsSummary'];
  voxelStateSummary: DiagnosticsPayload['voxelStateSummary'];
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  isOpen,
  onClose,
  logs,
  onClear,
  appVersion,
  settingsSummary,
  voxelStateSummary,
}) => {
  const [levelFilter, setLevelFilter] = useState<LogLevel>('debug');
  const [copied, setCopied] = useState(false);

  const filteredLogs = useMemo(() => {
    const levelOrder: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
    return logs
      .filter((log) => levelOrder[log.level] >= levelOrder[levelFilter])
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, levelFilter]);

  const payload: DiagnosticsPayload = useMemo(() => ({
    timestamp: new Date().toISOString(),
    appVersion,
    browserUserAgent: navigator.userAgent,
    settingsSummary,
    voxelStateSummary,
    logs: filteredLogs,
  }), [appVersion, filteredLogs, settingsSummary, voxelStateSummary]);

  if (!isOpen) return null;

  const jsonText = JSON.stringify(payload, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxshop-diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#111418] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Diagnostics</h2>
            <p className="text-[10px] text-slate-400 mt-1">Entries: {filteredLogs.length}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-white/10 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level filter</span>
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold border ${
                levelFilter === level
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-white/5 text-slate-300 border-white/10'
              }`}
            >
              {level}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <button onClick={handleCopy} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={handleDownload} className="px-3 py-2 rounded bg-white/10 hover:bg-white/15 text-white text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
              <Download size={14} /> Download
            </button>
            <button onClick={onClear} className="px-3 py-2 rounded bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 bg-black/30">
          <pre className="whitespace-pre-wrap break-all">{jsonText}</pre>
        </div>
      </div>
    </div>
  );
};
