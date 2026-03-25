
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { ViewMode, AppSettings } from '../types';
import Logo from './Logo';
import { translations } from '../utils/translations';
import { useUI, useAppSettings, useChat } from '../contexts/AppContext';

const ContactModal = lazy(() => import('./ContactModal'));

const Dashboard: React.FC = () => {
  const { setView, setIsSidebarOpen } = useUI();
  const { appSettings } = useAppSettings();
  const { sessions, continueChat } = useChat();

  const t = translations.he;
  const content = appSettings.dynamicContent;
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'}));
  const [showContactModal, setShowContactModal] = useState(false);
  
  const userName = appSettings.userBio && !appSettings.userBio.includes('אורח') ? appSettings.userBio.split(' ')[0] : t.guest;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickAccessSessions = useMemo(() => {
    const pinned = sessions.filter(s => s.isPinned);
    const recent = sessions
      .filter(s => !s.isPinned)
      .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
    return [...pinned, ...recent].slice(0, 5);
  }, [sessions]);

  const handleContinueChat = (id: string) => {
    continueChat(id);
    setView(ViewMode.CHAT);
  };

  const tools = [
    { title: content.toolStrategy || t.titleStrategy, icon: "💬", mode: ViewMode.CHAT, desc: t.toolDescStrategy, color: "from-blue-600/20 to-blue-900/10", border: "hover:border-blue-500/50" },
    { title: content.toolDocs || t.titleDocs, icon: "📄", mode: ViewMode.DOC_ANALYSIS, desc: t.toolDescDocs, color: "from-emerald-600/20 to-emerald-900/10", border: "hover:border-emerald-500/50" },
    { title: content.toolPandaCoder || 'Panda Coder', icon: "</>", mode: ViewMode.PANDA_CODER, desc: t.toolDescPandaCoder, color: "from-gray-600/20 to-gray-900/10", border: "hover:border-gray-500/50" },
    { title: content.toolTemplates || t.templates, icon: "🚀", mode: ViewMode.TEMPLATES, desc: t.toolDescTemplates, color: "from-orange-600/20 to-orange-900/10", border: "hover:border-orange-500/50" },
    { title: content.toolProjects || t.titleProjects, icon: "📁", mode: ViewMode.PROJECT_DASHBOARD, desc: t.toolDescProjects, color: "from-purple-600/20 to-purple-900/10", border: "hover:border-purple-500/50" },
    { title: content.toolArt || t.titleArt, icon: "🎨", mode: ViewMode.IMAGE_GEN, desc: t.toolDescArt, color: "from-pink-600/20 to-pink-900/10", border: "hover:border-pink-500/50" },
    { title: content.toolVoice || t.titleVoice, icon: "🎙️", mode: ViewMode.VOICE, desc: t.toolDescVoice, color: "from-amber-600/20 to-amber-900/10", border: "hover:border-amber-500/50" },
    { title: content.toolVideo || t.videoGen, icon: "🎬", mode: ViewMode.VIDEO_GEN, desc: t.toolDescVideo, color: "from-red-600/20 to-red-900/10", border: "hover:border-red-500/50" },
    { title: content.toolPrompt || t.titlePrompt, icon: "🧠", mode: ViewMode.PROMPT_LAB, desc: t.toolDescPrompt, color: "from-cyan-600/20 to-cyan-900/10", border: "hover:border-cyan-500/50" },
    { title: content.toolMessage || t.titleMessage, icon: "📩", mode: ViewMode.MESSAGE_GEN, desc: t.toolDescMessage, color: "from-indigo-600/20 to-indigo-900/10", border: "hover:border-indigo-500/50" }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-[#050508] custom-scrollbar animate-in text-right relative" dir="rtl" role="main" aria-label={t.dashboard}>
      <div className="max-w-[1600px] mx-auto space-y-12 pb-10">
        <div className="space-y-6 pb-12">
           <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                  <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-white" aria-label="פתח תפריט צד">☰</button>
                  <Logo size="md" customLogo={appSettings.customLogoUrl} />
              </div>
              <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block" aria-live="polite">
                      <div className="text-white font-black text-xl leading-none">{currentTime}</div>
                      <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{new Date().toLocaleDateString('he-IL', {weekday: 'long', day: 'numeric', month: 'long'})}</div>
                  </div>
                  <button onClick={() => setView(ViewMode.SETTINGS)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-xl cursor-pointer hover:bg-white/10 transition-colors" aria-label={t.settings}>
                    ⚙️
                  </button>
              </div>
           </div>
           
           <div className="glass p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight">
               {content.dashboardWelcome.replace('{name}', userName)}
             </h2>
             <p className="mt-3 md:mt-4 max-w-4xl text-base md:text-lg text-zinc-400 font-medium leading-relaxed italic">{t.dashboardWelcomeDesc}</p>
           </div>
        </div>

        {quickAccessSessions.length > 0 && (
          <section className="space-y-6 border-b border-white/5 pb-12" aria-labelledby="quick-access-title">
            <h3 id="quick-access-title" className="text-xl font-black text-white uppercase italic tracking-wider">גישה מהירה</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickAccessSessions.map(s => (
                <button key={s.id} onClick={() => handleContinueChat(s.id)} className="group text-right p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all flex items-center gap-4" aria-label={`המשך שיחה: ${s.title}`}>
                  {s.isPinned && <span className="text-xl" aria-hidden="true">📌</span>}
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors truncate flex-1">{s.title}</span>
                  <span className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">←</span>
                </button>
              ))}
            </div>
          </section>
        )}
        
        <section className="space-y-6" aria-labelledby="tools-title">
          <h3 id="tools-title" className="text-xl font-black text-white uppercase italic tracking-wider">{content.toolsTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {tools.map((tool, i) => (
              <button 
                key={i}
                onClick={() => setView(tool.mode)}
                className={`group text-right p-6 rounded-3xl border border-white/5 hover:scale-[1.03] transition-all duration-300 relative flex flex-col h-full shadow-lg bg-gradient-to-br ${tool.color} ${tool.border}`}
                aria-label={`${tool.title}: ${tool.desc}`}
              >
                 <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl bg-black/20 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-black/40 transition-all shadow-inner" aria-hidden="true">{tool.icon}</div>
                 </div>
                 <h3 className="text-lg font-black text-white mb-2 group-hover:text-orange-400 transition-colors uppercase italic">{tool.title}</h3>
                 <p className="text-xs text-zinc-400 leading-relaxed flex-1 italic font-medium">{tool.desc}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
      
      <div className="sticky bottom-6 flex justify-end px-6">
        <button 
          onClick={() => setShowContactModal(true)} 
          className="p-4 md:px-6 md:py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-black text-sm shadow-2xl transition-all active:scale-95 uppercase tracking-wide flex items-center gap-2"
          aria-label={t.contact}
        >
          <span className="text-xl md:text-lg leading-none">📞</span>
          <span className="hidden md:inline">{t.contact}</span>
        </button>
      </div>
      
      <Suspense fallback={null}>
        {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}
      </Suspense>
    </div>
  );
};

export default Dashboard;
