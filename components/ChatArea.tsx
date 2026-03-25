
import React, { useState, useRef, useEffect } from 'react';
import { AIModelMode, ChatMessage, ViewMode, AIEngine } from '../types';
import { getGeminiResponse } from '../services/gemini';
import { translations } from '../utils/translations';
import AgentMind from './AgentMind';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useChat, useUI, useAppSettings, useApi, useProjects } from '../contexts/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

const CodePreview = ({ code, lang, onClose }: { code: string; lang: string; onClose: () => void; }) => {
    const codeRef = useRef<HTMLElement>(null);
    const modalRef = useFocusTrap<HTMLDivElement>();

    useEffect(() => {
        if (codeRef.current && (window as any).hljs) {
            codeRef.current.textContent = code;
            (window as any).hljs.highlightElement(codeRef.current);
        }
    }, [code, lang]);

    const lines = code.split('\n');

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md" onClick={onClose} role="dialog" aria-modal="true">
          <div ref={modalRef} className="w-full max-w-5xl h-[85vh] bg-[#1e1e1e] rounded-[2rem] border border-white/10 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1e1e1e] rounded-t-[2rem]">
              <span className="text-sm font-bold text-white">{translations.he.preview}</span>
              <button onClick={onClose} className="text-zinc-500 hover:text-white px-4 py-2 bg-white/5 rounded-lg font-bold">✕ {translations.he.close}</button>
            </div>
            <div className="flex-1 relative overflow-hidden">
                <div className="flex text-xs font-mono h-full w-full overflow-auto custom-scrollbar" dir="ltr">
                    <div className="text-zinc-600 p-4 select-none text-right sticky left-0 bg-[#1e1e1e] z-10">
                        {lines.map((_, i) => ( <div key={i}>{i + 1}</div> ))}
                    </div>
                    <pre className="flex-1">
                        <code ref={codeRef} className={`language-${lang || 'plaintext'} p-4 block`}>
                        </code>
                    </pre>
                </div>
            </div>
          </div>
        </div>
    );
};


