
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../services/audio';
import { getAI } from '../services/gemini';
import { AppSettings, ViewMode } from '../types';
import { useAppSettings, useChat, useUI, useApi } from '../contexts/AppContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

const Waveform: React.FC<{ color: string }> = ({ color }) => (
    <div className="flex justify-center items-center h-full w-full gap-1.5">
        {[...Array(5)].map((_, i) => (
            <div
                key={i}
                className="w-3 rounded-full"
                style={{
                    backgroundColor: color,
                    animation: `wave 1.2s ease-in-out ${i * 0.1}s infinite`,
                    height: `${Math.random() * 40 + 20}px`
                }}
            ></div>
        ))}
        <style>{`
            @keyframes wave {
                0%, 100% { transform: scaleY(0.5); }
                50% { transform: scaleY(1.5); }
            }
        `}</style>
    </div>
);

const VoiceInterface: React.FC = () => {
  const { appSettings } = useAppSettings();
  const { newChat } = useChat();
  const { setView, showToast } = useUI();
  const { apiConfigs } = useApi();
  
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'error'>('idle');
  const [history, setHistory] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [currentUserText, setCurrentUserText] = useState('');
  const [currentAssistantText, setCurrentAssistantText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const exitModalRef = useFocusTrap<HTMLDivElement>();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isCleaningUp = useRef(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, currentUserText, currentAssistantText]);

  useEffect(() => () => { fullCleanup(); }, []);

  const fullCleanup = () => {
    if (isCleaningUp.current) return;
    isCleaningUp.current = true;
    
    sessionPromiseRef.current?.then(s => s.close()).catch(() => {});
    sessionPromiseRef.current = null;
    
    processorRef.current?.disconnect();
    processorRef.current = null;
    
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    
    outputAudioContextRef.current?.close().catch(() => {});
    outputAudioContextRef.current = null;

    setStatus('idle');
    isCleaningUp.current = false;
  };

  const startSession = async () => {
    setStatus('connecting');
    setHistory([]);
    setCurrentUserText('');
    setCurrentAssistantText('');
    setErrorMessage(null);
    
    try {
      const ai = getAI(apiConfigs);
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            if (!audioContextRef.current || !streamRef.current) return;
            const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ audio: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
            sourceRef.current = source;
            processorRef.current = scriptProcessor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription?.text) {
              setCurrentUserText(prev => prev + msg.serverContent!.inputTranscription!.text);
            }
            if (msg.serverContent?.outputTranscription?.text) {
              setStatus('speaking');
              setCurrentAssistantText(prev => prev + msg.serverContent!.outputTranscription!.text);
            }
            if (msg.serverContent?.turnComplete) {
              setCurrentUserText(prevUser => {
                setCurrentAssistantText(prevAssistant => {
                  if (prevUser.trim() || prevAssistant.trim()) {
                    setHistory(prevHistory => [
                      ...prevHistory,
                      { role: 'user', text: prevUser },
                      { role: 'assistant', text: prevAssistant }
                    ]);
                  }
                  return ''; // Clear assistant text
                });
                return ''; // Clear user text
              });
              setStatus('listening');
            }
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const audioCtx = outputAudioContextRef.current;
              const audioBuffer = await decodeAudioData(decode(audioData), audioCtx, 24000, 1);
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              const now = audioCtx.currentTime;
              const startTime = Math.max(now, nextStartTimeRef.current);
              source.start(startTime);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
            }
          },
          onerror: (e: ErrorEvent) => { setErrorMessage("שגיאת חיבור"); setStatus('error'); fullCleanup(); },
          onclose: () => { setStatus('idle'); },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: appSettings.voiceName } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });
    } catch (err) {
      setErrorMessage("לא ניתנה הרשאת מיקרופון");
      setStatus('error');
      fullCleanup();
    }
  };

  const handleEndCall = () => {
    if (history.length > 0 || currentUserText.trim() || currentAssistantText.trim()) {
      setShowExitConfirm(true);
    } else {
      fullCleanup();
      setView(ViewMode.DASHBOARD);
    }
  };
  
  const confirmEndCall = () => {
      fullCleanup();
      setView(ViewMode.DASHBOARD);
  };

  const handleSaveAndEnd = () => {
      const fullHistory = [...history];
      if (currentUserText.trim()) fullHistory.push({ role: 'user', text: currentUserText });
      if (currentAssistantText.trim()) fullHistory.push({ role: 'assistant', text: currentAssistantText });

      if (fullHistory.length > 0) {
          const chatContent = fullHistory.map(h => `${h.role === 'user' ? 'אני' : 'פנדה'}: ${h.text}`).join('\n\n');
          newChat(chatContent, 'שיחה קולית');
          showToast('השיחה נשמרה בהצלחה בצ\'אט', 'success');
      }
      fullCleanup();
      setTimeout(() => setView(ViewMode.CHAT), 300);
  };
  
  const renderCenterContent = () => {
    switch (status) {
      case 'idle':
        return <button onClick={startSession} className="w-48 h-48 bg-emerald-500 rounded-full flex flex-col items-center justify-center text-white font-black text-2xl shadow-[0_0_50px_rgba(16,185,129,0.5)] animate-pulse">התחל שיחה</button>;
      case 'connecting':
        return <div className="w-48 h-48 border-4 border-dashed border-white/20 rounded-full animate-spin flex items-center justify-center text-white">מחבר...</div>;
      case 'listening':
        return <div className="w-48 h-48 relative bg-blue-500 rounded-full flex flex-col items-center justify-center text-white font-black text-2xl shadow-[0_0_50px_rgba(59,130,246,0.5)] transition-all scale-105"><div className="w-full h-full rounded-full bg-blue-500/50 animate-ping absolute"></div>מאזין...</div>;
      case 'speaking':
        return <div className="w-48 h-48 bg-indigo-500 rounded-full flex flex-col items-center justify-center text-white font-black text-2xl shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all scale-110 overflow-hidden"><Waveform color="rgba(255, 255, 255, 0.7)" /></div>;
      case 'error':
        return <div className="w-48 h-48 bg-red-800 rounded-full flex flex-col items-center justify-center p-4 text-center"><p className="font-bold text-lg">שגיאה</p><p className="text-sm">{errorMessage}</p><button onClick={startSession} className="mt-2 text-xs underline">נסה שוב</button></div>;
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-[2000] bg-black text-white flex flex-col font-['Heebo']" dir="rtl" role="dialog" aria-label="שיחה קולית" aria-modal="true">
      <header className="p-6 flex justify-between items-center bg-black/30 backdrop-blur-md">
        <h2 className="text-2xl font-black italic">PANDA <span className="text-orange-500">VOICE</span></h2>
        <div className="flex items-center gap-4">
          <button onClick={handleSaveAndEnd} className="px-5 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20" aria-label="שמור וסיים שיחה">שמור וצא</button>
          <button onClick={handleEndCall} className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-black" aria-label="סיים שיחה ללא שמירה">✕</button>
        </div>
      </header>
      <main className="flex-1 flex flex-col justify-end p-6" role="main">
        <div ref={scrollRef} className="max-h-[50vh] overflow-y-auto custom-scrollbar space-y-4 text-center pb-8" aria-live="polite">
          {history.map((h, i) => (
            <p key={i} className={`text-2xl font-bold ${h.role === 'user' ? 'text-zinc-400' : 'text-white'}`}>{h.text}</p>
          ))}
          {currentUserText && <p className="text-2xl font-bold text-zinc-400">{currentUserText}</p>}
          {currentAssistantText && <p className="text-2xl font-bold text-white">{currentAssistantText}</p>}
        </div>
        <div className="flex justify-center items-center h-64">
          {renderCenterContent()}
        </div>
      </main>
      <footer className="p-6 flex justify-center items-center bg-black/30">
        <button onClick={() => setIsMuted(!isMuted)} className="px-6 py-3 bg-white/10 rounded-full text-sm font-bold" aria-label={isMuted ? 'בטל השתקה' : 'השתק'}>{isMuted ? 'בטל השתקה' : 'השתק'}</button>
      </footer>
    </div>
    {showExitConfirm && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in" dir="rtl" onClick={() => setShowExitConfirm(false)} role="alertdialog" aria-labelledby="exit-confirm-title" aria-describedby="exit-confirm-desc" aria-modal="true">
            <div ref={exitModalRef} className="max-w-md w-full bg-[#2a0a0a] p-10 rounded-[3rem] border-2 border-red-500/50 space-y-6 text-center shadow-[0_0_100px_rgba(239,68,68,0.3)] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="text-5xl" aria-hidden="true">⚠️</div>
                <h3 id="exit-confirm-title" className="text-2xl font-black text-white uppercase italic tracking-tight">לסיים שיחה?</h3>
                <p id="exit-confirm-desc" className="text-red-200 leading-relaxed font-medium">השיחה הנוכחית לא תישמר. האם אתה בטוח שברצונך לצאת?</p>
                <div className="flex gap-4 pt-4">
                    <button onClick={confirmEndCall} className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-sm">כן, סיים וצא</button>
                    <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs">ביטול</button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default VoiceInterface;
