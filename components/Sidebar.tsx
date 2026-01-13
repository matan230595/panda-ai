
import React, { useState, useRef } from 'react';
import { ViewMode, ChatSession, AppSettings } from '../types';
import Logo from './Logo';
import { translations } from '../utils/translations';

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
  onClose?: () => void;
  isOpen?: boolean;
  appSettings: AppSettings;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, setView, sessions, activeSessionId, onSelectSession, 
  onDeleteSession, onNewChat, onClose, isOpen, appSettings
}) => {
  const t = translations.he;
  const [displayCount, setDisplayCount] = useState(15);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    <div className="w-[280px] h-full bg-[#0a0a0c] border-l border-white/10 flex flex-col shadow-2xl" dir="rtl">
        <div className="p-4 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-6 shrink-0 pt-2 px-1">
            <div 
              onClick={() => { setView(ViewMode.DASHBOARD); if(onClose) onClose(); }} 
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Logo size="sm" customLogo={appSettings.customLogoUrl} />
            </div>
            {/* Close button mostly for mobile */}
            <button onClick={onClose} className="md:hidden text-zinc-300 hover:text-white p-2 text-2xl font-bold bg-white/5 rounded-lg">✕</button>
          </div>
          
          <button 
            onClick={() => { onNewChat(); if(onClose) onClose(); }} 
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl transition-all flex items-center justify-center gap-3 mb-6 font-black text-sm shadow-lg shadow-orange-900/20"
          >
            <span className="text-lg">➕</span>
            <span>{t.newChat}</span>
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1"
          >
            {navItems.map(item => (
              <button 
                key={item.mode} 
                onClick={() => { setView(item.mode); if(onClose) onClose(); }} 
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  currentView === item.mode 
                    ? 'bg-white/10 text-white font-bold' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                <span className="text-xl w-6 text-center">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}

            <div className="pt-8 mt-6 border-t border-white/10">
              <h4 className="px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">{t.chatHistory}</h4>
              <div className="space-y-1">
                {sessions.length === 0 && <p className="text-zinc-600 text-xs px-4 italic">אין היסטוריה עדיין...</p>}
                {sessions.slice(0, displayCount).map((s) => (
                  <div key={s.id} className="group relative">
                    <button 
                      onClick={() => { onSelectSession(s.id); setView(ViewMode.CHAT); if(onClose) onClose(); }}
                      className={`w-full text-right px-4 py-3 rounded-xl text-xs font-medium truncate pr-8 pl-4 transition-all ${
                        activeSessionId === s.id 
                          ? 'bg-orange-600/10 text-orange-400 border border-orange-500/10' 
                          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                      }`}
                    >
                      {s.title || 'שיחה ללא שם'}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }} 
                      className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-500 p-1.5 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-auto border-t border-white/10 shrink-0">
            <button 
              onClick={() => { setView(ViewMode.SETTINGS); if(onClose) onClose(); }} 
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                currentView === ViewMode.SETTINGS ? 'bg-white/10 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl">⚙️</span>
              <span className="text-sm font-bold">{t.settings}</span>
            </button>
          </div>
        </div>
    </div>
  );
};

export default Sidebar;
