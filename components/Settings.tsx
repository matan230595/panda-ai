
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

  const handleReset = () => {
    if (confirm('האם אתה בתוך שברצונך לאפס את המערכת? כל השיחות וההגדרות יימחקו.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#050508] p-6 lg:p-12 custom-scrollbar text-right" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-10 pb-20">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-3 bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all">
               →
            </button>
            <h2 className="text-2xl font-black text-white italic">
               הגדרות מערכת
            </h2>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit overflow-x-auto max-w-full">
          {[
            { id: 'system', label: 'מערכת וזיכרון' },
            { id: 'voice', label: 'קול ודיבור' },
            { id: 'interface', label: 'ממשק ותצוגה' },
            { id: 'legal', label: 'פרטיות ואיפוס' }
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
                           זיכרון ליבה (System Bio)
                        </h3>
                        <p className="text-xs text-zinc-400">
                           המידע שתכתוב כאן יוזרק לכל שיחה. המודל ידע מי אתה, מה העסק שלך ומה המטרות שלך באופן אוטומטי.
                        </p>
                     </div>
                  </div>
                  <textarea 
                    value={settings.userBio || ''}
                    onChange={e => updateField('userBio', e.target.value)}
                    placeholder="למשל: אני מפתח Fullstack שמתמחה ב-React. אני בונה סטארטאפ בתחום הרפואה. הסגנון שלי הוא תמציתי וטכני."
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-indigo-500/50 outline-none resize-none font-medium"
                  />
               </div>

               <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                  <h3 className="text-lg font-black text-white uppercase italic">
                     תצורת מנוע AI
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div>
                          <div className="text-sm font-bold text-white">חיפוש מידע ברשת (Grounding)</div>
                          <div className="text-[10px] text-zinc-500">אפשר למודל לגשת למידע עדכני בזמן אמת</div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.enableSearch} onChange={e => updateField('enableSearch', e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                       </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div>
                          <div className="text-sm font-bold text-white">שיקוף עצמי (Self-Reflection)</div>
                          <div className="text-[10px] text-zinc-500">המודל יבקר את התשובות של עצמו לפני השליחה (איטי יותר אך מדויק)</div>
                       </div>
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={settings.selfReflect} onChange={e => updateField('selfReflect', e.target.checked)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                       </label>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* Voice Settings */}
          {activeTab === 'voice' && (
             <div className="glass p-8 rounded-3xl border border-white/5 space-y-8">
                <div className="flex items-start gap-4">
                   <div className="text-3xl">🎙️</div>
                   <div>
                      <h3 className="text-lg font-black text-white uppercase italic">הגדרות קול</h3>
                      <p className="text-xs text-zinc-400">התאמה אישית של ממשק הדיבור בזמן אמת</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase px-1">קול הדובר (Voice)</label>
                      <div className="grid grid-cols-2 gap-2">
                         {['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'].map(voice => (
                           <button 
                             key={voice}
                             onClick={() => updateField('voiceName', voice)}
                             className={`p-3 rounded-xl text-xs font-bold transition-all border ${settings.voiceName === voice ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'}`}
                           >
                              {voice}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase px-1">טון דיבור</label>
                      <select 
                        value={settings.voiceTone}
                        onChange={e => updateField('voiceTone', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none text-sm font-bold"
                      >
                         <option value="professional">מקצועי וענייני</option>
                         <option value="calm">רגוע ושלו</option>
                         <option value="aggressive">מהיר ואנרגטי</option>
                      </select>
                   </div>
                </div>
             </div>
          )}

          {/* Interface Settings */}
          {activeTab === 'interface' && (
             <div className="glass p-8 rounded-3xl border border-white/5 space-y-8">
                <div className="space-y-2">
                   <h3 className="text-lg font-black text-white uppercase italic">עוצמת ממשק (UI Intensity)</h3>
                   <p className="text-xs text-zinc-400">שליטה בכמות האפקטים והאנימציות במערכת</p>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between text-xs font-bold text-zinc-500">
                      <span>מינימליסטי</span>
                      <span>עתידני</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" 
                     max="100" 
                     value={settings.uiIntensity} 
                     onChange={e => updateField('uiIntensity', parseInt(e.target.value))}
                     className="w-full accent-orange-500 h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer"
                   />
                </div>
             </div>
          )}

          {/* Legal / Reset */}
          {activeTab === 'legal' && (
             <div className="space-y-6">
                <div className="glass p-8 rounded-3xl border border-red-500/20 bg-red-500/5 space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="text-3xl">⚠️</div>
                      <div>
                         <h3 className="text-lg font-black text-white uppercase italic">אזור סכנה</h3>
                         <p className="text-xs text-zinc-400">פעולות אלו הן בלתי הפיכות</p>
                      </div>
                   </div>
                   
                   <p className="text-xs text-zinc-300 leading-relaxed">
                      איפוס המערכת ימחק את כל ההיסטוריה, הפרויקטים, הגדרות המפתח והמידע האישי מהדפדפן שלך.
                   </p>

                   <button 
                     onClick={handleReset}
                     className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                   >
                      <span>🗑️</span>
                      <span>מחיקת כל הנתונים ואיפוס</span>
                   </button>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
