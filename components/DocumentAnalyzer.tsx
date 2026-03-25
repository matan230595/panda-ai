
import React, { useState, useRef, useEffect } from 'react';
import { analyzeDocument } from '../services/gemini';
import { ViewMode } from '../types';
import { translations } from '../utils/translations';
import { useUI, useAppSettings, useApi } from '../contexts/AppContext';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface DocFile {
  name: string;
  type: string;
  data: string;
}

interface DocSessionState {
  files: DocFile[];
  chatHistory: { role: 'user' | 'assistant'; text: string }[];
  result: string;
}

const DocumentAnalyzer: React.FC = () => {
  const { appSettings } = useAppSettings();
  const { setView } = useUI();
  const { apiConfigs } = useApi();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summarize' | 'translate' | 'extract' | 'chat'>('summarize');
  const [params, setParams] = useState({ summaryType: 'deep', targetLang: 'English', customQuestion: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sessionState, setSessionState] = useState<DocSessionState>(() => {
    try {
      const saved = sessionStorage.getItem('doc_analyzer_session');
      return saved ? JSON.parse(saved) : { files: [], chatHistory: [], result: '' };
    } catch {
      return { files: [], chatHistory: [], result: '' };
    }
  });

  useEffect(() => {
    sessionStorage.setItem('doc_analyzer_session', JSON.stringify(sessionState));
  }, [sessionState]);

  const { files, chatHistory, result } = sessionState;

  const updateFiles = (updater: (prevFiles: DocFile[]) => DocFile[]) => {
    setSessionState(prev => ({ ...prev, files: updater(prev.files) }));
  };
  const updateChatHistory = (updater: (prevHistory: any[]) => any[]) => {
    setSessionState(prev => ({ ...prev, chatHistory: updater(prev.chatHistory) }));
  };
  const updateResult = (newResult: string) => {
    setSessionState(prev => ({ ...prev, result: newResult }));
  };

  // UX FIX: Added a function to completely reset the component's state,
  // allowing the user to start a new analysis session without leaving the page.
  const handleClearSession = () => {
    setSessionState({ files: [], chatHistory: [], result: '' });
    sessionStorage.removeItem('doc_analyzer_session');
  };

  const t = translations.he;

  const addFiles = (uploadedFiles: File[]) => {
    uploadedFiles.forEach(uploadedFile => {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateFiles(prev => [...prev, {
          name: uploadedFile.name,
          type: uploadedFile.type,
          data: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(uploadedFile);
    });
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files || []));
  };
  
  const getFileIcon = (fileType: string) => {
      if (fileType.includes('pdf')) return '📄';
      if (fileType.startsWith('image/')) return '🖼️';
      if (fileType.startsWith('text/')) return '📝';
      return '📁';
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setLoading(true);
    updateResult('');
    try {
      if (activeTab === 'chat') {
        const userQ = params.customQuestion || "מה תוכן המסמכים האלו?";
        const currentChatHistory = [...chatHistory, { role: 'user', text: userQ }];
        updateChatHistory(() => currentChatHistory);
        const output = await analyzeDocument(files, 'chat', params, currentChatHistory, appSettings, apiConfigs);
        updateChatHistory(prev => [...prev, { role: 'assistant', text: output }]);
        setParams(p => ({ ...p, customQuestion: '' }));
      } else {
        const output = await analyzeDocument(files, activeTab, params, [], appSettings, apiConfigs);
        updateResult(output);
      }
    } catch (err) {
      updateResult("שגיאה בתקשורת עם המודל. אנא וודא שהקבצים אינם גדולים מדי.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'summarize', label: t.toolSummarize },
    { id: 'translate', label: t.toolTranslate },
    { id: 'extract', label: t.toolExtract },
    { id: 'chat', label: t.toolChat },
  ];

  const renderTaskInputs = () => {
    switch (activeTab) {
      case 'summarize':
        return (
          <div className="flex gap-2">
            <button onClick={() => setParams({...params, summaryType: 'deep'})} className={`px-4 py-2 text-xs rounded-lg ${params.summaryType === 'deep' ? 'bg-orange-600' : 'bg-white/5'}`}>סיכום עומק</button>
            <button onClick={() => setParams({...params, summaryType: 'key_points'})} className={`px-4 py-2 text-xs rounded-lg ${params.summaryType === 'key_points' ? 'bg-orange-600' : 'bg-white/5'}`}>נקודות מפתח</button>
          </div>
        );
      case 'translate':
        return (
          <select value={params.targetLang} onChange={e => setParams({...params, targetLang: e.target.value})} className="bg-white/5 p-2 rounded-lg text-xs">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        );
      case 'extract':
      case 'chat':
        return (
            <input 
              value={params.customQuestion} 
              onChange={e => setParams({...params, customQuestion: e.target.value})}
              placeholder={activeTab === 'chat' ? 'שאל משהו על המסמכים...' : 'מה לחלץ? למשל: "את כל מספרי הטלפון"'}
              className="w-full bg-black/40 p-3 rounded-lg text-xs text-white border border-white/10"
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleProcess())}
            />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#050508] custom-scrollbar text-right" dir="rtl">
      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 pb-32 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-8 gap-4">
           <div className="flex items-center gap-4 md:gap-6">
              <button onClick={() => setView(ViewMode.DASHBOARD)} className="px-4 md:px-6 py-2 md:py-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white hover:bg-orange-600 transition-all font-bold text-xs shadow-lg">← חזור</button>
              <div className="space-y-1 md:space-y-2">
                 <h2 className="text-2xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">ניתוח מסמכים חכם</h2>
                 <p className="text-zinc-500 text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.5em] uppercase">העלה קבצים וקבל תובנות עומק בשניות</p>
              </div>
           </div>
           <button onClick={handleClearSession} className="px-4 md:px-6 py-2 md:py-2.5 bg-white/5 border border-white/10 text-zinc-400 rounded-xl text-[10px] font-black uppercase hover:text-white transition-all w-full sm:w-auto">נקה הכל</button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
                <h3 className="text-lg font-black text-white uppercase italic tracking-wider">{t.uploadDocs}</h3>
                <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()} className="p-8 glass rounded-[3rem] border-2 border-dashed border-white/10 h-64 flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all">
                    <div className="text-6xl mb-4">📤</div>
                    <p className="font-bold text-zinc-400">גרור קבצים לכאן או לחץ להעלאה</p>
                    <p className="text-xs text-zinc-600 mt-2">(PDF, TXT, JPG, PNG)</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden"/>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {files.map((f, i) => (
                        <div key={i} className="bg-white/5 p-3 rounded-lg flex items-center justify-between text-xs">
                           <span className="truncate pr-2">{getFileIcon(f.type)} {f.name}</span>
                           <button onClick={() => updateFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 shrink-0">x</button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-8 space-y-6">
                <div className="flex flex-wrap gap-2 bg-black/30 p-2 rounded-2xl border border-white/5">
                   {tabs.map(tab => (
                       <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[80px] py-2 md:py-3 text-xs font-black rounded-xl transition-all ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>{tab.label}</button>
                   ))}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-black/30 p-3 rounded-2xl border border-white/5">
                   {renderTaskInputs()}
                   <button onClick={handleProcess} disabled={loading || files.length === 0} className="px-6 py-3 bg-orange-600 rounded-xl text-xs font-black text-white hover:bg-orange-500 disabled:bg-zinc-700 disabled:cursor-not-allowed whitespace-nowrap w-full sm:w-auto">
                       {loading ? t.analyzing : t.startAnalysis}
                   </button>
                </div>

                <div className="p-6 bg-black/40 rounded-2xl min-h-[300px] border border-white/10 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {loading && <div className="text-center text-zinc-500">מעבד...</div>}
                    {activeTab === 'chat' ? (
                        <div className="space-y-6">
                           {chatHistory.map((msg, i) => (
                             <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                 <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${msg.role === 'user' ? 'bg-[#333]' : 'bg-transparent border border-white/10'}`}>
                                     {msg.role === 'user' ? '👤' : '🐼'}
                                 </div>
                                 <div className={`px-4 py-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-[#262626]' : 'bg-[#18181b]'}`}>
                                     <div className="markdown-content" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(marked.parse(msg.text) as string)}}/>
                                 </div>
                             </div>
                           ))}
                        </div>
                    ) : (
                        <div className="markdown-content whitespace-pre-wrap text-white" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(marked.parse(result) as string)}}/>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;