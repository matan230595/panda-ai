
import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { APIConfig, AppSettings, ViewMode } from '../types';
import { translations } from '../utils/translations';
import { useApi, useUI, useAppSettings } from '../contexts/AppContext';

const ApiHub: React.FC = () => {
  const { apiConfigs, addApi, removeApi } = useApi();
  const { setView, showToast } = useUI();
  const { appSettings } = useAppSettings();

  const [isAdding, setIsAdding] = useState(false);
  const [guideModal, setGuideModal] = useState<any>(null);
  const [newApi, setNewApi] = useState<Partial<APIConfig>>({ provider: 'google', name: '', apiKey: '' });

  const t = translations.he;
  const isRTL = true;

  const providers = [
    { id: 'google', name: 'Google Gemini', icon: '🐼', desc: t.googleDesc, steps: t.googleSteps },
    { id: 'groq', name: 'Groq (מהיר)', icon: '⚡', desc: t.groqDesc, steps: t.groqSteps },
    { id: 'mistral', name: 'Mistral AI', icon: '🌪️', desc: t.mistralDesc, steps: t.mistralSteps },
    { id: 'poe', name: 'Poe AI', icon: '🅿️', desc: t.poeDesc, steps: t.poeSteps },
    { id: 'huggingface', name: 'Hugging Face', icon: '🤗', desc: t.huggingfaceDesc, steps: t.huggingfaceSteps },
    { id: 'openai', name: 'OpenAI GPT', icon: '🧠', desc: t.openaiDesc, steps: t.openaiSteps },
    { id: 'anthropic', name: 'Anthropic Claude', icon: '🎭', desc: t.anthropicDesc, steps: t.anthropicSteps },
  ];

  const handleSave = () => {
    const trimmedApiKey = (newApi.apiKey || '').trim();
    if (newApi.name && trimmedApiKey) {
      addApi({ ...newApi, apiKey: trimmedApiKey, id: `api-${Date.now()}`, status: 'active' } as APIConfig);
      setIsAdding(false);
      setNewApi({ provider: 'google', name: '', apiKey: '' });
      showToast('החיבור נוסף בהצלחה!', 'success');
    } else {
        showToast('נא למלא את כל השדות', 'info');
    }
  };
  
  const maskApiKey = (key: string) => {
      if (!key) return '';
      return `...${key.slice(-4)}`;
  }

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-12 lg:p-16 bg-[#050508] text-right`} dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/10 pb-10">
            <div className="flex items-center gap-4">
                <button onClick={() => setView(ViewMode.DASHBOARD)} className="px-4 md:px-5 py-2 md:py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-orange-600 transition-all font-bold text-xs">{t.back}</button>
                <div className={`text-right`}>
                    <h2 className="text-2xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none glow-text">{t.apiHubTitle}</h2>
                    <p className="text-zinc-500 text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase mt-2 md:mt-4">{t.apiHubSubtitle}</p>
                </div>
            </div>
           <button onClick={() => setIsAdding(true)} className="w-full md:w-auto px-6 md:px-10 py-3 md:py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all uppercase tracking-widest">{t.addConnection}</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {providers.map(p => (
             <div key={p.id} className="glass p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/5 space-y-4 hover:border-orange-500/30 transition-all group flex flex-col">
                <div className="flex items-center justify-between">
                   <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{p.icon}</div>
                   <button onClick={() => setGuideModal(p)} className="text-[10px] font-black text-orange-400 border-b border-orange-400/30 pb-0.5 hover:text-orange-200">{t.getKey}</button>
                </div>
                <h4 className="text-lg font-black text-white">{p.name}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium flex-1">{p.desc}</p>
             </div>
           ))}
        </div>

        <div className="pt-16 space-y-8">
           <div className="flex items-center gap-4 px-2">
              <div className="w-1.5 h-10 bg-orange-600 rounded-full"></div>
              <h3 className="text-xl font-black text-white uppercase italic">{t.activeConnections}</h3>
           </div>
           {apiConfigs.length === 0 ? (
            <div className="col-span-full py-20 glass rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center opacity-30">
               <div className="text-6xl mb-6">🔌</div>
               <p className="text-sm font-black text-white uppercase tracking-widest italic">{t.noConnections}</p>
            </div>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiConfigs.map(api => (
                <div key={api.id} className="glass p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/5 hover:border-orange-500/30 transition-all bg-white/[0.01] relative group overflow-hidden">
                   <button onClick={() => removeApi(api.id)} className="absolute top-6 left-6 text-zinc-700 hover:text-red-500 transition-colors">✕</button>
                   <div className="text-4xl mb-6">{providers.find(p => p.id === api.provider)?.icon || '⚡'}</div>
                   <div className="space-y-1">
                      <h4 className="text-xl font-black text-white truncate">{api.name}</h4>
                      <p className="text-xs font-mono text-zinc-600 font-bold">{maskApiKey(api.apiKey)}</p>
                   </div>
                   <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${api.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
                         <span className="text-[10px] font-black text-zinc-500 uppercase">{t.statusActive}</span>
                      </div>
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">{api.provider}</span>
                   </div>
                </div>
              ))}
            </div>
           )}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="max-w-xl w-full bg-[#0a0a14] p-6 md:p-10 rounded-3xl md:rounded-[4rem] border border-orange-500/30 space-y-6 md:space-y-8 animate-in zoom-in-95 shadow-[0_0_100px_rgba(249,115,22,0.2)] max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{t.newConnectionTitle}</h3>
                 <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white transition-all text-2xl">✕</button>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase mb-3 block px-1">{t.selectProvider}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                       {providers.map(p => (
                         <button key={p.id} onClick={() => setNewApi({...newApi, provider: p.id as any})} className={`p-4 rounded-2xl border text-[11px] font-black transition-all flex items-center gap-2 justify-center ${newApi.provider === p.id ? 'bg-orange-600 border-orange-400 text-white shadow-lg' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}>
                            <span>{p.icon}</span> <span>{p.name.split(' ')[0]}</span>
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="space-y-4">
                    <InputField label={t.connectionName} value={newApi.name} onChange={v => setNewApi({...newApi, name: v})} placeholder="למשל: המפתח הראשי שלי" />
                    <InputField type="password" label={t.apiKeyLabel} value={newApi.apiKey} onChange={v => setNewApi({...newApi, apiKey: v})} placeholder="sk-..." />
                 </div>
                 <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-center text-xs text-red-300">
                    <b>אזהרת אבטחה:</b> מפתחות API נשמרים בדפדפן. אין להשתמש במפתחות ייצור קריטיים.
                 </div>
                 <div className="pt-4 flex gap-4">
                    <button onClick={handleSave} className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">{t.connectNow}</button>
                    <button onClick={() => setIsAdding(false)} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs">{t.cancel}</button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      {guideModal && (
         <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in" onClick={() => setGuideModal(null)}>
            <div className="max-w-2xl w-full bg-[#121218] p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-orange-500/20 shadow-2xl space-y-6 md:space-y-8 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="text-4xl">{guideModal.icon}</div>
                     <h3 className="text-2xl font-black text-white italic">{guideModal.name} - {t.guideTitle}</h3>
                  </div>
                  <button onClick={() => setGuideModal(null)} className="text-zinc-500 hover:text-white transition-all text-2xl">✕</button>
               </div>
               <div className="space-y-6 text-zinc-300 text-sm font-medium leading-relaxed max-h-[60vh] overflow-y-auto custom-scrollbar pr-4 border-r-2 border-orange-500/20">
                  {guideModal.steps.map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-4">
                       <div className="w-6 h-6 bg-orange-600/20 text-orange-400 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-1">{i+1}</div>
                       <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(step) }}></div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = 'text' }: { label: string, value: any, onChange: (v: string) => void, placeholder?: string, type?: string }) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black text-zinc-500 uppercase px-1">{label}</label>
     <input value={value} onChange={e => onChange(e.target.value)} type={type}
       className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-orange-500/50 text-sm font-bold"
       placeholder={placeholder}
     />
  </div>
);

export default ApiHub;