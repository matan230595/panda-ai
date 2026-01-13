
import React, { useState } from 'react';

export interface TutorialStep {
  title: string;
  desc: string;
  icon: string;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, onClose }) => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < steps.length - 1) setCurrent(current + 1);
    else onClose();
  };

  const step = steps[current];

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-indigo-600/10 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
      <div className="max-w-lg w-full glass rounded-[3rem] border-2 border-indigo-500/30 p-10 text-center space-y-8 bg-[#0a0a14] shadow-[0_0_100px_rgba(79,70,229,0.2)] animate-in zoom-in-95">
        <div className="w-24 h-24 mx-auto bg-indigo-600 rounded-2xl flex items-center justify-center text-5xl shadow-2xl animate-bounce">
          {step.icon}
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{step.title}</h3>
          <p className="text-zinc-400 text-base leading-relaxed font-medium italic">"{step.desc}"</p>
        </div>
        <div className="pt-6">
          <button onClick={next} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest">
            {current === steps.length - 1 ? 'הבנתי, בוא נתחיל!' : 'לשלב הבא'}
          </button>
        </div>
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
