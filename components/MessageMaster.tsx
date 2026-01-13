
import React, { useState } from 'react';
import { generateMasterMessages } from '../services/gemini';
import { MessageSettings, StrategicMessageResult, AppSettings } from '../types';
import { translations } from '../utils/translations';

interface MessageMasterProps {
  onBack: () => void;
  appSettings: AppSettings;
}

const MessageMaster: React.FC<MessageMasterProps> = ({ onBack, appSettings }) => {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StrategicMessageResult[]>([]);
  const [settings, setSettings] = useState<MessageSettings>({
    intensity: 5,
    formalLevel: 7,
    emotion: 'professional',
    strategicGoal: 'negotiate',
    format: 'WhatsApp'
  });

  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';

  const handleGenerate = async () => {
    if (!context) return;
    setLoading(true);
    try {
      const msgs = await generateMasterMessages(context, settings);
      setResults(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-12 lg:p-24 bg-[#020205] scrollbar-hide ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-16 pb-32">
        <div className="flex justify-between items-center border-b border-white/5 pb-12">
           <div className={isRTL ? 'text-right' : 'text-left'}>
              <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none glow-text">{t.stratMsgTitle}</h2>
              <p className="text-zinc-500 text-[10px] font-black tracking-[0.4em] uppercase mt-4">{t.stratMsgSubtitle}</p>
           </div>
           <button onClick={onBack} className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-lg">{t.backToHome}</button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
           <div className="xl:col-span-4 space-y-8">
              <div className="glass p-10 rounded-[3rem] border border-white/5 bg-white/[0.01] space-y-8 shadow-2xl">
                 <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.formalLevel}</label>
                           <span className="text-sm font-black text-white italic">{settings.formalLevel}</span>
                        </div>
                        <input type="range" min="1" max="10" value={settings.formalLevel} onChange={e => setSettings({...settings, formalLevel: parseInt(e.target.value)})} className="w-full accent-indigo-500 h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">{t.emotionalStyle}</label>
                        <select value={settings.emotion} onChange={e => setSettings({...settings, emotion: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none appearance-none font-bold text-sm">
                           <option value="professional">Professional</option>
                           <option value="warm">Warm & Friendly</option>
                           <option value="sharp">Sharp & Direct</option>
                           <option value="neutral">Neutral</option>
                        </select>
                    </div>
                 </div>
              </div>
           </div>

           <div className="xl:col-span-8 space-y-12">
              <div className="glass p-12 rounded-[4rem] border border-white/10 bg-white/[0.01] shadow-3xl">
                 <textarea 
                   value={context}
                   onChange={e => setContext(e.target.value)}
                   placeholder={t.situationPlaceholder}
                   className="w-full bg-transparent text-3xl md:text-5xl font-black text-white italic outline-none resize-none min-h-[250px] placeholder-zinc-900 leading-tight tracking-tighter"
                 />
                 <div className="flex gap-6 mt-10">
                    <button 
                      onClick={handleGenerate}
                      disabled={loading || !context}
                      className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-3xl shadow-xl transition-all active:scale-95 italic"
                    >
                      {loading ? t.analyzePsych : t.genVariants}
                    </button>
                 </div>
              </div>

              {results.length > 0 && (
                <div className="space-y-10 animate-in">
                   {results.map((res, i) => (
                     <div key={i} className="glass rounded-[4rem] border border-white/5 bg-[#0a0a14] overflow-hidden group hover:border-indigo-500/30 transition-all duration-500 shadow-3xl">
                        <div className="flex flex-col lg:flex-row h-full">
                           <div className={`lg:w-1/3 p-10 bg-white/[0.02] ${isRTL ? 'border-l' : 'border-r'} border-white/5 space-y-8`}>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.successChance}</span>
                                    <span className="text-4xl font-black text-white italic">{res.successProbability}%</span>
                                 </div>
                                 <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: `${res.successProbability}%` }}></div>
                                 </div>
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">{t.predictedSent}</span>
                                 <span className="text-xs font-bold text-white italic">"{res.predictedSentiment}"</span>
                              </div>
                              <p className={`text-[11px] text-zinc-400 font-bold leading-relaxed italic ${isRTL ? 'pr-2' : 'pl-2'}`}>"{res.reasoning}"</p>
                           </div>
                           <div className="lg:w-2/3 p-12 flex flex-col justify-between">
                              <div className="text-xl md:text-2xl font-medium leading-relaxed text-zinc-100 whitespace-pre-wrap italic">
                                {res.content}
                              </div>
                              <button onClick={() => navigator.clipboard.writeText(res.content)} className="mt-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">{t.copyMsg}</button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default MessageMaster;
