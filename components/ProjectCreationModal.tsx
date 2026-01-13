
import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectCreationModalProps {
  onClose: () => void;
  onCreate: (project: Project) => void;
}

const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState('React / Next.js');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      environment: {
        framework,
        libraries: [],
        target: 'web'
      },
      files: [],
      createdAt: new Date().toISOString()
    };
    
    onCreate(newProject);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
      <div className="max-w-xl w-full glass p-10 rounded-[3rem] border border-white/10 shadow-3xl space-y-8 animate-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">צור <span className="text-indigo-500">פרויקט חדש</span></h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pr-2">שם הפרויקט</label>
            <input 
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 ring-indigo-500/20 text-lg font-bold"
              placeholder="למשל: אפליקציית פנדה החדשה"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pr-2">תיאור ומטרות</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 ring-indigo-500/20 h-24 resize-none font-medium"
              placeholder="תאר מה הפרויקט עושה ומה המטרות שלך..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pr-2">סביבת פיתוח</label>
            <select 
              value={framework}
              onChange={e => setFramework(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:ring-2 ring-indigo-500/20 appearance-none font-bold"
            >
              <option>React / Next.js</option>
              <option>Mobile App (React Native)</option>
              <option>E-commerce Solution</option>
              <option>Landing Page / UI Kit</option>
              <option>Fullstack App</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl transition-all active:scale-95"
          >
            צור פרויקט והתחל לעבוד 🚀
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreationModal;
