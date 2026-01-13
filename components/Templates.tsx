
import React, { useState } from 'react';
import { AppSettings, ViewMode } from '../types';
import { translations } from '../utils/translations';

interface TemplatesProps {
  onSelectPrompt: (prompt: string, title: string) => void;
  appSettings: AppSettings;
  setView: (v: ViewMode) => void;
}

const Templates: React.FC<TemplatesProps> = ({ onSelectPrompt, appSettings, setView }) => {
  const t = translations.he;
  const [activeCategory, setActiveCategory] = useState(t.catAll);

  const categories = [t.catAll, t.catCode, t.catMarketing, t.catBiz, t.catDesign, t.catData, t.catStudy, t.catPersonal];
  const templates = t.templateList;

  const filtered = activeCategory === t.catAll ? templates : templates.filter(t => t.category === activeCategory);

  return (
    <div className={`flex-1 overflow-y-auto p-6 lg:p-12 bg-[#050508] custom-scrollbar animate-in text-right`} dir="rtl">
       <div className="max-w-7xl mx-auto space-y-12 pb-24">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b border-white/5 pb-10 gap-8">
             <div className="flex items-center gap-6">
                <button onClick={() => setView(ViewMode.DASHBOARD)} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-orange-600 transition-all font-bold text-xs shadow-lg">← חזור</button>
                <div className="space-y-3">
                   <div className="flex items-center gap-4">
                      <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">ספריית תבניות</h2>
                      <div className="px-4 py-1 bg-orange-600 text-white rounded-full text-xs font-black italic shadow-lg animate-pulse">
                         {t.totalTemplates} {templates.length}
                      </div>
                   </div>
                   <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] italic text-right">בחר קיצור דרך והתחל לעבוד עם המנוע הכי חזק בעולם</p>
                </div>
             </div>
             <div className="flex flex-wrap gap-2 justify-end">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${activeCategory === cat ? 'bg-orange-600 border-orange-400 text-white shadow-xl scale-105' : 'bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:border-white/20'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filtered.map((item, i) => (
               <button 
                 key={i}
                 onClick={() => onSelectPrompt(item.prompt, item.title)}
                 className={`group text-right p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:border-orange-500/30 hover:bg-white/[0.03] transition-all duration-500 relative flex flex-col h-full shadow-lg`}
               >
                  <div className="flex items-center justify-between mb-8">
                     <div className="text-3xl bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-orange-600/10 transition-all shadow-inner">{item.icon}</div>
                     <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest border border-white/5 px-2.5 py-1.5 rounded-xl bg-black/20">{item.category}</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 group-hover:text-orange-400 transition-colors uppercase italic">{item.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed flex-1 italic font-medium text-right">{item.desc}</p>
               </button>
             ))}
          </div>
       </div>
    </div>
  );
};

export default Templates;
