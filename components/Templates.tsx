
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { translations } from '../utils/translations';

interface TemplatesProps {
  onSelectPrompt: (prompt: string, title: string) => void;
  appSettings: AppSettings;
}

const Templates: React.FC<TemplatesProps> = ({ onSelectPrompt, appSettings }) => {
  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';
  const [activeCategory, setActiveCategory] = useState(t.catAll);

  const categories = [t.catAll, t.catCode, t.catMarketing, t.catBiz, t.catDesign, t.catData, t.catStudy, t.catPersonal];

  // Mapping category keys to the translation values to filter correctly
  const catMap: Record<string, string> = {
    'All': t.catAll,
    'פיתוח וקוד': t.catCode,
    'שיווק ותוכן': t.catMarketing,
    'עסקי': t.catBiz,
    'עיצוב ו-UX': t.catDesign,
    'דאטה וניתוח': t.catData,
    'לימודים': t.catStudy,
    'אישי': t.catPersonal
  };

  const templates = [
    // --- פיתוח וקוד ---
    {
      category: t.catCode,
      icon: '🐛',
      title: 'ניתוח ותיקון באגים / Debugging',
      prompt: "Analyze this code deeply. Find potential bugs (edge cases included), improve time/space complexity, and write the cleanest corrected version.",
      desc: "איתור שגיאות, שיפור ביצועים וניקוי קוד."
    },
    {
      category: t.catCode,
      icon: '⚛️',
      title: 'React Component Generator',
      prompt: "Create a modern React component (TS + Tailwind). Ensure A11y, error handling, and optimal performance. Use Hooks correctly.",
      desc: "בניית רכיבי UI מודרניים ונגישים."
    },
    // --- שיווק ותוכן ---
    {
      category: t.catMarketing,
      icon: '🚀',
      title: 'Viral LinkedIn Post',
      prompt: "Write a viral, professional LinkedIn post about: [Topic]. Use a strong Hook, provide value, and end with a CTA. Maintain readability.",
      desc: "כתיבת תוכן שיווקי לרשתות חברתיות."
    },
    // --- עסקי ---
    {
      category: t.catBiz,
      icon: '💼',
      title: 'Cold Email to Investor',
      prompt: "Write a cold email to a potential investor. Short, respectful, intriguing. Goal: Meeting. Subject: [Topic].",
      desc: "ניסוח מיילים עסקיים קרים וחמים."
    },
    // --- עיצוב ו-UX ---
    {
      category: t.catDesign,
      icon: '✒️',
      title: 'UX Microcopy',
      prompt: "Write UX Microcopy for [Screen/Action]. Error messages, success states, button labels. Clear, human, short. 3 options each.",
      desc: "כתיבת טקסטים לממשק משתמש."
    },
  ];

  const filtered = activeCategory === t.catAll ? templates : templates.filter(t => t.category === activeCategory);

  return (
    <div className={`flex-1 overflow-y-auto p-6 lg:p-12 bg-[#050508] custom-scrollbar animate-in ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
       <div className="max-w-7xl mx-auto space-y-12 pb-20">
          
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b border-white/5 pb-8 gap-6">
             <div className="space-y-2">
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{t.libTitle}</h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{t.libSubtitle}</p>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${activeCategory === cat ? 'bg-orange-600 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'}`}
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
                 className={`group ${isRTL ? 'text-right' : 'text-left'} p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-orange-500/30 hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden flex flex-col h-full`}
               >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center justify-between mb-6">
                     <div className="text-3xl bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform shadow-inner">{item.icon}</div>
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest border border-white/5 px-2 py-1 rounded-lg bg-black/20">{item.category}</span>
                  </div>
                  
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-orange-400 transition-colors">{item.title}</h3>
                  <p className={`text-xs text-zinc-400 leading-relaxed flex-1 mb-6 border-white/5 ${isRTL ? 'pl-1 border-l pr-3' : 'pr-1 border-r pl-3'}`}>{item.desc}</p>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between w-full mt-auto">
                     <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-white transition-colors">{t.clickToLaunch}</span>
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <span className={`text-lg transition-transform ${isRTL ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'}`}>{isRTL ? '←' : '→'}</span>
                     </div>
                  </div>
               </button>
             ))}
          </div>
       </div>
    </div>
  );
};

export default Templates;
