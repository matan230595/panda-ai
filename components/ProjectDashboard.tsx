
import React from 'react';
import { Project, AppSettings } from '../types';
import { translations } from '../utils/translations';

interface ProjectDashboardProps {
  projects: Project[];
  project?: Project;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onBack: () => void;
  onStartChat: (projectId: string) => void;
  onNewProject: () => void;
  appSettings: AppSettings;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, project, onDeleteProject, onBack, onStartChat, onNewProject, appSettings }) => {
  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';

  if (!project) {
    return (
      <div className={`flex-1 overflow-y-auto p-6 lg:p-12 bg-[#050508] custom-scrollbar animate-in ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex justify-between items-center border-b border-white/10 pb-8">
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{t.projectsSpace}</h2>
            <button onClick={onNewProject} className="px-8 py-3 bg-orange-600 text-white font-black rounded-2xl text-xs shadow-xl hover:bg-orange-500 transition-all active:scale-95 uppercase tracking-widest">{t.newProjectBtn}</button>
          </div>

          {projects.length === 0 ? (
            <div className="py-32 text-center glass rounded-[3rem] border border-dashed border-white/10 opacity-30 flex flex-col items-center">
               <div className="text-8xl mb-8">📁</div>
               <p className="text-lg font-black text-white uppercase tracking-widest italic">{t.noProjects}</p>
               <p className="text-xs text-zinc-500 mt-2 font-bold uppercase">{t.startWorkspace}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {projects.map(p => (
                 <div key={p.id} className="premium-card p-8 rounded-[2.5rem] flex flex-col gap-6 relative group shadow-2xl bg-white/[0.01]">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }} 
                      className="absolute top-6 left-6 text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-xl"
                    >
                      ✕
                    </button>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl shadow-inner">📁</div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{p.name}</h3>
                       <p className="text-xs text-zinc-500 font-bold leading-relaxed line-clamp-3 italic">
                         {p.description || t.noDesc}
                       </p>
                    </div>
                    <div className="pt-4 mt-auto border-t border-white/5 flex flex-col gap-3">
                       <button 
                        onClick={() => onStartChat(p.id)}
                        className="w-full py-3.5 bg-orange-600/10 border border-orange-500/20 rounded-xl text-[11px] font-black text-white hover:bg-orange-600 transition-all uppercase tracking-widest"
                       >
                        {t.openWorkspace}
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto p-6 lg:p-12 bg-[#050508] custom-scrollbar ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
       <div className="max-w-4xl mx-auto space-y-8">
          <button onClick={onBack} className="flex items-center gap-3 text-zinc-400 hover:text-white transition-all font-black text-xs uppercase tracking-widest mb-4">
             <span className="text-xl">←</span>
             <span>{t.backToProjects}</span>
          </button>
          
          <div className="glass p-12 rounded-[4rem] border border-white/10 space-y-10 shadow-3xl bg-gradient-to-br from-white/[0.02] to-transparent">
             <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-3">
                   <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">{project.name}</h2>
                   <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[9px] font-black text-zinc-500 uppercase tracking-widest">{t.projectHub}</span>
                      <span className="text-[10px] text-zinc-600 font-bold">{t.createdOn}: {new Date(project.createdAt).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}</span>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-orange-500/30 transition-all text-xl">⚙️</button>
                   <button className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-red-500/30 transition-all text-xl">🗑️</button>
                </div>
             </div>

             <div className="p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 space-y-4">
                <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">{t.projectDesc}</h4>
                <p className="text-lg text-zinc-300 font-medium leading-relaxed italic">{project.description || t.noDesc}</p>
             </div>

             <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row gap-6">
                <button onClick={() => onStartChat(project.id)} className="flex-1 py-6 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl rounded-3xl shadow-2xl transition-all active:scale-95 italic">{t.startStratChat}</button>
                <button className="px-10 py-6 bg-white/5 border border-white/10 rounded-3xl text-zinc-400 hover:text-white font-black text-xs uppercase tracking-widest transition-all">{t.uploadKnowledge}</button>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ProjectDashboard;
