
import React from 'react';
import { ThoughtStep } from '../types';
import { translations } from '../utils/translations';

interface AgentMindProps {
  steps?: ThoughtStep[];
  isProcessing: boolean;
  isRTL: boolean;
}

const AgentMind: React.FC<AgentMindProps> = ({ steps = [], isProcessing, isRTL }) => {
  const t = translations.he; // Always force Hebrew for internal logic display as requested
  const safeSteps = Array.isArray(steps) ? steps : [];

  if (!isProcessing && safeSteps.length === 0) return null;

  return (
    <div className={`p-4 md:p-6 bg-[#1a1a20]/50 border border-indigo-500/20 rounded-[2rem] space-y-4 animate-in fade-in zoom-in-95 duration-500 mb-4 max-w-full overflow-hidden w-full`}>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping shadow-[0_0_10px_#6366f1]"></div>
          <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em]">{t.neuralPath}</span>
        </div>
        {isProcessing && <div className="text-[10px] font-bold text-zinc-500 animate-pulse uppercase tracking-wider">{t.syncing}</div>}
      </div>

      <div className="space-y-3 pl-2">
        {safeSteps.map((step, i) => (
          <div key={step.id || i} className="flex items-start gap-4 group animate-in slide-in-from-right-4">
            <div className="flex flex-col items-center gap-1 mt-1.5">
              <div className={`w-3 h-3 rounded-full border-2 transition-all ${step.status === 'completed' ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800 border-zinc-700'}`}></div>
              {i < safeSteps.length - 1 && <div className="w-0.5 h-full min-h-[16px] bg-zinc-800/50"></div>}
            </div>
            <div className="flex-1 pb-2 min-w-0">
              <div className="text-[12px] font-bold text-zinc-200 uppercase tracking-tight opacity-90 truncate">{step.label}</div>
              {step.description && (
                <div className="text-[11px] text-zinc-500 font-medium mt-0.5 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all break-words">
                  {step.description}
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-4 animate-in fade-in duration-700">
            <div className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse shrink-0 shadow-[0_0_10px_#4f46e5]"></div>
            <div className="text-[11px] font-bold text-zinc-400 italic">{t.synthesizing}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMind;
