
import React, { useState } from 'react';
import { generateCowboyPrompt } from '../services/gemini';
import { AppSettings } from '../types';
import { translations } from '../utils/translations';

const PromptCowboy: React.FC<{ onBack: () => void; onTestPrompt: (p: string) => void; appSettings: AppSettings; }> = ({ onBack, onTestPrompt, appSettings }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<any>(null);
  const t = translations.he;

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await generateCowboyPrompt(input);
      setCurrentPrompt(result);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 bg-[#050508] p-6 text-right overflow-y-auto" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8 pb-32">
        <header className="flex justify-between items-center border-b border-white/5 pb-6">
           <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 bg-white/5 rounded-lg text-white hover:bg-orange-600 transition-colors text-sm font-bold">← חזור</button>
              <h2 className="text-2xl md:text-3xl font-black text-white italic">מהנדס פרומפטים <span className="text-orange-600 italic text-lg">PRO</span></h2>
           </div>
        </header>

        {!currentPrompt ? (
          <div className="glass p-8 rounded-[2rem] border border-white/10 bg-white/[0.01] space-y-6">
            <h3 className="text-xl font-black text-white italic">הנדסת פרומפט מקצועית</h3>
            <textarea 
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="כתוב בקשה פשוטה ונהפוך אותה לפרומפט מסיבי ומפורט..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-lg font-medium outline-none h-40 resize-none placeholder-zinc-600 focus:border-orange-500/50 transition-colors"
            />
            <button onClick={handleGenerate} disabled={loading || !input.trim()} className="w-full py-4 bg-orange-600 text-white font-black text-lg rounded-xl shadow-lg hover:bg-orange-500 transition-all">
              {loading ? t.loading : 'הנדס פרומפט מקצועי ⚡'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
             <div className="xl:col-span-8 space-y-6">
                <div className="glass p-8 rounded-[2rem] border border-white/10 bg-[#0a0a0c] space-y-8">
                   {[
                     { k: 'situation', l: 'הקשר ורקע' },
                     { k: 'task', l: 'המשימה' },
                     { k: 'objective', l: 'יעדים' },
                     { k: 'knowledge', l: 'הנחיות' },
                     { k: 'examples', l: 'דוגמאות' },
                     { k: 'format', l: 'פורמט' }
                   ].map(s => (
                     <div key={s.k} className="space-y-2 border-r-2 border-orange-600/30 pr-4">
                        <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{s.l}</h4>
                        <div className="text-sm text-zinc-200 font-medium leading-relaxed whitespace-pre-wrap">{currentPrompt[s.k]}</div>
                     </div>
                   ))}
                   <button onClick={() => onTestPrompt(currentPrompt.task)} className="w-full py-4 bg-orange-600 text-white font-black text-sm rounded-xl hover:bg-orange-500">הפעל בצ'אט עכשיו ⚡</button>
                </div>
             </div>
             <div className="xl:col-span-4">
                <div className="glass p-6 rounded-[2rem] border border-white/10 bg-[#121214] sticky top-4 space-y-4">
                   <h4 className="text-lg font-black text-white italic">שאלות לדיוק</h4>
                   {currentPrompt.questions?.map((q: string, i: number) => (
                     <div key={i} className="p-3 bg-white/5 rounded-lg text-xs font-bold text-zinc-300 italic border border-white/5">{q}</div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptCowboy;
