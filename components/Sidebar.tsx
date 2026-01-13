
import React, { useState } from 'react';
import { ViewMode, ChatSession, AppSettings, Project } from '../types';
import Logo from './Logo';
import { translations } from '../utils/translations';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onNewChat: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  appSettings: AppSettings;
  customLogo?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, setView, sessions, activeSessionId, onSelectSession, 
  onDeleteSession, onTogglePin, onToggleArchive, onNewChat, onClose, isOpen, appSettings, customLogo 
}) => {
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';

  const filteredSessions = sessions
    .filter(s => (showArchived ? s.isArchived : !s.isArchived) && s.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
    });

  const navItems = [
    { mode: ViewMode.DASHBOARD, icon: '🏠', label: t.dashboard },
    { mode: ViewMode.CHAT, icon: '💬', label: t.newChat },
    { mode: ViewMode.TEMPLATES, icon: '🚀', label: t.templates },
    { mode: ViewMode.DOC_ANALYSIS, icon: '📄', label: t.docAnalysis },
    { mode: ViewMode.PROJECT_DASHBOARD, icon: '📁', label: t.projects },
    { mode: ViewMode.VOICE, icon: '🎙️', label: t.voice },
    { mode: ViewMode.PROMPT_LAB, icon: '🧠', label: t.promptLab },
    { mode: ViewMode.IMAGE_GEN, icon: '🎨', label: t.imageGen },
    { mode: ViewMode.MESSAGE_GEN, icon: '📩', label: t.messageGen }
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[450] md:hidden" onClick={onClose} />}
      
      {/* Sidebar Container - RTL logic fixed to ensure right alignment for Hebrew */}
      <div className={`fixed md:relative inset-y-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} z-[500] w-[280px] h-full bg-[#040406] border-white/10 flex flex-col transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="p-6 flex flex-col h-full space-y-8">
          
          <div className="flex justify-between items-center shrink-0 border-b border-white/5 pb-6">
            <Logo size="sm" showText={true} customLogo={customLogo} />
            <button onClick={onClose} className="md:hidden text-zinc-300 p-2 text-2xl">✕</button>
          </div>

          <button 
            onClick={() => { onNewChat(); if(onClose) onClose(); }}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 text-sm"
          >
            <span>{t.newChat}</span>
            <span className="text-lg">⚡</span>
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 px-1">
            <div className="space-y-1.5">
              {navItems.map(item => (
                <button 
                  key={item.mode} 
                  onClick={() => { setView(item.mode); if(onClose) onClose(); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all border group ${currentView === item.mode ? 'bg-orange-600/15 border-orange-500/30 text-white' : 'border-transparent text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <span className={`text-xl transition-transform group-hover:scale-110 ${currentView === item.mode ? 'text-orange-500' : 'text-zinc-500'}`}>{item.icon}</span>
                  <span className={`text-sm font-black ${currentView === item.mode ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>{item.label}</span>
                </button>
              ))}
            </div>
            
            <div className="pt-8 border-t border-white/5 space-y-5">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.recentHistory}</span>
                <button onClick={() => setShowArchived(!showArchived)} className="text-[10px] text-orange-500 font-black hover:underline tracking-tighter uppercase">
                  {showArchived ? t.back : t.archive}
                </button>
              </div>
              <div className="space-y-1">
                {filteredSessions.map(s => (
                  <div key={s.id} className="group relative">
                    <button onClick={() => { onSelectSession(s.id); setView(ViewMode.CHAT); if(onClose) onClose(); }}
                      className={`w-full ${isRTL ? 'text-right' : 'text-left'} px-4 py-3 rounded-xl truncate text-[11px] font-bold transition-all ${activeSessionId === s.id && currentView === ViewMode.CHAT ? 'bg-white/10 text-white shadow-inner' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                      {s.isPinned && <span className={`text-orange-500 ${isRTL ? 'ml-2' : 'mr-2'}`}>📌</span>} {s.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 mt-auto border-t border-white/5 flex items-center justify-between">
            <button onClick={() => { setView(ViewMode.SETTINGS); if(onClose) onClose(); }} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group">
              <span className="text-xl group-hover:rotate-12 transition-transform">⚙️</span>
              <span className="text-xs font-black uppercase tracking-widest">{t.settings}</span>
            </button>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse"></div></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
