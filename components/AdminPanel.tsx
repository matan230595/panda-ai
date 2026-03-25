
import React, { useState } from 'react';
import { AppSettings, DynamicContent, ViewMode } from '../types';
import { useUI, useAppSettings } from '../contexts/AppContext';

const AdminPanel: React.FC = () => {
  const { setView, showToast } = useUI();
  const { appSettings, updateAppSettings } = useAppSettings();

  // SECURITY FIX: Removed password authentication logic.
  // Access is now controlled solely by the 'isAdmin' flag in AppSettings,
  // which is toggled via a hidden mechanism in the Settings page.
  const isAuthenticated = appSettings.isAdmin;

  const [localContent, setLocalContent] = useState<DynamicContent>(appSettings.dynamicContent);
  const [legalContent, setLegalContent] = useState(appSettings.legalContent);
  const [logoUrl, setLogoUrl] = useState(appSettings.customLogoUrl || '');
  const [activeTab, setActiveTab] = useState<'content' | 'nav' | 'tools' | 'models' | 'links'>('content');

  const handleSave = () => {
    updateAppSettings({ 
      dynamicContent: localContent,
      legalContent: legalContent,
      customLogoUrl: logoUrl 
    });
    showToast('השינויים נשמרו בהצלחה! המערכת עודכנה.', 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black p-6" dir="rtl">
        <div className="max-w-md w-full glass p-12 rounded-[4rem] border border-red-600/20 text-center space-y-10 shadow-3xl relative overflow-hidden">
          <div className="text-6xl mx-auto bg-white/5 w-24 h-24 rounded-[2rem] flex items-center justify-center border border-white/10">🚫</div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">הגישה נדחתה</h2>
          <p className="text-zinc-400">אין לך הרשאות ניהול לצפייה בעמוד זה.</p>
          <button onClick={() => setView(ViewMode.DASHBOARD)} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 text-lg">חזור לדף הבית</button>
        </div>
      </div>
    );
  }

  const InputField = ({ label, value, onChange, placeholder }: any) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">{label}</label>
      <input 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-orange-500/50 text-sm font-bold shadow-inner transition-all"
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#050508] p-6 lg:p-12 text-right custom-scrollbar" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-12 pb-40">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-10 gap-6">
           <div>
              <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">דף "אלוהים" <span className="text-orange-600">GOD MODE</span></h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3">ניהול מלא של כל תוכן ומראה המערכת</p>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <button onClick={handleSave} className="flex-1 md:flex-none px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-500 transition-all shadow-xl uppercase">שמור הכל ✅</button>
              <button onClick={() => setView(ViewMode.DASHBOARD)} className="px-8 py-3 bg-white/5 text-zinc-400 rounded-xl hover:text-white transition-all text-xs font-black uppercase">יציאה</button>
           </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-4 border-b border-white/5">
           {[
             { id: 'content', label: 'תוכן כללי' },
             { id: 'nav', label: 'תפריטי ניווט' },
             { id: 'tools', label: 'שמות הכלים' },
             { id: 'models', label: 'שמות המודלים' },
             { id: 'links', label: 'קישורים וצור קשר' }
           ].map(tab => (
             <button 
               key={tab.id} 
               onClick={() => setActiveTab(tab.id as any)}
               className={`px-6 py-3 rounded-xl font-black text-xs transition-all whitespace-nowrap uppercase tracking-wider ${activeTab === tab.id ? 'bg-orange-600 text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
             >
               {tab.label}
             </button>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4">
           
           {activeTab === 'content' && (
             <>
               <div className="glass p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] border border-white/10 space-y-6 md:space-y-8 bg-white/[0.01] shadow-2xl">
                  <h3 className="text-xl font-black text-white uppercase italic">עריכת עמוד הבית</h3>
                  <InputField label="כותרת ראשית (Landing)" value={localContent.landingTitle} onChange={(v: string) => setLocalContent({...localContent, landingTitle: v})} />
                  <InputField label="כותרת משנה" value={localContent.landingSubtitle} onChange={(v: string) => setLocalContent({...localContent, landingSubtitle: v})} />
                  <InputField label="תיאור" value={localContent.landingDesc} onChange={(v: string) => setLocalContent({...localContent, landingDesc: v})} />
                  <InputField label="URL לוגו (מותאם אישית)" value={logoUrl} onChange={setLogoUrl} placeholder="https://..." />
               </div>
               <div className="glass p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] border border-white/10 space-y-6 md:space-y-8 bg-white/[0.01] shadow-2xl">
                  <h3 className="text-xl font-black text-white uppercase italic">טקסטים במערכת</h3>
                  <InputField label="ברכת שלום בדשבורד" value={localContent.dashboardWelcome} onChange={(v: string) => setLocalContent({...localContent, dashboardWelcome: v})} />
                  <p className="text-[10px] text-zinc-600 font-bold px-2">טיפ: השתמש ב-{"{name}"} כדי להציג את שם המשתמש. לדוגמה: "ברוך שובך, {"{name}"}".</p>
                  <InputField label="טקסט כפתור שיחה חדשה" value={localContent.newChatBtn} onChange={(v: string) => setLocalContent({...localContent, newChatBtn: v})} />
                  <InputField label="זכויות יוצרים (פוטר)" value={localContent.footerCopyright} onChange={(v: string) => setLocalContent({...localContent, footerCopyright: v})} />
               </div>
             </>
           )}

           {activeTab === 'nav' && (
             <div className="col-span-full glass p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] border border-white/10 space-y-6 md:space-y-8 bg-white/[0.01]">
                <h3 className="text-xl font-black text-white uppercase italic">עריכת תפריט צד (Sidebar)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <InputField label="לוח בקרה" value={localContent.navDashboard} onChange={(v: string) => setLocalContent({...localContent, navDashboard: v})} />
                   <InputField label="שיחה חדשה" value={localContent.navChat} onChange={(v: string) => setLocalContent({...localContent, navChat: v})} />
                   <InputField label="תבניות" value={localContent.navTemplates} onChange={(v: string) => setLocalContent({...localContent, navTemplates: v})} />
                   <InputField label="מסמכים" value={localContent.navDocs} onChange={(v: string) => setLocalContent({...localContent, navDocs: v})} />
                   <InputField label="פרויקטים" value={localContent.navProjects} onChange={(v: string) => setLocalContent({...localContent, navProjects: v})} />
                   <InputField label="קול (Voice)" value={localContent.navVoice} onChange={(v: string) => setLocalContent({...localContent, navVoice: v})} />
                   <InputField label="פרומפטים" value={localContent.navPrompt} onChange={(v: string) => setLocalContent({...localContent, navPrompt: v})} />
                   <InputField label="תמונות" value={localContent.navImage} onChange={(v: string) => setLocalContent({...localContent, navImage: v})} />
                   <InputField label="הודעות" value={localContent.navMessage} onChange={(v: string) => setLocalContent({...localContent, navMessage: v})} />
                   <InputField label="סטודיו קוד" value={localContent.navPandaCoder} onChange={(v: string) => setLocalContent({...localContent, navPandaCoder: v})} />
                   <InputField label="האקדמיה" value={localContent.navAcademy} onChange={(v: string) => setLocalContent({...localContent, navAcademy: v})} />
                </div>
             </div>
           )}

           {activeTab === 'tools' && (
             <div className="col-span-full glass p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] border border-white/10 space-y-6 md:space-y-8 bg-white/[0.01]">
                <h3 className="text-xl font-black text-white uppercase italic">שמות הכלים (כרטיסים בדף הבית)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <InputField label="כלי אסטרטגיה (צ'אט)" value={localContent.toolStrategy} onChange={(v: string) => setLocalContent({...localContent, toolStrategy: v})} />
                   <InputField label="כלי מסמכים" value={localContent.toolDocs} onChange={(v: string) => setLocalContent({...localContent, toolDocs: v})} />
                   <InputField label="כלי תבניות" value={localContent.toolTemplates} onChange={(v: string) => setLocalContent({...localContent, toolTemplates: v})} />
                   <InputField label="כלי פרויקטים" value={localContent.toolProjects} onChange={(v: string) => setLocalContent({...localContent, toolProjects: v})} />
                   <InputField label="כלי תמונות" value={localContent.toolArt} onChange={(v: string) => setLocalContent({...localContent, toolArt: v})} />
                   <InputField label="כלי קול" value={localContent.toolVoice} onChange={(v: string) => setLocalContent({...localContent, toolVoice: v})} />
                   <InputField label="כלי וידאו" value={localContent.toolVideo} onChange={(v: string) => setLocalContent({...localContent, toolVideo: v})} />
                   <InputField label="כלי פרומפטים" value={localContent.toolPrompt} onChange={(v: string) => setLocalContent({...localContent, toolPrompt: v})} />
                   <InputField label="כלי הודעות" value={localContent.toolMessage} onChange={(v: string) => setLocalContent({...localContent, toolMessage: v})} />
                   {/* FIX: Added missing input field for Panda Coder tool item. */}
                   <InputField label="כלי סטודיו קוד" value={localContent.toolPandaCoder} onChange={(v: string) => setLocalContent({...localContent, toolPandaCoder: v})} />
                </div>
             </div>
           )}

           {activeTab === 'models' && (
             <div className="col-span-full glass p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] border border-white/10 space-y-6 md:space-y-8 bg-white/[0.01]">
                <h3 className="text-xl font-black text-white uppercase italic">שמות המודלים (תפריט בחירה בצ'אט)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <InputField label="מצב מהיר (Standard)" value={localContent.modeStandard} onChange={(v: string) => setLocalContent({...localContent, modeStandard: v})} />
                   <InputField label="מצב חשיבה (Thinking)" value={localContent.modeThinking} onChange={(v: string) => setLocalContent({...localContent, modeThinking: v})} />
                   <InputField label="מצב מחקר (Research)" value={localContent.modeResearch} onChange={(v: string) => setLocalContent({...localContent, modeResearch: v})} />
                   <InputField label="מצב ראייה (Vision)" value={localContent.modeVision} onChange={(v: string) => setLocalContent({...localContent, modeVision: v})} />
                   <InputField label="מצב סוכן (Agentic)" value={localContent.modeAgentic} onChange={(v: string) => setLocalContent({...localContent, modeAgentic: v})} />
                </div>
             </div>
           )}

           {activeTab === 'links' && (
             <div className="col-span-full glass p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] border border-white/10 space-y-6 md:space-y-8 bg-white/[0.01]">
                <h3 className="text-xl font-black text-white uppercase italic">פרטי יצירת קשר וקישורים</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <InputField label="קישור לוואטסאפ (https://wa.me/...)" value={legalContent.waLink} onChange={(v: string) => setLegalContent({...legalContent, waLink: v})} />
                   <InputField label="כתובת אימייל" value={legalContent.email} onChange={(v: string) => setLegalContent({...legalContent, email: v})} />
                   <InputField label="מספר טלפון לתצוגה" value={legalContent.mobile} onChange={(v: string) => setLegalContent({...legalContent, mobile: v})} />
                   <InputField label="כתובת פיזית" value={legalContent.address} onChange={(v: string) => setLegalContent({...legalContent, address: v})} />
                   <div className="col-span-full">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">קוד הטמעה מפה (Iframe HTML)</label>
                      <textarea 
                        value={legalContent.mapEmbed}
                        onChange={e => setLegalContent({...legalContent, mapEmbed: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-orange-500/50 text-sm h-32 resize-none font-mono"
                      />
                   </div>
                </div>
             </div>
           )}

        </div>

        <div className="pt-12 border-t border-white/10">
           <button 
             onClick={handleSave}
             className="w-full py-6 md:py-8 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl md:text-2xl rounded-3xl md:rounded-[3rem] shadow-[0_0_80px_rgba(249,115,22,0.3)] transition-all active:scale-95 italic uppercase tracking-tighter"
           >
              שמור שינויים ועדכן את האתר ✨
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;