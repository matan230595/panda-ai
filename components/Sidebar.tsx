
import React, { useState, useMemo } from 'react';
import { ViewMode } from '../types';
import Logo from './Logo';
import { translations } from '../utils/translations';
import { useUI, useChat, useAppSettings } from '../contexts/AppContext';

interface SidebarProps {
  onClose?: () => void;
  isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, isOpen }) => {
  const { view, setView } = useUI();
  const { sessions, activeSessionId, continueChat, deleteSession, newChat, togglePinSession } = useChat();
  const { appSettings } = useAppSettings();

  const t = translations.he;
  const d = appSettings.dynamicContent;
  const [displayCount, setDisplayCount] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { mode: ViewMode.DASHBOARD, icon: '🏠', label: d.navDashboard || t.dashboard },
    { mode: ViewMode.CHAT, icon: '💬', label: d.navChat || t.newChat },
    { mode: ViewMode.TEMPLATES, icon: '🚀', label: d.navTemplates || t.templates },
    { mode: ViewMode.DOC_ANALYSIS, icon: '📄', label: d.navDocs || t.docAnalysis },
    { mode: ViewMode.PANDA_CODER, icon: '</>', label: d.navPandaCoder || 'Panda Coder' },
    { mode: ViewMode.PROJECT_DASHBOARD, icon: '📁', label: d.navProjects || t.projects },
    { mode: ViewMode.VOICE, icon: '🎙️', label: d.navVoice || t.voice },
    { mode: ViewMode.PROMPT_LAB, icon: '🧠', label: d.navPrompt || t.promptLab },
    { mode: ViewMode.IMAGE_GEN, icon: '🎨', label: d.navImage || t.imageGen },
    { mode: ViewMode.VIDEO_GEN, icon: '🎬', label: t.videoGen },
    { mode: ViewMode.MESSAGE_GEN, icon: '📩', label: d.navMessage || t.messageGen },
    { mode: ViewMode.API_HUB, icon: '🔌', label: t.apiHubTitle },
    { mode: ViewMode.ACADEMY, icon: '🎓', label: d.navAcademy || 'האקדמיה' },
  ];

  const handleNewChat = () => {
    newChat();
    setView(ViewMode.CHAT);
    if (onClose) onClose();
  };
  
  const handleContinueChat = (id: string) => {
    continueChat(id);
    setView(ViewMode.CHAT);
    if (onClose) onClose();
  };
  
  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deleteSession(id);
      if(activeSessionId === id) {
          setView(ViewMode.DASHBOARD);
      }
  };

  const handleTogglePin = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      togglePinSession(id);
  };

  const sortedAndFilteredSessions = useMemo(() => {
      return sessions
        .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
  }, [sessions, searchQuery]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[450] md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      
      <div 
        className={`fixed md:relative inset-y-0 right-0 z-[500] w-[280px] h-full bg-[#0a0a0c] border-l border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`} 
        dir="rtl"
      >
        <div className="p-4 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-6 shrink-0 px-2 pt-2">
            <div 
              onClick={() => { setView(ViewMode.DASHBOARD); if(onClose) onClose(); }} 
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Logo size="sm" customLogo={appSettings.customLogoUrl} />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); if(onClose) onClose(); }} 
              className="md:hidden flex items-center justify-center w-10 h-10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-all relative z-50 cursor-pointer"
              aria-label="סגור תפריט"
            >
              <span className="text-xl leading-none">✕</span>
            </button>
          </div>
          
          <button 
            onClick={handleNewChat} 
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-all flex items-center justify-center gap-3 mb-6 font-black text-sm shadow-md shadow-orange-900/20 active:scale-95 transform hover:scale-[1.02] hover:-translate-y-px"
          >
            <span className="text-base">➕</span>
            <span>{d.navChat || t.newChat}</span>
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
            {navItems.map(item => (
              <button 
                key={item.mode} 
                onClick={() => { setView(item.mode); if(onClose) onClose(); }} 
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all transform ${
                  view === item.mode 
                    ? 'bg-white/10 text-white font-bold' 
                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200 hover:translate-x-1'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}

            <div className="pt-6 mt-4 border-t border-white/5">
              <h4 className="px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">{t.chatHistory}</h4>
              <div className="px-3 mb-3">
                <input
                  type="text"
                  placeholder="חיפוש שיחות..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-xs outline-none focus:border-orange-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                {sortedAndFilteredSessions.slice(0, displayCount).map((s) => (
                  <div key={s.id} className="group relative">
                    <button 
                      onClick={() => handleContinueChat(s.id)}
                      className={`w-full text-right px-4 py-2.5 rounded-xl text-xs font-medium truncate pr-8 pl-12 transition-all transform ${
                        activeSessionId === s.id && view === ViewMode.CHAT
                          ? 'bg-orange-600/10 text-orange-500 border border-orange-500/10' 
                          : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300 hover:translate-x-1'
                      }`}
                    >
                      {s.isPinned && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500/50">📌</span>}
                      {s.title || 'שיחה ללא שם'}
                    </button>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={(e) => handleTogglePin(e, s.id)} className="text-zinc-600 hover:text-orange-500 p-2" aria-label={s.isPinned ? "הסר נעיצה" : "נעץ שיחה"}>📌</button>
                        <button onClick={(e) => handleDeleteSession(e, s.id)} className="text-zinc-600 hover:text-red-500 p-2" aria-label="מחק שיחה">✕</button>
                    </div>
                  </div>
                ))}
                {sortedAndFilteredSessions.length > displayCount && (
                  <button 
                    onClick={() => setDisplayCount(c => c + 20)} 
                    className="w-full text-center py-3 text-xs font-bold text-zinc-600 hover:text-white"
                  >
                    טען עוד
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-auto border-t border-white/5 shrink-0">
            <button 
              onClick={() => { setView(ViewMode.SETTINGS); if(onClose) onClose(); }} 
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all transform ${
                view === ViewMode.SETTINGS ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-white hover:translate-x-1'
              }`}
            >
              <span className="text-xl">⚙️</span>
              <span className="text-sm font-bold">{t.settings}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
