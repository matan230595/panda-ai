
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

const Dashboard: React.FC<DashboardProps> = ({ setView, onNewChat, onNewProject, onOpenLegal, customLogo, appSettings }) => {
  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'}));

  useEffect(() => {
    const timer = setInterval(() => {
       setCurrentTime(new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'}));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tools = [
    { 
      title: t.titleStrategy, 
      icon: "💬", 
      mode: ViewMode.CHAT, 
      desc: t.toolDescStrategy,
      color: "from-blue-600/20 to-blue-900/10",
      border: "hover:border-blue-500/50"
    },
    { 
      title: t.titleDocs, 
      icon: "📄", 
      mode: ViewMode.DOC_ANALYSIS, 
      desc: t.toolDescDocs,
      color: "from-emerald-600/20 to-emerald-900/10",
      border: "hover:border-emerald-500/50"
    },
    { 
      title: t.titleProjects, 
      icon: "📁", 
      mode: ViewMode.PROJECT_DASHBOARD, 
      desc: t.toolDescProjects,
      color: "from-purple-600/20 to-purple-900/10",
      border: "hover:border-purple-500/50"
    },
    { 
      title: t.titleArt, 
      icon: "🎨", 
      mode: ViewMode.IMAGE_GEN, 
      desc: t.toolDescArt,
      color: "from-pink-600/20 to-pink-900/10",
      border: "hover:border-pink-500/50"
    },
    { 
      title: t.titleVoice, 
      icon: "🎙️", 
      mode: ViewMode.VOICE, 
      desc: t.toolDescVoice,
      color: "from-amber-600/20 to-amber-900/10",
      border: "hover:border-amber-500/50"
    },
    { 
      title: t.titleVideo, 
      icon: "🎬", 
      mode: ViewMode.VIDEO_GEN, 
      desc: t.toolDescVideo,
      color: "from-red-600/20 to-red-900/10",
      border: "hover:border-red-500/50"
    },
    { 
      title: t.titlePrompt, 
      icon: "🧠", 
      mode: ViewMode.PROMPT_LAB, 
      desc: t.toolDescPrompt,
      color: "from-cyan-600/20 to-cyan-900/10",
      border: "hover:border-cyan-500/50"
    },
    { 
      title: t.titleMessage, 
      icon: "📩", 
      mode: ViewMode.MESSAGE_GEN, 
      desc: t.toolDescMessage,
      color: "from-indigo-600/20 to-indigo-900/10",
      border: "hover:border-indigo-500/50"
    }
  ];

  return (
    <div className={`flex-1 overflow-y-auto p-6 lg:p-10 bg-[#050508] custom-scrollbar animate-in ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-[1600px] mx-auto space-y-12 pb-10">
        
        {/* Header Section */}
        <div className={`space-y-6 border-b border-white/5 pb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
           <div className="flex items-center justify-between">
              <Logo size="md" customLogo={customLogo} />
              <div className="hidden md:flex items-center gap-4">
                 <div className="text-3xl font-black text-white/10 font-mono tracking-widest">{currentTime}</div>
                 <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    {t.systemsOnline}
                 </div>
              </div>
           </div>
           
           <div className="space-y-2">
             <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-[0.9] glow-text">
                {t.welcome}, <span className="text-orange-500">{appSettings.userBio ? t.partner : t.guest}</span>.
             </h1>
             <p className={`text-zinc-400 text-sm md:text-base font-medium max-w-3xl leading-relaxed italic ${isRTL ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-orange-600/50`}>
                {appSettings.userBio ? 
                  (isRTL ? `פרופיל המשתמש שלך נטען בהצלחה. המערכת מוכנה לעבודה.` : `User profile loaded successfully. System ready.`) : 
                  (isRTL ? "סביבת העבודה המתקדמת ביותר לניהול משימות באמצעות AI." : "The most advanced workspace for AI-driven task management.")}
             </p>
           </div>

           <div className="flex gap-3 pt-2">
              <button onClick={() => onNewChat()} className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all active:scale-95 uppercase tracking-widest text-xs flex items-center gap-2">
                 <span>{t.newChat}</span>
                 <span className="text-lg">⚡</span>
              </button>
              <button onClick={onNewProject} className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black rounded-xl transition-all uppercase tracking-widest text-xs flex items-center gap-2">
                 <span>{t.createProject}</span>
                 <span className="text-lg">📁</span>
              </button>
           </div>
        </div>

        {/* Tools Grid */}
        <div className="space-y-6">
           <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">{t.toolsTitle}</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tools.map((tool, i) => (
                <button 
                    key={i} 
                    onClick={() => {
                      if (tool.mode === ViewMode.CHAT) {
                         onNewChat();
                      } else {
                         setView(tool.mode);
                      }
                    }}
                    className={`group relative overflow-hidden rounded-[1.5rem] p-6 ${isRTL ? 'text-right' : 'text-left'} border border-white/5 bg-gradient-to-br ${tool.color} transition-all duration-300 ${tool.border} hover:shadow-xl hover:-translate-y-1`}
                >
                    <div className="relative z-10 flex flex-col h-full gap-3">
                       <div className="flex items-start justify-between">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/10 group-hover:scale-105 transition-transform duration-300">
                            {tool.icon}
                          </div>
                          <div className={`opacity-0 group-hover:opacity-100 transition-all ${isRTL ? '-translate-x-2 group-hover:translate-x-0' : 'translate-x-2 group-hover:translate-x-0'}`}>
                             <span className="text-white text-[10px]">↗</span>
                          </div>
                       </div>
                       
                       <div>
                          <h3 className="text-lg font-black text-white italic uppercase tracking-tight mb-1 group-hover:text-orange-200 transition-colors">{tool.title}</h3>
                          <p className={`text-[11px] text-zinc-300 leading-relaxed font-medium ${isRTL ? 'pl-2 border-l' : 'pr-2 border-r'} border-white/10 line-clamp-3`}>{tool.desc}</p>
                       </div>
                    </div>
                    
                    <div className={`absolute -bottom-6 ${isRTL ? '-left-6' : '-right-6'} w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500`}></div>
                </button>
              ))}
           </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
           <div className="flex items-center gap-6">
              <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition-colors hover:underline">{t.terms}</button>
              <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition-colors hover:underline">{t.privacy}</button>
              <button onClick={() => onOpenLegal('accessibility')} className="hover:text-white transition-colors hover:underline">{t.accessibility}</button>
           </div>
           
           <div className="flex items-center gap-6">
              <button onClick={() => onOpenLegal('contact')} className="text-orange-500 hover:text-orange-400 transition-colors">{t.contact}</button>
              <span>© 2025 סטודיו פנדה עלית</span>
           </div>
        </footer>

      </div>
    </div>
  );
};

export default Dashboard;