const ChatArea: React.FC = () => {
  const { activeSession, newChat, updateSession } = useChat();
  const { setView, setIsSidebarOpen, showToast } = useUI();
  const { appSettings } = useAppSettings();
  const { apiConfigs } = useApi();
  const { projects } = useProjects();
  const project = projects.find(p => p.id === activeSession?.projectId);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AIModelMode>(AIModelMode.STANDARD);
  const [engine, setEngine] = useState<AIEngine>({ provider: 'gemini', model: 'gemini-3-flash-preview' });
  const [showEngineSelector, setShowEngineSelector] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [previewCode, setPreviewCode] = useState<{ code: string; lang: string } | null>(null);
  const [attachments, setAttachments] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations.he;
  const d = appSettings.dynamicContent;
  const userName = appSettings.userBio?.split(' ')[0] || t.guest;

  const hasPoeKey = apiConfigs.some(api => api.provider === 'poe' && api.apiKey && api.apiKey.trim() !== '');
  const hasHuggingFaceKey = apiConfigs.some(api => api.provider === 'huggingface' && api.apiKey && api.apiKey.trim() !== '');
  const hasGroqKey = apiConfigs.some(api => api.provider === 'groq' && api.apiKey && api.apiKey.trim() !== '');
  const hasMistralKey = apiConfigs.some(api => api.provider === 'mistral' && api.apiKey && api.apiKey.trim() !== '');

  const poeModels = [
      { id: 'claude-3-opus', name: 'Claude 3 Opus' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'llama-3-70b', name: 'Llama 3 70B' },
      { id: 'Google-PaLM-2-Bison-32k', name: 'Google PaLM 2' },
  ];
  
  const huggingFaceModels = [
      { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'Llama 3 8B' },
      { id: 'mistralai/Mistral-7B-Instruct-v0.2', name: 'Mistral 7B' },
      { id: 'google/gemma-7b-it', name: 'Gemma 7B' },
      { id: 'microsoft/Phi-3-mini-4k-instruct', name: 'Phi-3 Mini' },
      { id: 'codellama/CodeLlama-7b-hf', name: 'CodeLlama 7B' },
  ];
  
  const groqModels = [
      { id: 'llama3-70b-8192', name: 'Llama 3 70B' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
  ];
  
  const mistralModels = [
      { id: 'mistral-small-latest', name: 'Mistral Small' },
      { id: 'open-mixtral-8x22b', name: 'Open Mixtral 8x22B' },
  ];

  const modeLabels: Record<string, string> = {
      [AIModelMode.STANDARD]: d.modeStandard || t.modeStandard,
      [AIModelMode.THINKING]: d.modeThinking || t.modeThinking,
      [AIModelMode.RESEARCH]: d.modeResearch || t.modeResearch,
      [AIModelMode.VISION]: d.modeVision || t.modeVision,
      [AIModelMode.AGENTIC]: d.modeAgentic || t.modeAgentic
  };
  
  const getEngineLabel = () => {
    if (engine.provider === 'gemini') return `🐼 Gemini`;
    if (engine.provider === 'poe') {
        const model = poeModels.find(m => m.id === engine.model);
        return `🅿️ ${model?.name || engine.model}`;
    }
    if (engine.provider === 'groq') {
        const model = groqModels.find(m => m.id === engine.model);
        return `⚡ ${model?.name || engine.model}`;
    }
    if (engine.provider === 'mistral') {
        const model = mistralModels.find(m => m.id === engine.model);
        return `🌪️ ${model?.name || engine.model}`;
    }
    if (engine.provider === 'huggingface') {
        const model = huggingFaceModels.find(m => m.id === engine.model);
        if (model) return `🤗 ${model.name}`;
        if (engine.model) {
            const parts = engine.model.split('/');
            return `🤗 ${parts.pop() || engine.model}`;
        }
        return '🤗 Hugging Face';
    }
    return 'Select Engine';
  };


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    
    scrollRef.current?.querySelectorAll('pre').forEach(pre => {
        if (pre.querySelector('.copy-button')) return;
        
        pre.style.position = 'relative';
        const button = document.createElement('button');
        button.innerText = 'העתק';
        button.className = 'copy-button absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-lg hover:bg-black/80 transition-all opacity-50 group-hover:opacity-100';
        button.onclick = () => {
            const code = pre.querySelector('code')?.innerText || '';
            navigator.clipboard.writeText(code);
            showToast('הקוד הועתק!', 'success');
        };
        pre.classList.add('group');
        pre.appendChild(button);
    });

    if ((window as any).hljs) {
        scrollRef.current?.querySelectorAll('pre code:not(.hljs)').forEach(block => {
            (window as any).hljs.highlightElement(block as HTMLElement);
        });
    }
  }, [activeSession?.messages, loading, showToast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.some((f: File) => f.type.startsWith('image/'))) {
      setMode(AIModelMode.VISION);
    }
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, { data: event.target?.result as string, mimeType: file.type, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSend = async (customPrompt?: string, customAttachments?: { data: string; mimeType: string; name: string }[]) => {
    const textToSend = customPrompt ?? input;
    const attachmentsToSend = customAttachments ?? attachments;
    
    if ((!textToSend.trim() && attachmentsToSend.length === 0) || loading) return;

    let currentSession = activeSession;
    if (!currentSession) {
      currentSession = newChat(textToSend, textToSend.substring(0, 30), attachmentsToSend);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      mode,
      engine,
      timestamp: new Date().toISOString(),
      attachments: attachmentsToSend,
      status: 'sending',
    };

    updateSession({ ...currentSession, messages: [...currentSession.messages, userMsg] });
    
    if (!customPrompt) {
        setInput('');
        setAttachments([]);
    }
    setLoading(true);

    try {
      const history = currentSession.messages.filter(m => m.id !== userMsg.id);
      const response = await getGeminiResponse(textToSend, mode, history, project, undefined, attachmentsToSend, engine, apiConfigs, appSettings);
      
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response.text, mode, engine, timestamp: new Date().toISOString(), thoughtProcess: response.thoughtSteps || [], status: 'sent' };
      updateSession({ ...currentSession, messages: [...currentSession.messages.map(m => m.id === userMsg.id ? { ...m, status: 'sent' as const } : m), assistantMsg] });

    } catch (error) {
        console.error("Failed to send message:", error);
        showToast("שגיאת רשת, נסה שוב", "info");
        if (currentSession) {
           updateSession({ ...currentSession, messages: currentSession.messages.map(m => m.id === userMsg.id ? { ...m, status: 'error' as const } : m) });
        }
    } finally { setLoading(false); }
  };
  
  const handleRetry = (messageId: string) => {
    if (!activeSession) return;
    const failedMessage = activeSession.messages.find(m => m.id === messageId);
    if (!failedMessage) return;

    const messagesWithoutFailed = activeSession.messages.filter(m => m.id !== messageId);
    updateSession({ ...activeSession, messages: messagesWithoutFailed });

    handleSend(failedMessage.content, failedMessage.attachments);
  };
  
  const renderMessageContent = (msg: ChatMessage) => {
    const htmlContent = marked.parse(msg.content);
    const sanitizedHtml = DOMPurify.sanitize(htmlContent as string);
    return (
      <>
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {msg.attachments.map((att, i) => (
              att.mimeType.startsWith('image/') ? 
                <img key={i} src={att.data} alt={att.name} className="max-w-xs rounded-lg border border-white/10" /> :
                <div key={i} className="bg-zinc-700/50 p-2 rounded-lg text-xs border border-white/10">{att.name}</div>
            ))}
          </div>
        )}
        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      </>
    );
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-[#0d0d0f] overflow-hidden" dir="rtl">
        <header className="flex justify-between items-center p-3 sm:p-4 border-b border-white/10 bg-[#0d0d0f]/80 backdrop-blur-md z-50">
           <div className="flex items-center gap-1 sm:gap-2">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-1.5 sm:p-2 bg-white/5 rounded-lg text-white">☰</button>
              <div className="relative">
                  <button onClick={() => setShowModeSelector(!showModeSelector)} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white/5 rounded-xl text-[10px] sm:text-xs font-black flex items-center gap-1 sm:gap-2 border border-white/10 whitespace-nowrap">
                    {modeLabels[mode]} <span className="text-zinc-500 text-[8px] sm:text-[10px]">▼</span>
                  </button>
                  {showModeSelector && (
                    <div className="absolute top-full right-0 mt-2 bg-[#1e1e1e] border border-white/10 rounded-xl p-2 w-40 sm:w-48 shadow-lg z-10">
                      {Object.entries(modeLabels).map(([key, label]) => (
                        <button key={key} onClick={() => { setMode(key as AIModelMode); setShowModeSelector(false); }} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-white/10">{label}</button>
                      ))}
                    </div>
                  )}
              </div>
              <div className="relative">
                 <button onClick={() => setShowEngineSelector(!showEngineSelector)} className="px-2 sm:px-4 py-1.5 sm:py-2 bg-white/5 rounded-xl text-[10px] sm:text-xs font-black flex items-center gap-1 sm:gap-2 border border-white/10 whitespace-nowrap">
                    <span className="hidden sm:inline">{getEngineLabel()}</span>
                    <span className="sm:hidden">{getEngineLabel().split(' ')[0]}</span>
                    <span className="text-zinc-500 text-[8px] sm:text-[10px]">▼</span>
                 </button>
                 {showEngineSelector && (
                    <div className="absolute top-full right-0 mt-2 bg-[#1e1e1e] border border-white/10 rounded-xl p-2 w-48 sm:w-56 shadow-lg z-10 max-h-64 overflow-y-auto custom-scrollbar">
                       <button onClick={() => { setEngine({ provider: 'gemini', model: 'gemini-3-flash-preview' }); setShowEngineSelector(false); }} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-white/10 flex items-center gap-2"><span className="text-lg">🐼</span> Gemini</button>
                       {hasGroqKey && <div className="text-[10px] sm:text-xs text-zinc-500 px-2 pt-2 border-t border-white/5 mt-1">Groq (מהיר)</div>}
                       {hasGroqKey && groqModels.map(m => (
                          <button key={m.id} onClick={() => { setEngine({ provider: 'groq', model: m.id }); setShowEngineSelector(false); }} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-white/10 flex items-center gap-2"><span className="text-lg">⚡</span> {m.name}</button>
                       ))}
                       {hasMistralKey && <div className="text-[10px] sm:text-xs text-zinc-500 px-2 pt-2 border-t border-white/5 mt-1">Mistral</div>}
                       {hasMistralKey && mistralModels.map(m => (
                          <button key={m.id} onClick={() => { setEngine({ provider: 'mistral', model: m.id }); setShowEngineSelector(false); }} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-white/10 flex items-center gap-2"><span className="text-lg">🌪️</span> {m.name}</button>
                       ))}
                       {hasPoeKey && <div className="text-[10px] sm:text-xs text-zinc-500 px-2 pt-2 border-t border-white/5 mt-1">Poe</div>}
                       {hasPoeKey && poeModels.map(m => (
                          <button key={m.id} onClick={() => { setEngine({ provider: 'poe', model: m.id }); setShowEngineSelector(false); }} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-white/10 flex items-center gap-2"><span className="text-lg">🅿️</span> {m.name}</button>
                       ))}
                       {hasHuggingFaceKey && <div className="text-[10px] sm:text-xs text-zinc-500 px-2 pt-2 border-t border-white/5 mt-1">Hugging Face</div>}
                       {hasHuggingFaceKey && huggingFaceModels.map(m => (
                          <button key={m.id} onClick={() => { setEngine({ provider: 'huggingface', model: m.id }); setShowEngineSelector(false); }} className="w-full text-right p-2 rounded-lg text-xs font-bold hover:bg-white/10 flex items-center gap-2"><span className="text-lg">🤗</span> {m.name}</button>
                       ))}
                       {!hasPoeKey && !hasHuggingFaceKey && <div className="p-2 text-[10px] sm:text-xs text-zinc-500 text-center">חבר מפתחות API נוספים בהגדרות כדי להפעיל מודלים נוספים.</div>}
                    </div>
                 )}
              </div>
           </div>
           <div className="text-xs sm:text-sm font-bold truncate px-2 flex-1 text-left" dir="ltr">{activeSession?.title || 'שיחה חדשה'}</div>
           <button onClick={() => newChat()} className="p-1.5 sm:p-2 bg-white/5 rounded-lg text-white text-lg sm:text-xl shrink-0" title="שיחה חדשה">+</button>
        </header>

        {!activeSession || activeSession.messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
            <h1 className="text-4xl font-black text-white italic">{t.chatWelcomeMsg.replace('{name}', userName)}</h1>
            <div className="grid grid-cols-2 gap-4 mt-12 max-w-2xl w-full">
              {[t.chatSuggest1, t.chatSuggest2, t.chatSuggest3, t.chatSuggest4].map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="p-4 bg-white/5 rounded-xl text-sm text-zinc-300 hover:bg-white/10 border border-white/5">{s}</button>
              ))}
            </div>
          </div>
        ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-40 scroll-smooth">
          {activeSession?.messages.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm ${m.role === 'user' ? 'bg-[#333]' : 'bg-transparent border border-white/10'}`}>
                  {m.role === 'user' ? '👤' : '🐼'}
                </div>
                <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[90%]`}>
                  {m.role === 'assistant' && <AgentMind steps={m.thoughtProcess} isProcessing={false} isRTL={true} />}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[#262626] text-white border border-[#333]' : 'bg-[#18181b] text-zinc-100 border border-white/5'}`}>
                    {renderMessageContent(m)}
                  </div>
                  {m.status === 'error' && (
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-xs text-red-400">השליחה נכשלה</span>
                         <button onClick={() => handleRetry(m.id)} className="text-xs font-bold text-orange-500 hover:underline">נסה שוב</button>
                      </div>
                  )}
                </div>
              </div>
          ))}
          {loading && (
             <div className="flex gap-3 flex-row animate-in fade-in">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm bg-transparent border border-white/10">🐼</div>
                <div className="px-4 py-3 rounded-2xl bg-[#18181b] border border-white/5 flex items-center justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
             </div>
          )}
        </div>
        )}
        
        {previewCode && <CodePreview code={previewCode.code} lang={previewCode.lang} onClose={() => setPreviewCode(null)} />}

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0d0d0f] to-transparent z-10">
           {attachments.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
              {attachments.map((att, i) => (
                <div key={i} className="bg-white/10 p-2 rounded-lg text-xs flex items-center gap-2 whitespace-nowrap">
                  <span>{att.name}</span>
                  <button onClick={() => setAttachments(a => a.filter((_, idx) => idx !== i))} className="text-zinc-500">x</button>
                </div>
              ))}
            </div>
           )}
           <div className="flex gap-3 relative bg-[#1e1e1e] rounded-[1.5rem] p-2 border border-white/10 focus-within:border-white/20 transition-colors shadow-lg">
             <button onClick={() => fileInputRef.current?.click()} aria-label="העלה קובץ" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 hover:text-white transition-all shrink-0 self-end mb-1" title="העלה קובץ">
               📎
             </button>
             <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
             
             <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="כתוב הודעה לפנדה..." className="flex-1 bg-transparent border-none outline-none text-white resize-none text-right placeholder-zinc-500 py-3 max-h-48 min-h-[50px] custom-scrollbar" onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} style={{ height: input ? Math.min(input.split('\n').length * 24 + 24, 200) + 'px' : '50px' }} />
             <button onClick={() => handleSend()} disabled={(!input.trim() && attachments.length === 0) || loading} aria-label="שלח הודעה" className={`w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg transition-all self-end mb-1 shrink-0 ${(input.trim() || attachments.length > 0) ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}>
               ↑
             </button>
           </div>
        </div>
    </div>
  );
};

export default ChatArea;
