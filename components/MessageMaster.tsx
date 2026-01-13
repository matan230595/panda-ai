
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
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StrategicMessageResult[]>([]);
  const [settings, setSettings] = useState<MessageSettings>({
    intensity: 5,
    formalLevel: 7,
    emotion: 'professional',
    strategicGoal: 'negotiate',
    format: 'WhatsApp',
    length: 'medium',
    audience: ''
  });

  const t = translations[appSettings.language] || translations.he;

  const handleGenerate = async () => {
    if (!context) return;
    setLoading(true);
    try {
      const msgs = await generateMasterMessages(context, { ...settings, audience }, appSettings);
      setResults(msgs);
    } catch (e) {
      console.error(e);
      alert("שגיאה ביצירת ההודעות. נסה שנית.");
    } finally {
      setLoading(false);
    }
  };

  const emotions = [
    { id: 'professional', label: 'מקצועי', icon: '💼' },
    { id: 'warm', label: 'חם וחברותי', icon: '❤️' },
    { id: 'sharp', label: 'חד וישיר', icon: '⚡' },
    { id: 'neutral', label: 'ניטרלי', icon: '⚖️' }
  ];

  return (
    <div className={`flex-1 overflow-y-auto p-8 md:p-20 bg-[#020205] scrollbar-hide text-right`} dir="rtl">
      <div className="max-w-7xl mx-auto space-y-16 pb-32">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-white/5 pb-12 gap-8">
           <div className="flex items-center gap-6">
              <button onClick={onBack} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-orange-600 transition-all font-bold text-xs shadow-lg">← חזור</button>
              <div className="text-right">
                <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none glow-text">מחולל ההודעות</h2>
                <p className="text-zinc-500 text-[10px] font-black tracking-[0.4em] uppercase mt-4">אסטרטגיית מסרים מבוססת פסיכולוגיה וסנטימנט</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 text-right">
           <div className="xl:col-span-4 space-y-8">
              <div className="glass p-10 rounded-[3rem] border border-white/5 bg-white/[0.01] space-y-10 shadow-2xl sticky top-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2">קהל יעד</label>
                       <input 
                         value={audience}
                         onChange={e => setAudience(e.target.value)}
                         placeholder="למשל: לקוח חדש, שותף עסקי, בוס..."
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-orange-500/50 transition-all font-bold placeholder-zinc-600"
                       />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">רמת רשמיות (1-10)</label>
                           <span className="text-lg font-black text-white italic">{settings.formalLevel}</span>
                        </div>
                        <input 
                           type="range" min="1" max="10" value={settings.formalLevel} 
                           onChange={e => setSettings({...settings, formalLevel: parseInt(e.target.value)})} 
                           className="w-full accent-orange-600 h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer" 
                        />
                        <div className="flex justify-between text-[8px] font-black text-zinc-500 uppercase tracking-widest px-1">
                           <span>חופשי</span>
                           <span>רשמי מאוד</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2 block">אורך ההודעה</label>
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                           {(['short', 'medium', 'long'] as const).map(l => (
                             <button 
                               key={l}
                               onClick={() => setSettings({...settings, length: l})}
                               className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${settings.length === l ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                             >
                               {l === 'short' ? 'קצר' : l === 'medium' ? 'מאוזן' : 'מפורט'}
                             </button>
                           ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2 block">סגנון רגשי</label>
                        <div className="grid grid-cols-2 gap-2">
                           {emotions.map(emo => (
                             <button 
                               key={emo.id}
                               onClick={() => setSettings({...settings, emotion: emo.id as any})}
                               className={`p-4 rounded-2xl border text-[11px] font-black transition-all flex flex-col items-center gap-2 ${settings.emotion === emo.id ? 'bg-orange-600 border-orange-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-zinc-400 hover:text-white'}`}
                             >
                                <span className="text-xl">{emo.icon}</span>
                                <span>{emo.label}</span>
                             </button>
                           ))}
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2 block">פורמט הודעה</label>
                        <select value={settings.format} onChange={e => setSettings({...settings, format: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none appearance-none font-bold text-sm text-right">
                           <option value="WhatsApp" className="bg-black text-white">WhatsApp / סלולר</option>
                           <option value="Email" className="bg-black text-white">מייל עסקי</option>
                           <option value="LinkedIn" className="bg-black text-white">פוסט / הודעת LinkedIn</option>
                           <option value="Formal Letter" className="bg-black text-white">מכתב רשמי</option>
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
                   placeholder="תאר את הסיטואציה: עם מי אתה מדבר? מה המטרה שלך? (למשל: סגירת חוזה עם לקוח חדש שמתלבט לגבי המחיר)"
                   className="w-full bg-transparent text-2xl md:text-4xl font-black text-white italic outline-none resize-none min-h-[300px] placeholder-zinc-700 leading-tight tracking-tighter text-right"
                 />
                 <div className="flex gap-6 mt-10">
                    <button 
                      onClick={handleGenerate}
                      disabled={loading || !context}
                      className="flex-1 py-8 bg-orange-600 hover:bg-orange-500 text-white font-black text-2xl rounded-3xl shadow-2xl transition-all active:scale-95 italic flex items-center justify-center gap-4"
                    >
                      {loading ? <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>צור וריאציות אסטרטגיות ✨</span>}
                    </button>
                 </div>
              </div>

              {results.length > 0 && (
                <div className="space-y-10 animate-in fade-in duration-1000">
                   {results.map((res, i) => (
                     <div key={i} className="glass rounded-[4rem] border border-white/5 bg-[#0a0a14] overflow-hidden group hover:border-orange-500/30 transition-all duration-500 shadow-3xl">
                        <div className="flex flex-col lg:flex-row h-full">
                           <div className={`lg:w-1/3 p-10 bg-white/[0.02] border-l border-white/5 space-y-8`}>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">סיכויי הצלחה</span>
                                    <span className="text-4xl font-black text-white italic">{res.successProbability}%</span>
                                 </div>
                                 <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: `${res.successProbability}%` }}></div>
                                 </div>
                              </div>
                              
                              <div className="space-y-4">
                                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">סנטימנט:</span>
                                    <span className="text-xs font-bold text-white italic">"{res.predictedSentiment}"</span>
                                 </div>
                                 <div className="p-4 bg-orange-600/5 rounded-2xl border border-orange-500/10">
                                    <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest block mb-1">תגובה צפויה:</span>
                                    <p className="text-[11px] text-zinc-300 font-medium italic leading-relaxed">{res.predictedResponse}</p>
                                 </div>
                              </div>

                              <div className="space-y-2">
                                 <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block pr-1">לוגיקה אסטרטגית:</span>
                                 <p className="text-[11px] text-zinc-400 font-bold leading-relaxed italic text-right">"{res.reasoning}"</p>
                              </div>
                           </div>
                           <div className="lg:w-2/3 p-12 flex flex-col justify-between bg-gradient-to-br from-transparent to-white/[0.01] text-right">
                              <div className="text-xl md:text-2xl font-medium leading-relaxed text-white whitespace-pre-wrap italic">
                                {res.content}
                              </div>
                              <div className="mt-10 flex gap-4">
                                 <button onClick={() => {
                                   navigator.clipboard.writeText(res.content);
                                   alert('ההודעה הועתקה!');
                                 }} className="flex-1 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-zinc-200">העתק הודעה</button>
                                 <button className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xl">✨</button>
                              </div>
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
