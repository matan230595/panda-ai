
import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, Project } from '../types';

interface CommandAction {
  id: string;
  type: 'view' | 'chat' | 'project' | 'selectProject';
  label: string;
  payload?: any;
  icon: string;
  shortcut?: string;
}

interface CommandPaletteProps {
  onClose: () => void;
  onAction: (action: CommandAction) => void;
  projects: Project[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, onAction, projects }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const staticActions: CommandAction[] = [
    { id: 'goto-dash', type: 'view', label: 'Go to Dashboard', payload: ViewMode.DASHBOARD, icon: '🏠', shortcut: 'G D' },
    { id: 'goto-chat', type: 'view', label: 'Open Chat', payload: ViewMode.CHAT, icon: '💬', shortcut: 'G C' },
    { id: 'new-chat', type: 'chat', label: 'Start New Chat', icon: '⚡', shortcut: 'N C' },
    { id: 'new-proj', type: 'project', label: 'Create New Project', icon: '📁', shortcut: 'N P' },
    { id: 'goto-voice', type: 'view', label: 'Voice Interface', payload: ViewMode.VOICE, icon: '🎙️', shortcut: 'G V' },
    { id: 'goto-images', type: 'view', label: 'Image Studio', payload: ViewMode.IMAGE_GEN, icon: '🎨' },
    { id: 'goto-settings', type: 'view', label: 'Settings', payload: ViewMode.SETTINGS, icon: '⚙️', shortcut: 'G S' },
  ];

  const projectActions: CommandAction[] = projects.map(p => ({
    id: `project-${p.id}`,
    type: 'selectProject',
    label: `Switch to: ${p.name}`,
    payload: p.id,
    icon: '📁'
  }));

  const filteredActions = [...staticActions, ...projectActions].filter(a => 
    a.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
    const handleDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setSelectedIndex(i => Math.min(i + 1, filteredActions.length - 1));
      if (e.key === 'ArrowUp') setSelectedIndex(i => Math.max(i - 1, 0));
      if (e.key === 'Enter') onAction(filteredActions[selectedIndex]);
    };
    window.addEventListener('keydown', handleDown);
    return () => window.removeEventListener('keydown', handleDown);
  }, [onClose, filteredActions, selectedIndex, onAction]);

  return (
    <div className="fixed inset-0 z-[5000] flex items-start justify-center pt-32 px-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0a0a14] rounded-[2rem] border border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-[#0a0a14]">
          <span className="text-xl opacity-40">🔍</span>
          <input 
            ref={inputRef}
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
            placeholder="Search commands, projects or tools..."
            className="flex-1 bg-transparent border-none outline-none text-white text-lg font-medium"
          />
          <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
             <span className="text-[10px] font-black text-zinc-500 uppercase">ESC</span>
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-3 space-y-1 bg-[#0a0a14]">
          {filteredActions.length === 0 ? (
            <div className="py-10 text-center text-zinc-600 font-bold uppercase text-[10px] tracking-widest">No results found</div>
          ) : (
            filteredActions.map((action, i) => (
              <button 
                key={action.id}
                onClick={() => onAction(action)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full text-right flex items-center gap-4 p-4 rounded-xl transition-all ${i === selectedIndex ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}
              >
                <span className="text-xl">{action.icon}</span>
                <span className="flex-1 font-black uppercase text-xs tracking-tight">{action.label}</span>
                {action.shortcut && (
                  <span className={`text-[9px] font-mono px-2 py-1 rounded border ${i === selectedIndex ? 'border-white/20 bg-white/10 text-white' : 'border-white/5 bg-white/5 text-zinc-600'}`}>
                    {action.shortcut}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        <div className="p-4 bg-[#050508] border-t border-white/5 flex justify-between items-center px-8">
           <div className="flex gap-4">
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-zinc-700 uppercase">Select</span>
                 <div className="w-4 h-4 bg-white/5 border border-white/10 rounded flex items-center justify-center text-[8px] text-zinc-500">⏎</div>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-zinc-700 uppercase">Navigate</span>
                 <div className="flex gap-1">
                    <div className="w-4 h-4 bg-white/5 border border-white/10 rounded flex items-center justify-center text-[8px] text-zinc-500">↑</div>
                    <div className="w-4 h-4 bg-white/5 border border-white/10 rounded flex items-center justify-center text-[8px] text-zinc-500">↓</div>
                 </div>
              </div>
           </div>
           <span className="text-[9px] font-black text-indigo-500/50 uppercase tracking-[0.2em]">PandaAi Core Interface</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
