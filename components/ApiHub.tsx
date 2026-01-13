
import React, { useState } from 'react';
import { APIConfig, AppSettings } from '../types';
import { translations } from '../utils/translations';

interface ApiHubProps {
  apis: APIConfig[];
  onAdd: (api: APIConfig) => void;
  onRemove: (id: string) => void;
  appSettings: AppSettings;
}

const ApiHub: React.FC<ApiHubProps> = ({ apis, onAdd, onRemove, appSettings }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newApi, setNewApi] = useState<Partial<APIConfig>>({
    name: '', baseUrl: '', apiKey: '', authHeader: 'Authorization', description: '', provider: 'google', status: 'testing'
  });

  const t = translations.he; // Force Hebrew
  const isRTL = true;

  const providers = [
    { 
      id: 'google', 
      name: 'Google Gemini', 
      icon: '🐼', 
      guide: t.googleDesc,
      link: 'https://aistudio.google.com/app/apikey'
    },
    { 
      id: 'openai', 
      name: 'OpenAI GPT', 
      icon: '🧠', 
      guide: t.openaiDesc,
      link: 'https://platform.openai.com/api-keys'
    },
    { 
      id: 'anthropic', 
      name: 'Anthropic Claude', 
      icon: '🎭', 
      guide: t.anthropicDesc,
      link: 'https://console.anthropic.com/'
    },
    { 
      id: 'groq', 
      name: 'Groq (מהיר במיוחד)', 
      icon: '⚡', 
      guide: t.groqDesc,
      link: 'https://console.groq.com/keys'
    },
    { 
      id: 'mistral', 
      name: 'Mistral AI', 
      icon: '🌪️', 
      guide: t.mistralDesc,
      link: 'https://console.mistral.ai/'
    }
  ];

  const handleSave = () => {
    if (newApi.name && newApi.apiKey) {
      onAdd({ 
        ...newApi as APIConfig, 
        id: `api-${Date.now()}`, 
        status: 'active', 
        latency: Math.floor(Math.random() * 150) + 50 
      });
      setIsAdding(false);
      setNewApi({ name: '', baseUrl: '', apiKey: '', authHeader: 'Authorization', description: '', provider: 'google' });
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-12 lg:p-16 view-transition scrollbar-hide bg-[#050508] text-right`} dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/10 pb-10">
           <div className={`w-full md:w-auto text-right`}>
              <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none glow-text">{t.apiHubTitle}</h2>
              <p className="text-zinc-500 text-[10px] font-black tracking-[0.4em] uppercase mt-4">{t.apiHubSubtitle}</p>
           </div>
           <button 
             onClick={() => setIsAdding(true)} 
             className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all uppercase tracking-widest"
           >
             {t.addConnection}
           </button>
        </div>

        {/* Guides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {providers.map(p => (
             <div key={p.id} className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-indigo-500/30 transition-all group">
                <div className="flex items-center justify-between">
                   <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">{p.icon}</div>
                   <a href={p.link} target="_blank" rel="noreferrer" className="text-[10px] font-black text-indigo-400 border-b border-indigo-400/30 pb-0.5">{t.getKey}</a>
                </div>
                <h4 className="text-lg font-black text-white">{p.name}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">{p.guide}</p>
             </div>
           ))}
        </div>

        {/* Connections List */}
        <div className="pt-16 space-y-8">
           <div className="flex items-center gap-4 px-2">
              <div className="w-1.5 h-10 bg-indigo-600 rounded-full"></div>
              <h3 className="text-xl font-black text-white uppercase italic">{t.activeConnections}</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apis.length === 0 ? (
                <div className="col-span-full py-20 glass rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center opacity-30">
                   <div className="text-6xl mb-6">🔌</div>
                   <p className="text-sm font-black text-white uppercase tracking-widest italic">{t.noConnections}</p>
                </div>
              ) : (
                apis.map(api => (
                  <div key={api.id} className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all bg-white/[0.01] relative group overflow-hidden">
                     <button onClick={() => onRemove(api.id)} className="absolute top-6 left-6 text-zinc-700 hover:text-red-500 transition-colors">✕</button>
                     <div className="text-4xl mb-6">{providers.find(p => p.id === api.provider)?.icon || '⚡'}</div>
                     <div className="space-y-1">
                        <h4 className="text-xl font-black text-white truncate">{api.name}</h4>
                        <p className="text-zinc-600 text-[10px] font-mono truncate tracking-tight">{api.baseUrl || 'Standard Gateway'}</p>
                     </div>
                     <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${api.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
                           <span className="text-[10px] font-black text-zinc-500 uppercase">{api.status === 'active' ? `${api.latency}ms • ${t.statusActive}` : t.statusWaiting}</span>
                        </div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{api.provider}</span>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="max-w-xl w-full bg-[#0a0a14] p-10 rounded-[4rem] border border-indigo-500/30 space-y-8 animate-in zoom-in-95 shadow-[0_0_100px_rgba(79,70,229,0.2)]">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{t.newConnectionTitle}</h3>
                 <button onClick={() => setIsAdding(false)} className="text-zinc-500 hover:text-white transition-all text-2xl">✕</button>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase mb-3 block px-1">{t.selectProvider}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                       {providers.map(p => (
                         <button 
                           key={p.id} 
                           onClick={() => setNewApi({...newApi, provider: p.id as any})}
                           className={`p-4 rounded-2xl border text-[11px] font-black transition-all flex items-center gap-2 justify-center ${newApi.provider === p.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}
                         >
                            <span>{p.icon}</span>
                            <span>{p.name.split(' ')[0]}</span>
                         </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase px-1">{t.connectionName}</label>
                       <input 
                         value={newApi.name} onChange={e => setNewApi({...newApi, name: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-indigo-500/50 text-sm font-bold"
                         placeholder="למשל: המפתח הראשי שלי"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-zinc-500 uppercase px-1">{t.apiKeyLabel}</label>
                       <input 
                         value={newApi.apiKey} onChange={e => setNewApi({...newApi, apiKey: e.target.value})}
                         type="password"
                         className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-indigo-500/50 text-sm font-bold"
                         placeholder="sk-..."
                       />
                    </div>
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button onClick={handleSave} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs">
                       {t.connectNow}
                    </button>
                    <button onClick={() => setIsAdding(false)} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs">
                       {t.cancel}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ApiHub;
