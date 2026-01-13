
import React, { useState, useEffect } from 'react';
import { ViewMode, AppSettings } from '../types';
import Logo from './Logo';
import { translations } from '../utils/translations';

interface DashboardProps {
  setView: (v: ViewMode) => void;
  appSettings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onNewChat: (prompt?: string, title?: string) => void;
  onNewProject: () => void;
  onOpenMenu: () => void;
  onOpenLegal: (type: 'terms' | 'privacy' | 'accessibility' | 'contact') => void;
  customLogo?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ setView, onNewChat, onNewProject, onOpenLegal, customLogo, appSettings, onOpenMenu }) => {
  const t = translations.he;
  const content = appSettings.dynamicContent;
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'}));
  
  // FIX: User Name - Force removal of "Guest"
  const userName = appSettings.userBio && !appSettings.userBio.includes('אורח') ? appSettings.userBio.split(' ')[0] : 'משתמש יקר';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})), 1000);
    return () => clearInterval(timer);
  }, []);

  const tools = [
    { title: t.titleStrategy, icon: "💬", mode: ViewMode.CHAT, desc: t.toolDescStrategy, color: "from-blue-600/20 to-blue-900/10", border: "hover:border-blue-500/50" },
    { title: t.titleDocs, icon: "📄", mode: ViewMode.DOC_ANALYSIS, desc: t.toolDescDocs, color: "from-emerald-600/20 to-emerald-900/10", border: "hover:border-emerald-500/50" },
    { title: t.templates, icon: "🚀", mode: ViewMode.TEMPLATES, desc: t.toolDescTemplates, color: "from-orange-600/20 to-orange-900/10", border: "hover:border-orange-500/50" },
    { title: t.titleProjects, icon: "📁", mode: ViewMode.PROJECT_DASHBOARD, desc: t.toolDescProjects, color: "from-purple-600/20 to-purple-900/10", border: "hover:border-purple-500/50" },
    { title: t.titleArt, icon: "🎨", mode: ViewMode.IMAGE_GEN, desc: t.toolDescArt, color: "from-pink-600/20 to-pink-900/10", border: "hover:border-pink-500/50" },
    { title: t.titleVoice, icon: "🎙️", mode: ViewMode.VOICE, desc: t.toolDescVoice, color: "from-amber-600/20 to-amber-900/10", border: "hover:border-amber-500/50" },
    { title: t.titleVideo, icon: "🎬", mode: ViewMode.VIDEO_GEN, desc: t.toolDescVideo, color: "from-red-600/20 to-red-900/10", border: "hover:border-red-500/50" },
    { title: t.titlePrompt, icon: "🧠", mode: ViewMode.PROMPT_LAB, desc: t.toolDescPrompt, color: "from-cyan-600/20 to-cyan-900/10", border: "hover:border-cyan-500/50" },
    { title: t.titleMessage, icon: "📩", mode: ViewMode.MESSAGE_GEN, desc: t.toolDescMessage, color: "from-indigo-600/20 to-indigo-900/10", border: "hover:border-indigo-500/50" }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#050508] custom-scrollbar animate-in text-right" dir="rtl">
      <div className="max-w-[1600px] mx-auto space-y-12 pb-10">
        <div className="space-y-6 border-b border-white/5 pb-12">
           <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                  <button onClick={onOpenMenu} className="md:hidden p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-white">☰</button>
                  <Logo size="md" customLogo={appSettings.customLogoUrl} />
              </div>
              <div className="flex items-center gap-6">
                 <div className="hidden md:flex items-center gap-4">
                    <div className="text-3xl font-black text-white/10 font-mono tracking-widest">{currentTime}</div>
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        אונליין
                    </div>
                 </div>
              </div>
           </div>
           <div className="space-y-6">
             {/* FIX: Title Colors */}
             <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9]">
                ברוך הבא {userName},<br/>
                <span className="text-white">Panda</span><span className="text-orange-600">Ai</span>
             </h1>
             <div className="space-y-4 max-w-4xl italic border-r-4 pr-8 border-orange-600">
                <p className="text-zinc-300 text-lg md:text-2xl font-medium leading-relaxed">
                   {t.dashboardWelcomeDesc}
                </p>
             </div>
           </div>
           <div className="flex gap-4 pt-6">
              <button onClick={() => onNewChat()} className="px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-sm">{content.newChatBtn}</button>
              <button onClick={onNewProject} className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm">{content.newProjectBtn}</button>
           </div>
        </div>

        <div className="space-y-8">
           <div className="flex items-center gap-4 px-2">
              <div className="w-2 h-8 bg-orange-600 rounded-full shadow-[0_0_15px_rgba(234,88,12,0.4)]"></div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest italic">{content.toolsTitle}</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tools.map((tool, i) => (
                <button key={i} onClick={() => setView(tool.mode)} className={`group relative overflow-hidden rounded-[2.5rem] p-8 text-right border border-white/5 bg-gradient-to-br ${tool.color} transition-all duration-300 ${tool.border} hover:shadow-2xl hover:-translate-y-2`}>
                    <div className="relative z-10 flex flex-col h-full gap-4">
                       {/* FIX: Same Line Icon and Title - Strictly Flex Row */}
                       <div className="flex flex-row items-center gap-4">
                          <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl border border-white/10 group-hover:scale-110 transition-transform shadow-inner shrink-0">{tool.icon}</div>
                          <h3 className="text-xl font-black text-white italic uppercase tracking-tight group-hover:text-orange-200 transition-colors">{tool.title}</h3>
                       </div>
                       <div>
                          <p className="text-[13px] text-zinc-300 leading-relaxed font-medium pl-2 italic">{tool.desc}</p>
                       </div>
                    </div>
                </button>
              ))}
           </div>
        </div>

        <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
           <div className="flex flex-wrap justify-center md:justify-start gap-8">
              <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors">{translations.he.terms}</button>
              <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors">{translations.he.privacy}</button>
              <button onClick={() => onOpenLegal('accessibility')} className="hover:text-white transition-colors">{translations.he.accessibility}</button>
              <button onClick={() => onOpenLegal('contact')} className="text-orange-600 hover:text-orange-400 font-black">{translations.he.contact}</button>
           </div>
           <div className="flex items-center gap-6">
              <span>{content.footerCopyright}</span>
              <button onClick={() => setView(ViewMode.ADMIN_PANEL)} className="opacity-10 hover:opacity-100 transition-opacity p-2 hover:rotate-12">🐼</button>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
