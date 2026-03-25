
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { useProjects } from '../contexts/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ProjectCreationModalProps {
  onClose: () => void;
  projectToEdit?: Project;
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({ onClose, projectToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  
  const { newProject, updateProject } = useProjects();
  const modalRef = useFocusTrap<HTMLDivElement>();

  const isEditing = !!projectToEdit;

  useEffect(() => {
    if (isEditing) {
      setName(projectToEdit.name || '');
      setDescription(projectToEdit.description || '');
      setIcon(projectToEdit.icon || '📁');
    }
  }, [projectToEdit, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (isEditing) {
      const updatedProject: Project = {
        ...projectToEdit,
        name,
        description,
        icon,
      };
      updateProject(updatedProject);
    } else {
      const project: Project = {
        id: `proj-${Date.now()}`,
        name,
        description,
        icon,
        files: [],
        linkedChatIds: [],
        createdAt: new Date().toISOString()
      };
      newProject(project);
    }
    onClose();
  };

  const icons = ['📁', '📊', '🚀', '🎨', '💼', '🏢', '🏗️', '🤖'];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in" dir="rtl" onClick={onClose}>
      <div ref={modalRef} className="max-w-xl w-full glass p-10 rounded-[3rem] border border-white/10 shadow-3xl space-y-8 animate-in zoom-in-95 text-right" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{isEditing ? 'ערוך פרויקט' : 'צור פרויקט חדש'} 🐼</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors text-2xl" aria-label="סגור חלון">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pr-2">אייקון פרויקט</label>
            <div className="flex gap-2">
               {icons.map(i => (
                 <button key={i} type="button" onClick={() => setIcon(i)} className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${icon === i ? 'bg-orange-600 border-orange-400' : 'bg-white/5 border-white/10'}`} aria-label={`בחר אייקון ${i}`}>{i}</button>
               ))}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="projectName" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pr-2">שם הפרויקט</label>
            <input id="projectName" autoFocus value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 ring-orange-500/20 text-lg font-bold" placeholder="למשל: קמפיין שיווק 2026" />
          </div>
          <div className="space-y-2">
            <label htmlFor="projectDesc" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pr-2">תיאור ומטרות</label>
            <textarea id="projectDesc" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 ring-orange-500/20 h-24 resize-none font-medium" placeholder="תאר את הפרויקט..." />
          </div>
          <button type="submit" className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl rounded-2xl shadow-xl transition-all active:scale-95 uppercase italic">
            {isEditing ? 'שמור שינויים' : 'צור פרויקט והתחל לעבוד 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreationModal;
