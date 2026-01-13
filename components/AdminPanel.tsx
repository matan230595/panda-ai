
import React, { useState } from 'react';
import { AppSettings, DynamicContent } from '../types';

interface AdminPanelProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onUpdate, onBack }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(settings.isAdmin);
  const [localContent, setLocalContent] = useState<DynamicContent>(settings.dynamicContent);
  const [legalContent, setLegalContent] = useState(settings.legalContent);
  const [logoUrl, setLogoUrl] = useState(settings.customLogoUrl || '');

  const handleLogin = () => {
    if (password === 'Panda2026') {
      setIsAuthenticated(true);
      onUpdate({ ...settings, isAdmin: true });
    } else {
      alert('סיסמה שגויה! הגישה נדחתה.');
    }
  };

  const handleSave = () => {
    onUpdate({ 
      ...settings, 
      dynamicContent: localContent,
      legalContent: legalContent,
      customLogoUrl: logoUrl 
    });
    alert('השינויים נשמרו בהצלחה! המערכת עודכנה.');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black p-6" dir="rtl">
        <div className="max-w-md w-full glass p-12 rounded-[4rem] border border-orange-600/20 text-center space-y-10 shadow-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="text-6xl mx-auto bg-white/5 w-24 h-24 rounded-[2rem] flex items-center justify-center border border-white/10">🛡️</div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">כניסת מנהל על</h2>
          <div className="space-y-4">
             <input 
               type="password" 
               value={password} 
               onChange={e => setPassword(e.target.value)}
               className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white text-center outline-none focus:border-orange-500 text-xl font-bold shadow-inner"
               placeholder="סיסמת גישה..."
               onKeyDown={e => e.key === 'Enter' && handleLogin()}
             />
             <button onClick={handleLogin} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 text-lg">פתיחת הרשאות ניהול</button>
          </div>
          <button onClick={onBack} className="text-zinc-600 text-xs uppercase font-bold tracking-widest hover:text-white transition-colors">חזרה למערכת ←</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#050508] p-6 lg:p-12 text-right custom-scrollbar" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-12 pb-40">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-10 gap-6">
           <div>
              <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">דף "אלוהים" <span className="text-orange-600">GOD MODE</span></h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3">ניהול מלא של כל תוכן ומראה המערכת</p>
           </div>
           <div className="flex gap-4">
              <button onClick={handleSave} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-500 transition-all shadow-xl uppercase">שמור הכל ✅</button>
              <button onClick={onBack} className="px-8 py-3 bg-white/5 text-zinc-400 rounded-xl hover:text-white transition-all text-xs font-black uppercase">יציאה</button>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {/* LOGO & BRANDING */}
           <div className="glass p-10 rounded-[3.5rem] border border-white/10 space-y-8 bg-white/[0.01] shadow-2xl">
              <h3 className="text-xl font-black text-orange-500 uppercase tracking-widest italic border-r-4 pr-4 border-orange-500">לוגו ומיתוג</h3>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-zinc-500 block mb-3 uppercase tracking-widest px-1">URL של הלוגו</label>
                    <input 
                      value={logoUrl}
                      onChange={e => setLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-orange-500 text-sm font-medium shadow-inner"
                    />
                 </div>
              </div>
              
              <h3 className="text-xl font-black text-emerald-500 uppercase tracking-widest italic border-r-4 pr-4 border-emerald-500 mt-8">פרטי קשר</h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase px-1">טלפון / נייד</label>
                   <input 
                     value={legalContent.mobile}
                     onChange={e => setLegalContent({...legalContent, mobile: e.target.value})}
                     className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 text-sm"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase px-1">אימייל</label>
                   <input 
                     value={legalContent.email}
                     onChange={e => setLegalContent({...legalContent, email: e.target.value})}
                     className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 text-sm"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase px-1">כתובת פיזית</label>
                   <input 
                     value={legalContent.address}
                     onChange={e => setLegalContent({...legalContent, address: e.target.value})}
                     className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 text-sm"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase px-1">קישור וואטסאפ (https://wa.me/...)</label>
                   <input 
                     value={legalContent.waLink}
                     onChange={e => setLegalContent({...legalContent, waLink: e.target.value})}
                     className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 text-sm"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase px-1">קוד הטמעה של גוגל מפות (Iframe)</label>
                   <textarea 
                     value={legalContent.mapEmbed}
                     onChange={e => setLegalContent({...legalContent, mapEmbed: e.target.value})}
                     className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-emerald-500 text-sm h-32 resize-none"
                   />
                 </div>
              </div>
           </div>

           {/* TEXT CONTENT EDITOR */}
           <div className="glass p-10 rounded-[3.5rem] border border-white/10 space-y-8 bg-white/[0.01] shadow-2xl">
              <h3 className="text-xl font-black text-indigo-500 uppercase tracking-widest italic border-r-4 pr-4 border-indigo-500">טקסטים וכפתורים</h3>
              <div className="space-y-8">
                 {Object.keys(localContent).map(key => (
                   <div key={key} className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest pr-2">{key.replace(/([A-Z])/g, ' $1')}</label>
                      <textarea 
                        value={(localContent as any)[key]}
                        onChange={e => setLocalContent({...localContent, [key]: e.target.value})}
                        className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-indigo-500 h-28 resize-none text-sm font-medium italic shadow-inner leading-relaxed text-right"
                      />
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="pt-12 border-t border-white/10">
           <button 
             onClick={handleSave}
             className="w-full py-10 bg-orange-600 hover:bg-orange-500 text-white font-black text-3xl rounded-[3rem] shadow-[0_0_80px_rgba(249,115,22,0.3)] transition-all active:scale-95 italic uppercase tracking-tighter"
           >
              שמור את כל השינויים ועדכן את האתר ✨
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
