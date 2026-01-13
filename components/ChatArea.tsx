
import React, { useState, useRef, useEffect } from 'react';
import { AIModelMode, ChatMessage, ChatSession, Project, AppSettings, APIConfig, ThoughtStep } from '../types';
import { getGeminiResponse, generateTTS, transcribeAudio } from '../services/gemini';
import { translations } from '../utils/translations';
import AgentMind from './AgentMind';

interface ChatAreaProps {
  session: ChatSession | null;
  project?: Project;
  onNewChat: () => void;
  onUpdateSession: (session: ChatSession) => void;
  onUpdateProject?: (project: Project) => void;
  appSettings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  apiConfigs: APIConfig[];
  onOpenMenu: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ session, project, onNewChat, onUpdateSession, appSettings, onOpenMenu, apiConfigs }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AIModelMode>(AIModelMode.STANDARD); // Revert to STANDARD for safety
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: string; data: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentThoughts, setCurrentThoughts] = useState<ThoughtStep[]>([]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        try {
          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        } catch (e) {
          if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }
    }, 100);
  };

  useEffect(() => scrollToBottom(), [session?.messages, loading, currentThoughts]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          data: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e: any) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          setLoading(true);
          try {
            const text = await transcribeAudio(base64, 'audio/webm');
            setInput(prev => prev + ' ' + text);
          } catch (err) {} finally { setLoading(false); }
        };
        reader.readAsDataURL(audioBlob);
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {}
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setIsRecording(false); };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!session || (!textToSend.trim() && attachments.length === 0) || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      mode,
      timestamp: new Date().toISOString(),
      attachments: attachments.map(a => ({ id: a.id, name: a.name, type: a.type, data: a.data, size: 0 }))
    };

    onUpdateSession({ ...session, messages: [...session.messages, userMsg], lastUpdate: new Date().toISOString() });
    
    setInput('');
    const currentAttachments = [...attachments];
    setAttachments([]);
    setLoading(true);
    setCurrentThoughts([]);

    try {
      const history = session.messages.map(m => ({ role: m.role, content: m.content }));
      const response = await getGeminiResponse(
        textToSend, mode, history, project, undefined, 
        currentAttachments.map(a => ({ data: a.data, mimeType: a.type })), 
        undefined, apiConfigs, appSettings
      );

      // Safe update
      if (response.thoughtSteps && Array.isArray(response.thoughtSteps)) {
        setCurrentThoughts(response.thoughtSteps);
      }

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        mode,
        timestamp: new Date().toISOString(),
        groundingSources: response.groundingSources,
        thoughtProcess: response.thoughtSteps || []
      };

      onUpdateSession({ ...session, messages: [...session.messages, userMsg, assistantMsg], lastUpdate: new Date().toISOString() });
    } catch (e: any) {
       console.error("Error in chat:", e);
    } finally { setLoading(false); }
  };

  const modes = [
    { id: AIModelMode.STANDARD, label: 'Flash Lite', desc: 'Fast & Reliable', icon: '⚡' },
    { id: AIModelMode.AGENTIC, label: 'Neural Agent', desc: 'Reasoning & Tools', icon: '🤖' },
    { id: AIModelMode.THINKING, label: 'Deep Reasoning', desc: 'Logic Exploration', icon: '🧠' },
    { id: AIModelMode.RESEARCH, label: 'Search Plus', desc: 'Web Grounding', icon: '🌐' }
  ];

  if (!session) return (
    <div className="h-full flex flex-col items-center justify-center p-10 bg-[#050508] text-center space-y-8 animate-in">
      <div className="w-28 h-28 bg-orange-600/10 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner border border-white/10 animate-pulse">🐼</div>
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Panda <span className="text-orange-500">Workspace</span></h2>
        <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-[0.4em]">{t.startWorkspace}</p>
      </div>
      <button onClick={onNewChat} className="px-12 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-xs active:scale-95">{t.newChat} 🚀</button>
    </div>
  );

  return (
    <div className={`flex flex-col h-full w-full relative bg-[#050508] overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="h-14 px-6 glass border-b border-white/10 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onOpenMenu} className="md:hidden text-zinc-300 p-2">☰</button>
          <div className="relative">
            <button 
              onClick={() => setShowModeSelector(!showModeSelector)}
              className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 hover:border-orange-500/30 transition-all group"
            >
              <div className={`w-2 h-2 rounded-full ${mode === AIModelMode.STANDARD ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 'bg-emerald-500'}`}></div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{modes.find(m => m.id === mode)?.label}</span>
              <span className="text-[10px] text-zinc-600 group-hover:text-white transition-colors">▼</span>
            </button>
            {showModeSelector && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowModeSelector(false)}></div>
                <div className={`absolute top-full mt-2 w-64 glass border border-white/10 rounded-2xl shadow-3xl overflow-hidden z-50 animate-in slide-in-from-top-2 ${isRTL ? 'right-0' : 'left-0'}`}>
                  {modes.map(m => (
                    <button key={m.id} onClick={() => { setMode(m.id); setShowModeSelector(false); }} className={`w-full text-right p-4 flex items-center gap-4 hover:bg-white/5 transition-all ${mode === m.id ? 'bg-white/10' : ''}`}>
                      <span className="text-xl">{m.icon}</span>
                      <div className="flex flex-col items-start">
                        <span className="text-[11px] font-black text-white">{m.label}</span>
                        <span className="text-[9px] text-zinc-500">{m.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4"><div className="text-xs font-black text-white italic truncate max-w-[200px]">{session.title}</div></div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-12 pb-48 lg:px-64">
        {session.messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-start' : 'items-end'} animate-in group`}>
            {/* Defensive check for rendering AgentMind */}
            {m.role === 'assistant' && m.thoughtProcess && Array.isArray(m.thoughtProcess) && m.thoughtProcess.length > 0 && (
              <AgentMind steps={m.thoughtProcess} isProcessing={false} isRTL={isRTL} />
            )}
            <div className={`relative max-w-[95%] md:max-w-[85%] p-8 rounded-[2.5rem] shadow-2xl ${m.role === 'user' ? 'message-user' : 'message-ai'}`}>
              <div className={`text-[9px] font-black uppercase tracking-[0.4em] mb-4 flex items-center justify-between gap-3 ${m.role === 'user' ? 'text-zinc-600' : 'text-orange-500'}`}>
                 <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${m.role === 'user' ? 'bg-zinc-800' : 'bg-orange-600 shadow-[0_0_8px_#f97316]'}`}></div>
                   {m.role === 'user' ? t.clientRequestLabel : t.agentResponseLabel}
                 </div>
                 {m.role === 'assistant' && <button onClick={() => generateTTS(m.content)} className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors">🔊</button>}
              </div>
              {m.attachments && m.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {m.attachments.map(a => (
                    <div key={a.id} className="relative group/att">
                      {a.type.startsWith('image/') ? <img src={a.data} className="h-32 rounded-xl border border-white/10 shadow-lg" alt="att" /> : a.type.startsWith('video/') ? <video src={a.data} className="h-32 rounded-xl border border-white/10" controls /> : <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[10px]">{a.name}</div>}
                    </div>
                  ))}
                </div>
              )}
              <div className="text-zinc-200 text-[15px] leading-relaxed whitespace-pre-wrap font-medium italic">{m.content}</div>
              {m.groundingSources && m.groundingSources.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-2">
                  {m.groundingSources.map((source, i) => (
                    <a key={i} href={source.uri} target="_blank" className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[9px] font-bold text-zinc-500 hover:text-orange-500 transition-colors">🔗 {source.title}</a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-col items-end gap-4 animate-in">
             {/* Safe rendering of thoughts during loading */}
            <AgentMind steps={currentThoughts} isProcessing={true} isRTL={isRTL} />
            <div className="bg-orange-600/10 p-6 rounded-[2.5rem] border border-orange-500/20 text-xs font-black text-orange-500 italic pulse-ai">{t.thinking}</div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 z-40 bg-gradient-to-t from-[#050508] via-[#050508]/95 to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto space-y-4 pointer-events-auto">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-black/40 rounded-2xl border border-white/5">
              {attachments.map(a => (
                <div key={a.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                  {a.type.startsWith('image/') ? <img src={a.data} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px] bg-white/5">DOC</div>}
                  <button onClick={() => setAttachments(prev => prev.filter(att => att.id !== a.id))} className="absolute top-0 right-0 bg-black/60 text-white p-0.5 text-[8px]">✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 bg-[#0a0a1f]/90 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/15 shadow-3xl focus-within:border-orange-500/50 transition-all">
            <button onClick={() => fileInputRef.current?.click()} className="w-11 h-11 rounded-full flex items-center justify-center bg-white/5 text-zinc-400 hover:text-white transition-all shadow-inner border border-white/5"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg></button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple accept="image/*,video/*,audio/*" />
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t.chatPlaceholder} className="flex-1 bg-transparent border-none focus:ring-0 text-white py-3 px-2 text-[15px] resize-none h-12 custom-scrollbar outline-none font-medium italic" onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}} />
            <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-inner border border-white/5 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-zinc-400 hover:text-white'}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg></button>
            <button onClick={() => handleSend()} disabled={(!input.trim() && attachments.length === 0) || loading} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-xl ${(!input.trim() && attachments.length === 0) ? 'bg-white/5 text-zinc-700' : 'bg-orange-600 text-white hover:bg-orange-500'}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
