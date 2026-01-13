
import React from 'react';
import Logo from './Logo';
import { AppSettings, ViewMode } from '../types';
import { translations } from '../utils/translations';

const LandingPage: React.FC<{ onStart: () => void; appSettings: AppSettings; setView: (v: ViewMode) => void; onOpenLegal: (t: any) => void; }> = ({ onStart, appSettings, setView, onOpenLegal }) => {
  const t = translations.he;
  const content = appSettings.dynamicContent;

  const features = [
    { title: t.titleStrategy, icon: "💬", mode: ViewMode.CHAT, desc: t.toolDescStrategy },
    { title: t.titleDocs, icon: "📄", mode: ViewMode.DOC_ANALYSIS, desc: t.toolDescDocs },
    { title: t.titleArt, icon: "🎨", mode: ViewMode.IMAGE_GEN, desc: t.toolDescArt },
    { title: t.titleVoice, icon: "🎙️", mode: ViewMode.VOICE, desc: t.toolDescVoice },
    { title: t.titleVideo, icon: "🎬", mode: ViewMode.VIDEO_GEN, desc: t.toolDescVideo },
    { title: t.titlePrompt, icon: "🧠", mode: ViewMode.PROMPT_LAB, desc: t.toolDescPrompt },
    { title: t.titleMessage, icon: "📩", mode: ViewMode.MESSAGE_GEN, desc: t.toolDescMessage },
    { title: t.titleProjects, icon: "📁", mode: ViewMode.PROJECT_DASHBOARD, desc: t.toolDescProjects }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#020205] text-right" dir="rtl">
      <header className="fixed top-0 left-0 right-0 h-24 px-8 flex items-center justify-between z-50 backdrop-blur-xl border-b border-white/5 bg-[#020205]/80">
        <Logo size="sm" customLogo={appSettings.customLogoUrl} />
        <button onClick={onStart} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black text-sm shadow-lg transition-all active:scale-95 uppercase tracking-wide">{t.submit}</button>
      </header>

      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 blur-[120px] rounded-full"></div>
        
        <div className="max-w-6xl w-full text-center space-y-12 relative z-10">
          <div className="space-y-8 flex flex-col items-center">
            <div onClick={onStart} className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-2xl border border-white/10 cursor-pointer animate-bounce hover:scale-110 transition-transform duration-500">🐼</div>
            
            <h1 className="text-6xl md:text-[8rem] font-black italic tracking-tighter uppercase leading-[0.9]">
              <span className="text-white">PANDA </span>
              <span className="text-orange-600 italic">AI</span>
            </h1>
            
            <h2 className="text-zinc-300 text-2xl md:text-4xl font-bold italic tracking-wide">{t.welcome}</h2>
            
            <p className="text-zinc-500 text-lg md:text-xl max-w-3xl border-r-4 border-orange-600 pr-6 leading-relaxed">
              {content.landingDesc}
            </p>
          </div>
          
          <button onClick={onStart} className="px-16 py-6 bg-orange-600 hover:bg-orange-500 text-white font-black text-2xl rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 italic uppercase tracking-widest ring-4 ring-orange-600/20">
            התחל עכשיו בחינם ⚡
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24 space-y-16">
        <h2 className="text-4xl font-black text-white italic text-center uppercase tracking-tighter">סט הכלים המלא 🐼</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {features.map((f, i) => (
             <button key={i} onClick={() => { onStart(); setView(f.mode); }} className="glass p-8 rounded-[3rem] border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] text-right group hover:border-orange-500/30 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">{f.icon}</div>
                  <h4 className="text-lg font-black text-white uppercase italic group-hover:text-orange-500 transition-colors">{f.title}</h4>
                </div>
                <p className="text-zinc-500 text-xs italic font-medium leading-relaxed">{f.desc}</p>
             </button>
           ))}
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 flex flex-col items-center gap-10 bg-black/40 backdrop-blur-xl">
        <div className="flex gap-12 text-xs font-black uppercase text-zinc-500 tracking-widest">
           <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-all">{t.terms}</button>
           <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-all">{t.privacy}</button>
           <button onClick={() => onOpenLegal('accessibility')} className="hover:text-white transition-all">{t.accessibility}</button>
           <button onClick={() => onOpenLegal('contact')} className="text-orange-600 hover:text-orange-400 border-b border-orange-600/30 pb-0.5">{t.contact}</button>
        </div>
        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">{t.copyright}</p>
      </footer>
    </div>
  );
};

export default LandingPage;
