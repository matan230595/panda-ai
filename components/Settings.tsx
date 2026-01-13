
import React, { useState } from 'react';
import { AppSettings, UserRole } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onBack: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onRecover: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'voice' | 'interface' | 'legal'>('system');

  const updateField = (key: keyof AppSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const updateLegalContent = (key: keyof typeof settings.legalContent, value: string) => {
    onUpdate({
      ...settings,
      legalContent: {
        ...settings.legalContent,
        [key]: value
      }
    });
  };

  const isRTL = settings.language === 'he';

  return (
    <div className={`flex-1 overflow-y-auto bg-[#050508] p-6 lg:p-12 custom-scrollbar ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all">
               {isRTL ? '←' : '→'}
            </button>
            <h2 className="text-2xl font-black text-white italic">
               {isRTL ? 'הגדרות מערכת' : 'System Settings'}
            </h2>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit overflow-x-auto max-w-full">
          {[
            { id: 'system', label: isRTL ? 'מערכת וזיכרון' : 'System & Memory' },
            { id: 'voice', label: isRTL ? 'קול ודיבור' : 'Voice & Speech' },
            { id: 'interface', label: isRTL ? 'ממשק ושפה' : 'Interface & Language' },
            { id: 'legal', label: isRTL ? 'משפטי ותוכן' : 'Legal & Content' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-8">
               
               {/* Core Memory / Bio Section */}
               <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 bg-indigo-600/5">
                  <div className="flex items-start gap-4">
                     <div className="text-3xl">🧠</div>
                     <div className="space-y-1">
                        <h3 className="text-lg font-black text-white uppercase italic">
                           {isRTL ? 'זיכרון ליבה (System Bio)' : 'Core Memory (System Bio)'}
                        </h3>
                        <p className="text-xs text-zinc-400">
                           {isRTL ? 'המידע שתכתוב כאן יוזרק לכל שיחה. המודל ידע מי אתה, מה העסק שלך ומה המטרות שלך באופן אוטומטי.' : 'Information here is injected into every chat. The model will know who you are and your goals automatically.'}
                        </p>
                     </div>
                  </div>
                  <textarea 
                    value={settings.userBio || ''}
                    onChange={e => updateField('userBio', e.target.value)}
                    placeholder={isRTL ? "למשל: אני מפתח Fullstack שמתמחה ב-React. אני בונה סטארטאפ בתחום הרפואה. הסגנון שלי הוא תמציתי וטכני." : "E.g., I am a Fullstack developer specialized in React..."}
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-indigo-500/50 outline-none resize-none font-medium"
                  />
               </div>

               <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                  <h3 className="text-lg font-black text-white uppercase italic">
                     {isRTL ? 'תצורת מנוע AI' : 'AI Engine Config'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div>
                          <div className="text-sm font-bold text-white">Google Search Grounding</div>
                          <div className="text-[10px] text-zinc-500">{isRTL ? 'אפשר למודל לגשת למידע עדכני בזמן אמת' : 'Allow model to access real-time web info'}</div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.enableSearch} onChange={e => updateField('enableSearch', e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                       </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div>
                          <div className="text-sm font-bold text-white">Code Execution (Python)</div>
                          <div className="text-[10px] text-zinc-500">{isRTL ? 'מאפשר למודל לבצע חישובים וניתוח נתונים' : 'Allows model to run code and analyze data'}</div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.codeExecutionEnabled} onChange={e => updateField('codeExecutionEnabled', e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                       </label>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* Voice Settings */}
          {activeTab === 'voice' && (
             <div className="glass p-8 rounded-3xl border border-white/5 space-y-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                      {isRTL ? 'קול המודל' : 'Voice Persona'}
                   </label>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Zephyr', 'Puck', 'Charon', 'Fenrir'].map(voice => (
                        <button 
                          key={voice}
                          onClick={() => updateField('voiceName', voice)}
                          className={`p-3 rounded-xl border text-[11px] font-bold transition-all ${settings.voiceName === voice ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-transparent text-zinc-500 hover:text-white'}`}
                        >
                          {voice}
                        </button>
                      ))}
                   </div>
                </div>
                
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                      {isRTL ? 'רגישות התפרצות (Barge-in)' : 'Barge-in Sensitivity'}
                   </label>
                   <input 
                     type="range" min="0" max="1" step="0.1" 
                     value={settings.bargeInSensitivity} 
                     onChange={e => updateField('bargeInSensitivity', parseFloat(e.target.value))}
                     className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                   />
                </div>
             </div>
          )}

          {/* Interface & Language Settings */}
          {activeTab === 'interface' && (
             <div className="glass p-8 rounded-3xl border border-white/5 space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                      {isRTL ? 'שפת ממשק' : 'Interface Language'}
                   </label>
                   <div className="grid grid-cols-3 gap-4">
                      <button 
                         onClick={() => updateField('language', 'he')}
                         className={`p-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-2 ${settings.language === 'he' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400'}`}
                      >
                         <span className="text-2xl">🇮🇱</span>
                         <span>עברית</span>
                      </button>
                      <button 
                         onClick={() => updateField('language', 'en')}
                         className={`p-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-2 ${settings.language === 'en' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400'}`}
                      >
                         <span className="text-2xl">🇺🇸</span>
                         <span>English</span>
                      </button>
                      <button 
                         onClick={() => updateField('language', 'es')}
                         className={`p-4 rounded-xl border text-sm font-bold transition-all flex flex-col items-center gap-2 ${settings.language === 'es' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400'}`}
                      >
                         <span className="text-2xl">🇪🇸</span>
                         <span>Español</span>
                      </button>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                      {isRTL ? 'עוצמה ויזואלית' : 'UI Intensity'}
                   </label>
                   <input 
                     type="range" min="0" max="100" 
                     value={settings.uiIntensity} 
                     onChange={e => updateField('uiIntensity', parseInt(e.target.value))}
                     className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                   />
                </div>
             </div>
          )}

          {/* Legal Document Editing - NEW */}
          {activeTab === 'legal' && (
             <div className="space-y-8">
                <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-sm text-indigo-200">
                   ℹ️ {isRTL ? 'כאן תוכל לערוך את הטקסטים המופיעים במודאלים של הצהרת הנגישות, פרטיות ותנאי השימוש. השינויים נשמרים מקומית.' : 'Here you can edit the text for Terms, Privacy, and Accessibility modals. Changes are saved locally.'}
                </div>

                <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                   <h3 className="text-lg font-black text-white uppercase italic">{isRTL ? 'תנאי שימוש (Terms)' : 'Terms of Use'}</h3>
                   <textarea 
                     value={settings.legalContent.terms}
                     onChange={e => updateLegalContent('terms', e.target.value)}
                     className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-xs font-mono focus:border-orange-500/50 outline-none resize-none leading-relaxed"
                   />
                </div>

                <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                   <h3 className="text-lg font-black text-white uppercase italic">{isRTL ? 'מדיניות פרטיות (Privacy)' : 'Privacy Policy'}</h3>
                   <textarea 
                     value={settings.legalContent.privacy}
                     onChange={e => updateLegalContent('privacy', e.target.value)}
                     className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-xs font-mono focus:border-orange-500/50 outline-none resize-none leading-relaxed"
                   />
                </div>

                <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                   <h3 className="text-lg font-black text-white uppercase italic">{isRTL ? 'הצהרת נגישות (Accessibility)' : 'Accessibility Statement'}</h3>
                   <textarea 
                     value={settings.legalContent.accessibility}
                     onChange={e => updateLegalContent('accessibility', e.target.value)}
                     className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-xs font-mono focus:border-orange-500/50 outline-none resize-none leading-relaxed"
                   />
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
