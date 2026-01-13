
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../services/audio';
import { AppSettings } from '../types';
import { translations } from '../utils/translations';

interface VoiceInterfaceProps {
  appSettings: AppSettings;
  onSaveAsChat: (history: {role: string, text: string}[]) => void;
}

interface TranscriptionMessage {
  role: 'user' | 'assistant';
  text: string;
  isFinal: boolean;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ appSettings, onSaveAsChat }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [history, setHistory] = useState<TranscriptionMessage[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const nextStartTimeRef = useRef(0);

  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';

  const startSession = async () => {
    try {
      setStatus('connecting');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: createBlob(inputData) });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              setStatus('speaking');
              // Scheduled gapless playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(msg.serverContent.modelTurn.parts[0].inlineData.data), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            
            if (msg.serverContent?.inputTranscription) {
              updateHistory('user', msg.serverContent.inputTranscription.text, false);
            }
            if (msg.serverContent?.outputTranscription) {
              updateHistory('assistant', msg.serverContent.outputTranscription.text, false);
            }
            if (msg.serverContent?.turnComplete) {
              setHistory(prev => prev.map(h => ({ ...h, isFinal: true })));
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus('listening');
            }
          },
          onerror: () => stopSession(),
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: appSettings.voiceName } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are PandaAi, an elite real-time assistant. 
          Respond naturally in ${appSettings.language === 'he' ? 'Hebrew' : 'English'}. 
          The user is ${appSettings.userBio || 'a valued partner'}.`
        }
      });

      sessionPromiseRef.current = sessionPromise;
      setIsActive(true);
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  const updateHistory = (role: 'user' | 'assistant', text: string, isFinal: boolean) => {
    setHistory(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === role && !last.isFinal) {
        return [...prev.slice(0, -1), { role, text, isFinal }];
      }
      return [...prev, { role, text, isFinal }];
    });
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    [audioContextRef.current, outputAudioContextRef.current].forEach(ctx => ctx?.close());
    setIsActive(false);
    setStatus('idle');
  };

  const handleSave = () => {
    if (history.length === 0) return;
    onSaveAsChat(history.map(h => ({ role: h.role, text: h.text })));
    stopSession();
  };

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-[#050507] relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="flex items-center gap-1.5 h-64">
           {[...Array(32)].map((_, i) => (
             <div 
               key={i} 
               className={`w-1.5 bg-indigo-500 rounded-full transition-all duration-300 ${status === 'speaking' ? 'animate-pulse' : status === 'listening' ? 'animate-bounce' : 'h-2'}`}
               style={{ 
                 height: status === 'speaking' ? `${30 + Math.random() * 70}%` : status === 'listening' ? `${10 + Math.random() * 40}%` : '8px',
                 animationDelay: `${i * 40}ms`,
                 animationDuration: status === 'listening' ? '1.5s' : '0.8s'
               }}
             />
           ))}
        </div>
      </div>

      <div className="max-w-xl w-full space-y-16 relative z-10 text-center">
        <div className="space-y-4">
          <div className="inline-block px-4 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
            {t.voiceActive}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
            {status === 'idle' ? t.readyTo : status === 'connecting' ? t.connecting : status === 'listening' ? t.listening : t.speaking} <span className="text-indigo-500">{status === 'idle' ? t.engage : t.nexus}</span>
          </h2>
        </div>

        <div className="flex flex-col items-center gap-10">
           <button 
             onClick={isActive ? stopSession : startSession}
             className={`w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl relative group ${isActive ? 'bg-red-500/20 border-red-500/40 animate-pulse' : 'bg-indigo-600/10 border-indigo-500/20 hover:bg-indigo-600/20 hover:scale-105'}`}
             style={{ border: '2px solid' }}
           >
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 transition-all ${isActive ? 'bg-red-500 scale-125' : 'bg-indigo-500 group-hover:scale-110'}`}></div>
              <span className="text-5xl md:text-6xl relative z-10">{isActive ? '⏹️' : '🎙️'}</span>
           </button>

           <div className="space-y-6 w-full">
              {history.length > 0 && (
                <div className={`glass p-6 rounded-2xl border border-white/5 bg-white/[0.02] ${isRTL ? 'text-right' : 'text-left'} space-y-4 max-h-[160px] overflow-y-auto custom-scrollbar`}>
                   {history.map((h, i) => (
                     <div key={i} className={`text-[11px] font-bold ${h.role === 'user' ? 'text-zinc-500' : 'text-indigo-400'}`}>
                        <span className={`uppercase opacity-50 ${isRTL ? 'ml-2' : 'mr-2'}`}>{h.role === 'user' ? 'משתמש' : 'מערכת'}:</span>
                        <span className="italic">"{h.text}"</span>
                     </div>
                   ))}
                </div>
              )}

              {isActive ? (
                <div className="flex justify-center gap-4">
                  <button onClick={handleSave} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-xl transition-all text-[10px] uppercase tracking-widest">{t.saveSession}</button>
                  <button onClick={stopSession} className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">{t.disconnect}</button>
                </div>
              ) : (
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.4em]">{t.startSession}</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
