
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
    <div className={`p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-[2rem] space-y-4 animate-in fade-in zoom-in-95 duration-500 mb-8 max-w-full overflow-hidden`}>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{t.neuralPath}</span>
        </div>
        {isProcessing && <div className="text-[9px] font-bold text-zinc-600 animate-pulse uppercase">{t.syncing}</div>}
      </div>

      <div className="space-y-3">
        {safeSteps.map((step, i) => (
          <div key={step.id || i} className="flex items-start gap-4 group">
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className={`w-3 h-3 rounded-full border-2 transition-all ${step.status === 'completed' ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800 border-zinc-700'}`}></div>
              {i < safeSteps.length - 1 && <div className="w-0.5 h-6 bg-zinc-800"></div>}
            </div>
            <div className="flex-1 pb-2 min-w-0">
              <div className="text-[11px] font-black text-white uppercase tracking-tighter opacity-80 truncate">{step.label}</div>
              {step.description && (
                <div className="text-[10px] text-zinc-500 italic mt-1 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all break-words">
                  {step.description}
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-start gap-4">
            <div className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse shrink-0"></div>
            <div className="text-[10px] font-bold text-zinc-700 italic">{t.synthesizing}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMind;
