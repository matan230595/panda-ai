
import React, { useState, useRef } from 'react';
import { analyzeDocument } from '../services/gemini';
import { AppSettings } from '../types';
import { translations } from '../utils/translations';

interface DocumentAnalyzerProps {
  appSettings: AppSettings;
  onBack: () => void;
}

interface DocFile {
  name: string;
  type: string;
  data: string;
}

const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({ appSettings, onBack }) => {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summarize' | 'translate' | 'extract' | 'chat'>('summarize');
  const [params, setParams] = useState({ summaryType: 'deep', targetLang: 'he', customQuestion: '' });
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations.he;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []) as File[];
    uploadedFiles.forEach(uploadedFile => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFiles(prev => [...prev, {
          name: uploadedFile.name,
          type: uploadedFile.type,
          data: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(uploadedFile);
    });
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setResult('');
    try {
      if (activeTab === 'chat') {
        const userQ = params.customQuestion || "מה תוכן המסמכים האלו?";
        setChatHistory(prev => [...prev, { role: 'user', text: userQ }]);
        const output = await analyzeDocument(files, 'chat', params, chatHistory, appSettings);
        setChatHistory(prev => [...prev, { role: 'assistant', text: output }]);
        setParams(p => ({ ...p, customQuestion: '' }));
      } else {
        const output = await analyzeDocument(files, activeTab, params, [], appSettings);
        setResult(output);
      }
    } catch (err) {
      setResult("שגיאה בתקשורת עם המודל. אנא וודא שהקבצים אינם גדולים מדי.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#050508] custom-scrollbar text-right" dir="rtl">
      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 pb-32 animate-in fade-in duration-700">
        <div className="flex justify-between items-center border-b border-white/5 pb-8">
           <div className="flex items-center gap-6">
              <button onClick={onBack} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-orange-600 transition-all font-bold text-xs shadow-lg">← חזור</button>
              <div className="space-y-2">
                 <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">ניתוח מסמכים חכם</h2>
                 <p className="text-zinc-500 text-[10px] font-black tracking-[0.5em] uppercase">העלה קבצים וקבל תובנות עומק בשניות</p>
              </div>
           </div>
           <button onClick={() => {setFiles([]); setResult(''); setChatHistory([]);}} className="px-6 py-2.5 bg-white/5 border border-white/10 text-zinc-400 rounded-xl text-[10px] font-black uppercase hover:text-white transition-all">נקה הכל</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
           <div className="lg:col-span-4 space-y-6">
              <div className="glass p-10 rounded-[3.5rem] border border-white/10 bg-white/[0.01] space-y-10 shadow-3xl">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest block pr-2">בחר כלי עבודה</label>
                    <div className="grid grid-cols-2 gap-3">
                       {[
                         { id: 'summarize', label: 'סיכום עומק', icon: '📝' },
                         { id: 'translate', label: 'תרגום מקצועי', icon: '🌐' },
                         { id: 'extract', label: 'חילוץ נתונים', icon: '🔍' },
                         { id: 'chat', label: 'שיחה חופשית', icon: '💬' }
                       ].map(tab => (
                         <button 
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id as any)}
                           className={`flex flex-col items-center gap-3 p-5 rounded-3xl border transition-all ${activeTab === tab.id ? 'bg-orange-600 border-orange-400 text-white shadow-xl' : 'bg-white/5 border-transparent text-zinc-500 hover:text-white hover:bg-white/10'}`}
                         >
                            <span className="text-2xl">{tab.icon}</span>
                            <span className="text-[10px] font-black uppercase">{tab.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block pr-2">מסמכים להעלאה ({files.length})</label>
                    <div className="space-y-2">
                       {files.map((f, i) => (
                         <div key={i} className="p-4 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-between text-xs font-bold text-zinc-300 italic group text-right">
                            <span className="truncate max-w-[180px]">{f.name}</span>
                            <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                         </div>
                       ))}
                       <button onClick={() => fileInputRef.current?.click()} className="w-full py-5 bg-white/5 border border-dashed border-white/10 rounded-3xl text-[10px] font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest">
                          הוסף קובץ חדש +
                       </button>
                       <input ref={fileInputRef} type="file" multiple accept="application/pdf,image/*,text/plain" className="hidden" onChange={handleFileUpload} />
                    </div>
                 </div>

                 <button 
                   onClick={handleProcess}
                   disabled={files.length === 0 || loading}
                   className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl rounded-[2.5rem] shadow-3xl transition-all active:scale-95 italic disabled:opacity-20"
                 >
                   {loading ? 'מבצע ניתוח...' : 'התחל ניתוח 🚀'}
                 </button>
              </div>
           </div>

           <div className="lg:col-span-8 flex flex-col gap-8 h-full min-h-[600px]">
              <div className="glass p-12 rounded-[4rem] border border-white/10 bg-white/[0.01] shadow-3xl flex flex-col h-full relative overflow-hidden">
                 <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                    <div className="w-10 h-10 bg-orange-600/10 rounded-xl flex items-center justify-center text-xl">🧠</div>
                    <h3 className="text-[12px] font-black text-white uppercase tracking-widest italic">Neural Insights Report</h3>
                 </div>
                 
                 {activeTab === 'chat' ? (
                   <div className="flex-1 flex flex-col gap-6">
                      <div className="flex-1 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar p-2">
                        {chatHistory.map((h, i) => (
                          <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] p-6 rounded-[2.5rem] ${h.role === 'user' ? 'bg-orange-600/10 border-orange-500/20 rounded-tl-none' : 'bg-white/5 border border-white/10 rounded-tr-none'}`}>
                                <div className="text-[9px] font-black uppercase text-zinc-600 mb-2">{h.role === 'user' ? 'השאלה שלך' : 'ניתוח פנדה'}</div>
                                <div className="text-zinc-200 text-base font-medium italic leading-relaxed text-right">{h.text}</div>
                              </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 p-2 bg-black/40 rounded-3xl border border-white/5 mt-4">
                         <input 
                           value={params.customQuestion}
                           onChange={e => setParams({...params, customQuestion: e.target.value})}
                           placeholder="שאל שאלה ספציפית על המסמכים שלך..."
                           className="flex-1 bg-transparent p-4 text-white text-sm outline-none font-medium italic text-right"
                           onKeyDown={e => e.key === 'Enter' && handleProcess()}
                         />
                         <button onClick={handleProcess} className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-black text-xs shadow-lg">שאל ⚡</button>
                      </div>
                   </div>
                 ) : (
                   <div className="flex-1">
                      {result ? (
                         <div className="text-zinc-200 text-xl leading-relaxed font-medium italic whitespace-pre-wrap animate-in fade-in duration-1000 text-right">
                            {result}
                         </div>
                      ) : (
                         <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-10 py-20">
                            <span className="text-[180px] block animate-pulse">📄</span>
                            <p className="text-3xl font-black uppercase tracking-[0.8em] text-white">Neural Scan</p>
                         </div>
                      )}
                      {loading && !result && (
                         <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20 space-y-6">
                            <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-white font-black uppercase italic tracking-widest text-sm animate-pulse">סורק נתונים ומבצע אינטגרציה...</div>
                         </div>
                      )}
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;
