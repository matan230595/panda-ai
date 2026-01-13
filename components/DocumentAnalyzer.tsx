
import React, { useState, useRef, useEffect } from 'react';
import { analyzeDocument } from '../services/gemini';
import { jsPDF } from 'jspdf';
import { AppSettings } from '../types';
import { translations } from '../utils/translations';

interface DocumentAnalyzerProps {
  appSettings: AppSettings;
}

interface DocFile {
  name: string;
  type: string;
  data: string;
}

const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({ appSettings }) => {
  const [files, setFiles] = useState<DocFile[]>([]);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summarize' | 'translate' | 'extract' | 'chat'>('summarize');
  const [params, setParams] = useState({ summaryType: 'deep', targetLang: 'he', customQuestion: '' });
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []) as File[];
    if (uploadedFiles.length === 0) return;

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
    try {
      if (activeTab === 'chat' && params.customQuestion) {
        const userQ = params.customQuestion;
        setChatHistory(prev => [...prev, { role: 'user', text: userQ }]);
        setParams(p => ({ ...p, customQuestion: '' }));
        
        const output = await analyzeDocument(files, 'chat', params, [...chatHistory, { role: 'user', text: userQ }], appSettings);
        setChatHistory(prev => [...prev, { role: 'assistant', text: output }]);
      } else {
        const output = await analyzeDocument(files, activeTab, params, [], appSettings);
        setResult(output);
        if (activeTab === 'chat') {
           setChatHistory([{ role: 'assistant', text: t.docSuccess }]);
        }
      }
    } catch (err) {
      console.error(err);
      setResult(t.docError);
    } finally {
      setLoading(false);
    }
  };

  const downloadAsPDF = () => {
    const doc = new jsPDF();
    doc.addFont('Heebo', 'normal', 'bold');
    if (isRTL) doc.setR2L(true);
    doc.setFont('Heebo');
    
    const content = activeTab === 'chat' ? chatHistory.map(h => `${h.role === 'user' ? t.clientRequest : 'Panda Agent'}: ${h.text}`).join('\n\n') : result;
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 190, 20, { align: isRTL ? 'right' : 'left' });
    doc.save(`Panda_Analysis_${files[0]?.name || 'document'}.pdf`);
  };

  return (
    <div className={`flex-1 overflow-hidden h-full flex flex-col bg-[#050508] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="p-6 md:p-8 shrink-0 border-b border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div className={isRTL ? "text-right" : "text-left"}>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none glow-text">{t.docTitle}</h2>
            <p className="text-zinc-600 text-[9px] font-black tracking-[0.4em] uppercase mt-2">{t.docSubtitle}</p>
          </div>
          <div className="flex gap-3">
             {files.length > 0 && (
               <button onClick={downloadAsPDF} className="px-6 py-2.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all">
                 {t.exportPDF}
               </button>
             )}
             <button onClick={() => setFiles([])} className="px-6 py-2.5 bg-white/5 border border-white/10 text-zinc-400 rounded-xl text-[10px] font-black uppercase hover:text-white transition-all">
               {t.clearAll}
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Controls & Uploads */}
        <div className="w-full lg:w-[400px] p-6 border-l border-white/5 bg-[#08080f] overflow-y-auto custom-scrollbar shrink-0">
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest block pr-2">{t.workMode}</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'summarize', label: t.modeSummarize, icon: '📝' },
                  { id: 'translate', label: t.modeTranslate, icon: '🌐' },
                  { id: 'extract', label: t.modeExtract, icon: '🔍' },
                  { id: 'chat', label: t.modeChat, icon: '💬' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${activeTab === tab.id ? 'bg-orange-600 border-orange-400 text-white shadow-lg' : 'bg-white/5 border-transparent text-zinc-500 hover:text-white'}`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="text-[10px] font-black uppercase">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block pr-2">{t.loadedFiles} ({files.length}/3)</label>
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-[11px] font-bold italic text-zinc-300">
                    <span className="truncate max-w-[200px]">{f.name}</span>
                    <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-red-500">✕</button>
                  </div>
                ))}
                {files.length < 3 && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-zinc-500 hover:text-white transition-all uppercase"
                  >
                    {t.addFile}
                  </button>
                )}
                <input ref={fileInputRef} type="file" multiple accept="application/pdf,image/*" className="hidden" onChange={handleFileUpload} />
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleProcess}
                disabled={files.length === 0 || loading}
                className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl rounded-3xl shadow-2xl transition-all active:scale-95 italic disabled:opacity-30"
              >
                {loading ? t.analyzing : activeTab === 'chat' && chatHistory.length > 0 ? t.sendQuestion : t.analyzeBtn}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Results / Chat / Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
          {activeTab === 'chat' && chatHistory.length > 0 ? (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar pb-32">
                {chatHistory.map((h, i) => (
                  <div key={i} className={`flex ${h.role === 'user' ? 'justify-start' : 'justify-end'} animate-in fade-in`}>
                     <div className={`max-w-[85%] p-6 rounded-3xl ${h.role === 'user' ? 'bg-white/5 border border-white/10' : 'bg-orange-600/10 border border-orange-500/20'} shadow-xl`}>
                        <div className="text-[9px] font-black uppercase text-zinc-600 mb-2">{h.role === 'user' ? t.clientRequest : 'Panda Doc Agent'}</div>
                        <div className="text-zinc-200 text-[15px] leading-relaxed italic font-medium">{h.text}</div>
                     </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-end pulse-ai">
                     <div className="bg-orange-600/5 p-4 rounded-2xl text-[10px] font-black text-orange-500 italic uppercase">{t.agentProcessing}</div>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
                 <div className="max-w-3xl mx-auto flex gap-4 bg-[#0a0a14] p-3 rounded-2xl border border-white/10 shadow-3xl">
                    <input 
                      value={params.customQuestion}
                      onChange={e => setParams({...params, customQuestion: e.target.value})}
                      placeholder={t.askDocument}
                      className="flex-1 bg-transparent border-none outline-none text-white text-sm font-medium italic pr-4"
                      onKeyDown={e => { if(e.key === 'Enter') handleProcess(); }}
                    />
                    <button onClick={handleProcess} className="px-6 py-2 bg-orange-600 text-white font-black text-[10px] rounded-xl hover:bg-orange-500 transition-all uppercase">{t.sendQuestion}</button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
              <div className="max-w-4xl mx-auto">
                 {result ? (
                   <div className="glass p-12 rounded-[3.5rem] border border-white/10 bg-white/[0.01] shadow-3xl min-h-[500px] animate-in slide-in-from-bottom-4">
                      <div className="text-zinc-200 text-lg leading-relaxed font-medium italic whitespace-pre-wrap">{result}</div>
                   </div>
                 ) : (
                   <div className="h-[600px] flex flex-col items-center justify-center space-y-8 opacity-20">
                      <div className="text-[120px] filter grayscale">📄</div>
                      <div className="text-center space-y-2">
                        <p className="text-xl font-black uppercase tracking-[0.5em]">{t.readyForAnalysis}</p>
                        <p className="text-xs font-bold italic">{t.uploadInstruction}</p>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;
