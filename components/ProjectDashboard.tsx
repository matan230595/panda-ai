
import React, { useState } from 'react';
import { Project, AppSettings, ChatSession } from '../types';
import { translations } from '../utils/translations';

interface ProjectDashboardProps {
  projects: Project[];
  sessions: ChatSession[];
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onBack: () => void;
  onStartChat: (projectId: string) => void;
  onNewProject: () => void;
  appSettings: AppSettings;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, sessions, onUpdateProject, onDeleteProject, onBack, onStartChat, onNewProject, appSettings }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const t = translations.he;

  const handleLinkChat = (chatId: string) => {
    if (!selectedProject) return;
    const updated = {
      ...selectedProject,
      linkedChatIds: [...new Set([...selectedProject.linkedChatIds, chatId])]
    };
    onUpdateProject(updated);
    setSelectedProject(updated);
    setShowLinkModal(false);
  };

  if (!selectedProject) {
    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-[#050508] custom-scrollbar text-right" dir="rtl">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex justify-between items-center border-b border-white/10 pb-8">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">מרכז הפרויקטים</h2>
            <button onClick={onNewProject} className="px-8 py-3 bg-orange-600 text-white font-black rounded-2xl text-xs shadow-xl hover:bg-orange-500 transition-all active:scale-95 uppercase tracking-widest">פרויקט חדש +</button>
          </div>

          {projects.length === 0 ? (
            <div className="py-32 text-center glass rounded-[3rem] border border-dashed border-white/10 opacity-30 flex flex-col items-center">
               <div className="text-8xl mb-8">📁</div>
               <p className="text-lg font-black text-white uppercase tracking-widest italic">אין פרויקטים פעילים</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {projects.map(p => (
                 <button key={p.id} onClick={() => setSelectedProject(p)} className="premium-card p-8 rounded-[2.5rem] flex flex-col text-right gap-6 relative group shadow-2xl bg-white/[0.01] border border-white/5 hover:border-orange-500/30 transition-all">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/5">{p.icon}</div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{p.name}</h3>
                       <p className="text-xs text-zinc-500 font-bold leading-relaxed line-clamp-3 italic">{p.description || "אין תיאור לפרויקט זה."}</p>
                    </div>
                    <div className="pt-4 mt-auto border-t border-white/5 flex justify-between items-center">
                       <span className="text-[10px] font-black text-zinc-600 uppercase">{p.linkedChatIds.length} שיחות משויכות</span>
                       <span className="text-orange-500 text-xl group-hover:translate-x-[-4px] transition-transform">←</span>
                    </div>
                 </button>
               ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-[#050508] custom-scrollbar text-right" dir="rtl">
       <div className="max-w-4xl mx-auto space-y-8">
          <button onClick={() => setSelectedProject(null)} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all font-black text-xs uppercase tracking-widest mb-4">
             <span className="text-xl">←</span>
             <span>חזרה לפרויקטים</span>
          </button>
          
          <div className="glass p-12 rounded-[4rem] border border-white/10 space-y-10 shadow-3xl bg-white/[0.01]">
             <div className="flex justify-between items-start gap-6">
                <div className="space-y-3">
                   <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">{selectedProject.name}</h2>
                   <p className="text-lg text-zinc-300 font-medium italic leading-relaxed">{selectedProject.description}</p>
                </div>
                <button onClick={() => { if(confirm("למחוק פרויקט?")) onDeleteProject(selectedProject.id); setSelectedProject(null); }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all">🗑️</button>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h4 className="text-[12px] font-black text-white uppercase tracking-widest italic">{t.linkedChats}</h4>
                    <button onClick={() => setShowLinkModal(true)} className="text-[10px] font-black text-orange-600 hover:text-orange-400 uppercase tracking-widest">שייך שיחה +</button>
                </div>
                <div className="space-y-3">
                   {selectedProject.linkedChatIds.map(cid => {
                     const chat = sessions.find(s => s.id === cid);
                     return chat ? (
                       <div key={cid} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
                          <span className="text-sm font-bold text-zinc-300 italic">{chat.title}</span>
                          <button onClick={() => onStartChat(selectedProject.id)} className="text-[10px] font-black text-zinc-600 group-hover:text-white uppercase transition-colors">המשך שיחה ←</button>
                       </div>
                     ) : null;
                   })}
                   {selectedProject.linkedChatIds.length === 0 && <p className="text-xs text-zinc-600 italic py-4">אין שיחות משויכות לפרויקט זה עדיין.</p>}
                </div>
             </div>

             <div className="pt-8 border-t border-white/5">
                <button onClick={() => onStartChat(selectedProject.id)} className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl rounded-3xl shadow-2xl transition-all italic tracking-tighter">
                   הפעל סוכן בינה לפרויקט ✨
                </button>
             </div>
          </div>
       </div>

       {showLinkModal && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in">
            <div className="max-w-md w-full glass p-10 rounded-[3rem] border border-white/10 space-y-8 animate-in zoom-in-95">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-white italic uppercase">שייך שיחה לפרויקט</h3>
                  <button onClick={() => setShowLinkModal(false)} className="text-2xl text-zinc-500 hover:text-white">✕</button>
               </div>
               <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {sessions.filter(s => !selectedProject.linkedChatIds.includes(s.id)).length === 0 ? (
                    <p className="text-center text-zinc-500 text-sm py-8">אין שיחות זמינות לשיוך</p>
                  ) : (
                    sessions.filter(s => !selectedProject.linkedChatIds.includes(s.id)).map(s => (
                      <button key={s.id} onClick={() => handleLinkChat(s.id)} className="w-full text-right p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 text-sm font-bold text-zinc-300 italic">
                         {s.title}
                      </button>
                    ))
                  )}
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default ProjectDashboard;
