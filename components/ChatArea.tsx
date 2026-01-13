
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AIModelMode, ChatMessage, ChatSession, Project, AppSettings, APIConfig, ViewMode } from '../types';
import { getGeminiResponse, transcribeAudio } from '../services/gemini';
import { translations } from '../utils/translations';
import AgentMind from './AgentMind';

interface ChatAreaProps {
  session: ChatSession | null;
  project?: Project;
  onNewChat: (prompt?: string, title?: string) => void;
  onUpdateSession: (session: ChatSession) => void;
  appSettings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  apiConfigs: APIConfig[];
  onOpenMenu: () => void;
  setView: (v: ViewMode) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ session, project, onNewChat, onUpdateSession, appSettings, onOpenMenu, apiConfigs, setView }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AIModelMode>(AIModelMode.STANDARD); 
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations.he;
  const userName = appSettings.userBio?.split(' ')[0] || 'חבר';

  const suggestions = useMemo(() => {
    const all = [
      t.chatSuggest1, t.chatSuggest2, t.chatSuggest3, t.chatSuggest4,
      'כתוב פוסט ללינקדאין על AI',
      'הסבר לי איך עובד Blockchain',
      'צור תוכנית אימונים שבועית',
      'נתח את הדוחות הכספיים שלי'
    ];
    return all.sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [session?.id]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    if (!session) {
      onNewChat(textToSend, textToSend.substring(0, 30));
      setInput('');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      mode,
      timestamp: new Date().toISOString()
    };

    onUpdateSession({ ...session, messages: [...session.messages, userMsg], lastUpdate: new Date().toISOString() });
    setInput('');
    setLoading(true);

    try {
      const history = session.messages.map(m => ({ role: m.role, content: m.content }));
      const response = await getGeminiResponse(textToSend, mode, history, project, undefined, undefined, undefined, apiConfigs, appSettings);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        mode,
        timestamp: new Date().toISOString(),
        thoughtProcess: response.thoughtSteps || []
      };
      onUpdateSession({ ...session, messages: [...session.messages, userMsg, assistantMsg], lastUpdate: new Date().toISOString() });
    } finally { setLoading(false); }
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lang = part.match(/```(\w+)/)?.[1] || 'code';
        const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
        return (
          <div key={i} className="relative group my-4 rounded-xl border border-[#444] overflow-hidden shadow-lg" dir="ltr">
            <div className="flex justify-between items-center px-4 py-2 bg-[#2d2d2d] border-b border-[#444]">
              <span className="text-[12px] font-sans text-zinc-400">{lang}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => { navigator.clipboard.writeText(code); alert('הקוד הועתק!'); }}
                  className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-zinc-300 transition-all"
                  title="העתק קוד"
                >
                  <span>📋</span> {t.copy}
                </button>
                <button 
                  onClick={() => setPreviewCode(code)}
                  className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-zinc-300 transition-all"
                  title="תצוגה מקדימה"
                >
                  <span>👁️</span> {t.preview}
                </button>
              </div>
            </div>
            <pre className="p-4 overflow-x-auto text-sm font-mono text-[#d4d4d4] bg-[#1e1e1e]"><code>{code}</code></pre>
          </div>
        );
      }
      return <p key={i} className="whitespace-pre-wrap mb-3 last:mb-0 leading-7">{part}</p>;
    });
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-[#0d0d0f] overflow-hidden" dir="rtl">
      <header className="h-16 px-4 border-b border-white/5 flex items-center justify-between z-40 shrink-0 bg-[#0d0d0f]">
        <div className="flex items-center gap-4">
          <button onClick={() => setView(ViewMode.DASHBOARD)} className="px-4 py-2 bg-white/5 rounded-xl text-white hover:bg-orange-600 transition-all font-bold text-xs">{t.back}</button>
          <div className="relative">
            <button onClick={() => setShowModeSelector(!showModeSelector)} className="px-3 py-1.5 rounded-lg text-white hover:bg-white/5 text-sm font-bold flex items-center gap-2">
              {mode} <span className="text-[10px]">▼</span>
            </button>
            {showModeSelector && (
               <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 z-50 w-48 shadow-xl">
                  {Object.values(AIModelMode).map(m => (
                    <button key={m} onClick={() => { setMode(m); setShowModeSelector(false); }} className="w-full text-right px-4 py-2 hover:bg-white/5 text-xs text-white rounded-lg block">{m}</button>
                  ))}
               </div>
            )}
          </div>
        </div>
        <button onClick={onOpenMenu} className="md:hidden text-zinc-400 p-2">☰</button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-40 scroll-smooth">
        {!session ? (
          <div className="max-w-[800px] mx-auto py-20 text-center space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tight">
                {t.chatWelcomeMsg.replace('{name}', userName)}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => handleSend(s)} className="bg-[#1e1e1e] hover:bg-[#2d2d2d] p-6 rounded-2xl text-right border border-white/5 transition-all group shadow-md">
                  <div className="text-sm font-medium text-zinc-200 group-hover:text-white">{s}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-[800px] mx-auto space-y-8">
            {session.messages.map(m => (
              <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[#444]' : 'bg-transparent border border-white/10'}`}>
                  {m.role === 'user' ? '👤' : '🐼'}
                </div>
                <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  {m.thoughtProcess && m.thoughtProcess.length > 0 && <AgentMind steps={m.thoughtProcess} isProcessing={false} isRTL={true} />}
                  <div className={`px-5 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[#2f2f2f] text-white rounded-tr-sm' : 'text-zinc-100 bg-transparent rounded-tl-sm'}`}>
                    {renderMessageContent(m.content)}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 animate-pulse">
                 <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xl">🐼</div>
                 <div className="flex items-center gap-1 pt-2">
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200"></div>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      {previewCode && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[85vh] bg-[#0a0a0c] rounded-[2rem] border border-white/10 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0a0c] rounded-t-[2rem]">
              <span className="text-sm font-bold text-white">{t.preview}</span>
              <button onClick={() => setPreviewCode(null)} className="text-zinc-500 hover:text-white px-4 py-2 bg-white/5 rounded-lg font-bold">✕ {t.close}</button>
            </div>
            <div className="flex-1 bg-white relative">
               <iframe 
                 title="preview" 
                 className="w-full h-full" 
                 srcDoc={previewCode} 
                 sandbox="allow-scripts"
               />
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0d0d0f] via-[#0d0d0f] to-transparent">
        <div className="max-w-[800px] mx-auto flex gap-3 relative">
          <textarea 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="כתוב הודעה לפנדה..." 
            className="flex-1 bg-[#1e1e1e] border border-white/10 rounded-[1.5rem] p-4 pr-12 text-white outline-none focus:border-white/20 resize-none h-14 shadow-lg text-right placeholder-zinc-500"
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          />
          <button 
            onClick={() => handleSend()} 
            disabled={!input.trim() || loading} 
            className={`absolute left-2 top-2 bottom-2 w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg transition-all ${input.trim() ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
