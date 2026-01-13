
import React, { useState } from 'react';
import { generateCowboyPrompt } from '../services/gemini';
import { UserRole, AppSettings } from '../types';
import { translations } from '../utils/translations';

interface PromptCowboyProps {
  onBack: () => void;
  onTestPrompt: (prompt: string) => void;
  userRole: UserRole;
  appSettings: AppSettings;
}

const PromptCowboy: React.FC<PromptCowboyProps> = ({ onBack, onTestPrompt, appSettings }) => {
  const [params, setParams] = useState({
    role: '',
    task: '',
    context: '',
    tone: 'מקצועי וטכני',
    constraints: ''
  });
  
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';

  const handleForge = async () => {
    if (!params.role || !params.task) return;
    setLoading(true);
    try {
      const forged = await generateCowboyPrompt(params);
      setResult(forged);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#050508] ${isRTL ? 'text-right' : 'text-left'} font-['Heebo'] overflow-hidden`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="h-16 px-8 glass border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 text-zinc-400 hover:text-white transition-all">{isRTL ? '←' : '→'}</button>
           <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{t.promptGenTitle} <span className="text-orange-500">PRO</span></h2>
        </div>
        <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{t.engMode}</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{t.roleLabel}</label>
                 <input value={params.role} onChange={e => setParams({...params, role: e.target.value})} placeholder="e.g., Senior React Developer" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-bold outline-none focus:border-orange-500/50" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{t.taskLabel}</label>
                 <textarea value={params.task} onChange={e => setParams({...params, task: e.target.value})} placeholder="..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-medium h-32 outline-none focus:border-orange-500/50" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{t.contextLabel}</label>
                 <textarea value={params.context} onChange={e => setParams({...params, context: e.target.value})} placeholder="..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white font-medium h-24 outline-none focus:border-orange-500/50" />
              </div>
              <button onClick={handleForge} disabled={loading} className="w-full py-4 bg-orange-600 text-white font-black rounded-xl shadow-lg transition-all hover:bg-orange-500 active:scale-95 uppercase italic">
                {loading ? t.generating : t.generatePromptBtn}
              </button>
           </div>

           <div className="glass rounded-3xl border border-white/10 bg-black/40 overflow-hidden flex flex-col min-h-[400px]">
              <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <span className="text-[10px] font-bold text-zinc-600 uppercase">{t.finalResult}</span>
                 <button onClick={() => onTestPrompt(result)} disabled={!result} className="text-[10px] font-bold text-orange-500 hover:underline uppercase">{t.injectChat}</button>
              </div>
              <div className="flex-1 p-6 font-mono text-xs text-zinc-400 whitespace-pre-wrap overflow-y-auto">
                 {result || t.waitingInput}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PromptCowboy;
