
import React, { useState } from 'react';
import { Project, ViewMode } from '../types';
import { translations } from '../utils/translations';
import ProjectCreationModal from './ProjectCreationModal';
import { useProjects, useChat, useUI } from '../contexts/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

const ProjectDashboard: React.FC = () => {
  const { projects, updateProject, deleteProject } = useProjects();
  const { sessions, continueChat, newChat } = useChat();
  const { setView } = useUI();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Project | null>(null);
  
  const linkModalRef = useFocusTrap<HTMLDivElement>();
  const deleteConfirmRef = useFocusTrap<HTMLDivElement>();
  
  const t = translations.he;

  const handleLinkChat = (chatId: string) => {
    if (!selectedProject) return;
    const updated = {
      ...selectedProject,
      linkedChatIds: [...new Set([...selectedProject.linkedChatIds, chatId])]
    };
    updateProject(updated);
    setSelectedProject(updated);
    setShowLinkModal(false);
  };

  const handleUnlinkChat = (chatId: string) => {
    if (!selectedProject) return;
    const updated = {
        ...selectedProject,
        linkedChatIds: selectedProject.linkedChatIds.filter(id => id !== chatId)
    };
    updateProject(updated);
    setSelectedProject(updated);
  };
  
  const handleContinueChat = (id: string) => {
    continueChat(id);
    setView(ViewMode.CHAT);
  };

  const handleStartNewChat = (project: Project) => {
    newChat('', project.name, [], project.id);
    setView(ViewMode.CHAT);
  };

  const handleDeleteConfirm = () => {
    if (showDeleteConfirm) {
        deleteProject(showDeleteConfirm.id);
        setShowDeleteConfirm(null);
        setSelectedProject(null);
    }
  };

  if (!selectedProject) {
    return (
      <>
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-[#050508] custom-scrollbar text-right" dir="rtl">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 md:pb-8">
              <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">מרכז הפרויקטים</h2>
              <button onClick={() => setEditingProject({} as Project)} className="px-6 md:px-8 py-2.5 md:py-3 bg-orange-600 text-white font-black rounded-2xl text-xs shadow-xl hover:bg-orange-500 transition-all active:scale-95 uppercase tracking-widest">פרויקט חדש +</button>
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
        {editingProject && (
          <ProjectCreationModal 
            onClose={() => setEditingProject(null)} 
            projectToEdit={editingProject.id ? editingProject : undefined}
          />
        )}
      </>
    );
  }

  return (
    <>
    <div className="flex-1 overflow-y-auto p-6 lg:p-12 bg-[#050508] custom-scrollbar text-right" dir="rtl">
       <div className="max-w-4xl mx-auto space-y-8">
          <button onClick={() => setSelectedProject(null)} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all font-black text-xs uppercase tracking-widest mb-4">
             <span className="text-xl">←</span>
             <span>חזרה לפרויקטים</span>
          </button>
          
          <div className="glass p-6 md:p-12 rounded-3xl md:rounded-[4rem] border border-white/10 space-y-8 md:space-y-10 shadow-3xl bg-white/[0.01]">
             <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-3 flex-1 min-w-0">
                   <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase break-words">{selectedProject.name}</h2>
                   <p className="text-base md:text-lg text-zinc-300 font-medium italic leading-relaxed break-words">{selectedProject.description}</p>
                </div>
                <div className="flex gap-2 self-end md:self-auto">
                    <button onClick={() => setEditingProject(selectedProject)} className="p-3 md:p-4 bg-white/10 border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all" aria-label="ערוך פרויקט">✏️</button>
                    <button onClick={() => setShowDeleteConfirm(selectedProject)} className="p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all" aria-label="מחק פרויקט">🗑️</button>
                </div>
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
                          <div className="flex items-center gap-2">
                             <button onClick={() => handleContinueChat(chat.id)} className="text-[10px] font-black text-zinc-600 group-hover:text-white uppercase transition-colors">המשך שיחה ←</button>
                             <button onClick={() => handleUnlinkChat(chat.id)} className="text-zinc-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`בטל שיוך של שיחה ${chat.title}`}>✕</button>
                          </div>
                       </div>
                     ) : null;
                   })}
                   {selectedProject.linkedChatIds.length === 0 && <p className="text-xs text-zinc-600 italic py-4">אין שיחות משויכות לפרויקט זה עדיין.</p>}
                </div>
             </div>

             <div className="pt-8 border-t border-white/5">
                <button onClick={() => handleStartNewChat(selectedProject)} className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl rounded-3xl shadow-2xl transition-all italic tracking-tighter">
                   הפעל סוכן בינה לפרויקט ✨
                </button>
             </div>
          </div>
       </div>

       {showLinkModal && (
         <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in" onClick={() => setShowLinkModal(false)}>
            <div ref={linkModalRef} className="max-w-md w-full glass p-10 rounded-[3rem] border border-white/10 space-y-8 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
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
    {editingProject && (
      <ProjectCreationModal 
        onClose={() => setEditingProject(null)}
        projectToEdit={editingProject.id ? editingProject : undefined}
      />
    )}
    {showDeleteConfirm && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in" dir="rtl" onClick={() => setShowDeleteConfirm(null)}>
            <div ref={deleteConfirmRef} className="max-w-md w-full bg-[#2a0a0a] p-10 rounded-[3rem] border-2 border-red-500/50 space-y-6 text-center shadow-[0_0_100px_rgba(239,68,68,0.3)] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="text-5xl">⚠️</div>
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">למחוק את "{showDeleteConfirm.name}"?</h3>
                <p className="text-red-200 leading-relaxed font-medium">הפרויקט וכל המידע המשויך אליו יימחקו לצמיתות. לא ניתן לשחזר פעולה זו.</p>
                <div className="flex gap-4 pt-4">
                    <button onClick={handleDeleteConfirm} className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm">כן, מחק לצמיתות</button>
                    <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs">ביטול</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default ProjectDashboard;
