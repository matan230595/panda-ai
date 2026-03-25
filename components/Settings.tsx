
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, UserRole, ViewMode, ExpertiseLevel } from '../types';
import { useAppSettings, useUI, useApi } from '../contexts/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { generateSpeechSample } from '../services/gemini';
import { decode, decodeAudioData } from '../services/audio';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

const Settings: React.FC = () => {
  const { appSettings, updateAppSettings } = useAppSettings();
  const { setView, showToast } = useUI();
  const { apiConfigs } = useApi();

  const [activeTab, setActiveTab] = useState<'system' | 'voice' | 'interface' | 'legal'>('system');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [localSettings, setLocalSettings] = useState(appSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [samplingVoice, setSamplingVoice] = useState<string | null>(null);
  
  const resetModalRef = useFocusTrap<HTMLDivElement>();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    setHasChanges(JSON.stringify(localSettings) !== JSON.stringify(appSettings));
  }, [localSettings, appSettings]);
  
  useEffect(() => {
    // Cleanup AudioContext on component unmount
    return () => {
        audioCtxRef.current?.close().catch(console.error);
    }
  }, []);

  const updateField = (key: keyof AppSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSave = () => {
    updateAppSettings(localSettings);
    setHasChanges(false);
    showToast('ההגדרות נשמרו בהצלחה', 'success');
  };

  const executeReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleTitleClick = () => {
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);
    if (newCount >= 5) {
      const newAdminState = !localSettings.isAdmin;
      setLocalSettings(prev => ({ ...prev, isAdmin: newAdminState }));
      showToast(newAdminState ? 'GOD MODE ENABLED 👑' : 'GOD MODE DISABLED', 'celebrate');
      showToast('לחץ על "שמור שינויים" כדי להפוך את הבחירה לקבועה', 'info');
      setAdminClickCount(0);
    }
  };

  const playVoiceSample = async (voice: string) => {
      if (samplingVoice) return;
      setSamplingVoice(voice);
      try {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioCtx = audioCtxRef.current;
        const base64Audio = await generateSpeechSample(voice, "שלום, אני פנדה. נעים להכיר.", apiConfigs);

        if (base64Audio) {
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.start();
        } else {
            showToast('לא ניתן היה להפיק דגימת קול.', 'info');
        }
      } catch (error) {
        console.error("Error playing voice sample:", error);
        showToast('שגיאה בהשמעת דגימת הקול.', 'info');
      } finally {
        setSamplingVoice(null);
      }
  };

  const handleExport = () => {
    const dataToExport: { [key: string]: any } = {};
    for (const key of Object.values(LOCAL_STORAGE_KEYS)) {
        const data = localStorage.getItem(key);
        if (data) {
            dataToExport[key] = data;
        }
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'panda_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('הנתונים יוצאו בהצלחה!', 'success');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("File is not text");
            const importedData = JSON.parse(text);
            for (const key in importedData) {
                if (Object.values(LOCAL_STORAGE_KEYS).includes(key as any)) {
                    localStorage.setItem(key, importedData[key]);
                }
            }
            showToast('הנתונים יובאו בהצלחה! המערכת תטען מחדש.', 'celebrate');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Error importing data:", error);
            showToast('שגיאה בייבוא הקובץ. ודא שזהו קובץ גיבוי תקין.', 'info');
        }
    };
    reader.readAsText(file);
    // Reset file input value to allow re-uploading the same file
    if(event.target) event.target.value = '';
  };
  
  const voices = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];

  const SettingField = ({ label, children }: {label: string, children?: React.ReactNode}) => (
    <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between md:items-center gap-4">
      <label className="text-sm font-bold text-zinc-300 shrink-0">{label}</label>
      <div className="w-full md:w-auto flex justify-end">{children}</div>
    </div>
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-[#050508] p-6 lg:p-12 custom-scrollbar text-right" dir="rtl">
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setView(ViewMode.DASHBOARD)} className="p-3 bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all" aria-label="חזור">
                 →
              </button>
              <h2 onClick={handleTitleClick} className="text-2xl font-black text-white italic cursor-pointer" title="Toggle Admin Mode">
                 הגדרות מערכת
              </h2>
            </div>
            {hasChanges && (
                <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow-lg animate-in fade-in uppercase">
                    שמור שינויים
                </button>
            )}
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit overflow-x-auto max-w-full">
            {[ { id: 'system', label: 'מערכת וזיכרון' }, { id: 'voice', label: 'קול ודיבור' }, { id: 'interface', label: 'ממשק ותצוגה' }, { id: 'legal', label: 'פרטיות ואיפוס' } ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>{tab.label}</button>
            ))}
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 md:space-y-8 glass p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-white/10 bg-white/[0.01]">
            
            {activeTab === 'system' && (
              <div className="space-y-6">
                  <h3 className="text-lg font-black text-white uppercase italic tracking-wider">הגדרות מערכת וזיכרון</h3>
                  <SettingField label="שם וביוגרפיה"><input value={localSettings.userBio} onChange={e => updateField('userBio', e.target.value)} className="bg-transparent text-white text-right font-bold w-48"/></SettingField>
                  <SettingField label="תפקיד עיקרי"><select value={localSettings.userRole} onChange={e => updateField('userRole', e.target.value)} className="bg-transparent text-white font-bold"><option value={UserRole.BEGINNER}>משתמש</option><option value={UserRole.DEVELOPER}>מפתח</option><option value={UserRole.BUSINESS}>עסקי</option></select></SettingField>
                  <SettingField label="רמת מומחיות"><select value={localSettings.expertiseLevel} onChange={e => updateField('expertiseLevel', e.target.value)} className="bg-transparent text-white font-bold"><option value={ExpertiseLevel.BASIC}>בסיסי</option><option value={ExpertiseLevel.INTERMEDIATE}>בינוני</option><option value={ExpertiseLevel.ADVANCED}>מתקדם</option></select></SettingField>
              </div>
            )}
            
            {activeTab === 'voice' && (
               <div className="space-y-6">
                   <h3 className="text-lg font-black text-white uppercase italic tracking-wider">קול ודיבור</h3>
                   <SettingField label="בחר קול">
                       <div className="flex gap-2 flex-wrap justify-end">
                           {voices.map(v => (
                               <button 
                                 key={v} 
                                 onClick={() => { updateField('voiceName', v); playVoiceSample(v); }}
                                 className={`px-4 py-2 text-xs rounded-lg border flex items-center gap-2 transition-all ${localSettings.voiceName === v ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white/5 border-transparent text-zinc-300'}`}
                                 disabled={!!samplingVoice}
                               >
                                 {v}
                                 {samplingVoice === v 
                                     ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                     : <span>🔊</span>
                                 }
                               </button>
                           ))}
                       </div>
                   </SettingField>
               </div>
            )}

            {activeTab === 'interface' && (
               <div className="space-y-6">
                   <h3 className="text-lg font-black text-white uppercase italic tracking-wider">ממשק ותצוגה</h3>
                   <SettingField label="שפת ממשק"><select value={localSettings.language} onChange={e => updateField('language', e.target.value)} className="bg-transparent text-white font-bold"><option value="he">עברית</option></select></SettingField>
                   <SettingField label="ערכת נושא"><select value={localSettings.theme} className="bg-transparent text-white font-bold"><option value="midnight">Midnight</option></select></SettingField>
               </div>
            )}

            {activeTab === 'legal' && (
               <div className="space-y-8">
                   <h3 className="text-lg font-black text-white uppercase italic tracking-wider">פרטיות, נתונים ואיפוס</h3>
                   <div className="space-y-4">
                       <p className="text-zinc-400 text-sm">המידע שלך, כולל שיחות והגדרות, נשמר באופן מאובטח בדפדפן שלך בלבד. שום מידע אינו נשלח לשרתים שלנו. השתמש בכלי הגיבוי כדי לשמור את המידע שלך בין עדכונים.</p>
                       <div className="flex flex-col sm:flex-row gap-4">
                           <button onClick={handleExport} className="flex-1 px-5 py-3 bg-white/5 text-zinc-300 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">ייצוא כל הנתונים</button>
                           <button onClick={() => importFileRef.current?.click()} className="flex-1 px-5 py-3 bg-white/5 text-zinc-300 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">ייבוא נתונים</button>
                           <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={handleImport} />
                       </div>
                   </div>
                   <div className="pt-6 border-t border-white/5">
                       <button onClick={() => setShowResetConfirm(true)} className="w-full py-4 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-xl font-black transition-all border border-red-500/30">איפוס מלא של המערכת ⚠️</button>
                   </div>
               </div>
            )}

          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in" dir="rtl" onClick={() => setShowResetConfirm(false)}>
            <div ref={resetModalRef} className="max-w-md w-full bg-[#2a0a0a] p-10 rounded-[3rem] border-2 border-red-500/50 space-y-6 text-center shadow-[0_0_100px_rgba(239,68,68,0.3)] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="text-5xl">⚠️</div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">האם אתה בטוח?</h3>
                <p className="text-red-200 leading-relaxed font-medium">פעולה זו תמחק את **כל** השיחות, הפרויקטים וההגדרות שלך מהדפדפן באופן **סופי**. לא ניתן לשחזר את הנתונים לאחר האיפוס.</p>
                <div className="flex gap-4 pt-4">
                    <button onClick={executeReset} className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm">כן, אפס הכל</button>
                    <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs">ביטול</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default Settings;
