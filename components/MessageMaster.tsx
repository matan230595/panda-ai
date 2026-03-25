
import React, { useState } from 'react';
import { generateMasterMessages } from '../services/gemini';
import { MessageSettings, StrategicMessageResult, ViewMode } from '../types';
import { translations } from '../utils/translations';
import { useUI, useAppSettings, useApi } from '../contexts/AppContext';

const MessageMaster: React.FC = () => {
  const { setView, showToast } = useUI();
  const { appSettings } = useAppSettings();
  const { apiConfigs } = useApi();

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

  const lang = appSettings?.language === 'he' ? 'he' : 'he'; // Currently only 'he' is supported in translations.he
  const t = translations[lang];

  const handleGenerate = async () => {
    if (!context || !audience) {
      showToast('אנא מלא את כל שדות החובה.', 'info');
      return;
    }
    setLoading(true);
    try {
      const msgs = await generateMasterMessages(context, { ...settings, audience }, appSettings, apiConfigs);
      setResults(msgs);
    } catch (e) {
      console.error(e);
      showToast("שגיאה ביצירת ההודעות. נסה שנית.", 'info');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      showToast('ההודעה הועתקה!', 'success');
  }

  const emotions = [
    { id: 'professional', label: 'מקצועי', icon: '💼' },
    { id: 'warm', label: 'חם וחברותי', icon: '❤️' },
    { id: 'sharp', label: 'חד וישיר', icon: '⚡' },
    { id: 'neutral', label: 'ניטרלי', icon: '⚖️' }
  ];

  const goals = [
    { id: 'negotiate', label: 'משא ומתן' }, { id: 'inform', label: 'עדכון' },
    { id: 'persuade', label: 'שכנוע' }, { id: 'request', label: 'בקשה' },
    { id: 'reject', label: 'דחייה' }
  ];

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-12 bg-[#020205] scrollbar-hide text-right`} dir="rtl">
      <div className="max-w-7xl mx-auto space-y-12 pb-32">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/5 pb-8 gap-4">
           <div className="flex items-center gap-4 md:gap-6">
              <button onClick={() => setView(ViewMode.DASHBOARD)} className="px-4 md:px-5 py-2 md:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-orange-600 transition-all font-bold text-xs">{t.back}</button>
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">מחולל ההודעות <span className="text-orange-600">PRO</span></h2>
                <p className="text-zinc-500 text-[10px] font-black tracking-[0.2em] uppercase mt-1">אסטרטגיה • פסיכולוגיה • המרה</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="glass p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] border border-white/10 space-y-6 md:space-y-8 bg-white/[0.01] shadow-2xl">
              <textarea value={context} onChange={e => setContext(e.target.value)} placeholder="מה ההקשר? תאר את הסיטואציה..." className="w-full bg-transparent text-xl font-bold text-white outline-none h-40 resize-none placeholder-zinc-700 leading-relaxed"></textarea>
              <textarea value={audience} onChange={e => setAudience(e.target.value)} placeholder="למי ההודעה מיועדת? תאר את קהל היעד..." className="w-full bg-transparent text-sm font-medium text-zinc-300 outline-none h-24 resize-none placeholder-zinc-700"></textarea>
              <div className="pt-8 border-t border-white/5 space-y-6">
                 {/* ... settings sliders and buttons ... */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">עוצמת מסר</label>
                        <input type="range" min="1" max="10" value={settings.intensity} onChange={e => setSettings({...settings, intensity: +e.target.value})} className="w-full" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase">רמת רשמיות</label>
                        <input type="range" min="1" max="10" value={settings.formalLevel} onChange={e => setSettings({...settings, formalLevel: +e.target.value})} className="w-full" />
                     </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase">טון רגשי</label>
                    <div className="flex gap-2 flex-wrap">
                      {emotions.map(e => <button key={e.id} onClick={() => setSettings({...settings, emotion: e.id as any})} className={`px-4 py-2 text-xs rounded-xl border ${settings.emotion === e.id ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white/5 border-transparent text-zinc-400'}`}>{e.icon} {e.label}</button>)}
                    </div>
                 </div>
              </div>
          </div>
          <div className="space-y-6 md:space-y-10">
              <button onClick={handleGenerate} disabled={loading} className="w-full py-6 md:py-8 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl md:text-2xl rounded-3xl md:rounded-[3rem] shadow-xl transition-all">
                {loading ? 'מייצר אסטרטגיות...' : 'צור 3 גרסאות אסטרטגיות 🧠'}
              </button>
              <div className="space-y-6">
                {results.map((r, i) => (
                    <div key={i} className="glass p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/5 space-y-6 animate-in fade-in">
                       <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-4">
                           <p className="text-base text-zinc-100 leading-relaxed font-medium whitespace-pre-wrap">{r.content}</p>
                           <button onClick={() => handleCopy(r.content)} className="px-4 py-1 bg-white/10 rounded-lg text-xs text-white">העתק</button>
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-center">
                           <div className="bg-white/5 p-4 rounded-xl"><div className="text-xs text-zinc-500">סיכוי הצלחה</div><div className="text-lg font-bold text-white">{r.successProbability}%</div></div>
                           <div className="bg-white/5 p-4 rounded-xl"><div className="text-xs text-zinc-500">תגובה צפויה</div><div className="text-sm font-bold text-white truncate">{r.predictedResponse}</div></div>
                       </div>
                       <p className="text-xs text-zinc-400 border-r-2 border-orange-500/50 pr-4">{r.reasoning}</p>
                    </div>
                ))}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageMaster;