
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../services/audio';
import { AppSettings } from '../types';
import { translations } from '../utils/translations';

interface VoiceInterfaceProps {
  appSettings: AppSettings;
  onSaveAsChat: (history: {role: string, text: string}[]) => void;
  onBack: () => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ appSettings, onSaveAsChat, onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  const [history, setHistory] = useState<{role: 'user' | 'assistant', text: string}[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const draw = () => {
      requestAnimationFrame(draw);
      analyserRef.current!.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = status === 'speaking' ? '#f97316' : '#6366f1';
      
      const sliceWidth = canvas.width * 1.0 / 8;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const v = dataArray[i * 16] / 128.0;
        const h = Math.max(10, v * 60 * (isActive ? 1 : 0.2));
        const x = (canvas.width / 2) - 100 + (i * 30);
        ctx.moveTo(x, (canvas.height / 2) - h / 2);
        ctx.lineTo(x, (canvas.height / 2) + h / 2);
      }
      ctx.stroke();
    };
    draw();
  };

  const startSession = async () => {
    try {
      setStatus('connecting');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const analyser = inputCtx.createAnalyser();
      analyserRef.current = analyser;
      audioContextRef.current = inputCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('listening');
            const source = inputCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(session => session.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            drawWaveform();
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              setStatus('speaking');
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(msg.serverContent.modelTurn.parts[0].inlineData.data), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              source.onended = () => { if (nextStartTimeRef.current <= outputCtx.currentTime + 0.1) setStatus('listening'); };
            }

            const inputTrans = msg.serverContent?.inputTranscription?.text;
            if (inputTrans) {
              setHistory(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'user' && status === 'listening') {
                   return [...prev.slice(0, -1), {role: 'user', text: inputTrans}];
                }
                return [...prev, {role: 'user', text: inputTrans}];
              });
            }

            const outputTrans = msg.serverContent?.outputTranscription?.text;
            if (outputTrans) {
               setHistory(prev => {
                 const last = prev[prev.length - 1];
                 if (last && last.role === 'assistant') {
                    return [...prev.slice(0, -1), {role: 'assistant', text: last.text + outputTrans}];
                 }
                 return [...prev, {role: 'assistant', text: outputTrans}];
               });
            }
          },
          onerror: () => stopSession(),
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: appSettings.voiceName } } },
          inputAudioTranscription: { model: 'gemini-2.5-flash-native-audio-preview-12-2025' },
          outputAudioTranscription: {},
          systemInstruction: `You are PandaAi. Respond in professional Hebrew.`
        }
      });
      sessionPromiseRef.current = sessionPromise;
      setIsActive(true);
    } catch (err) { setStatus('idle'); }
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) sessionPromiseRef.current.then(s => s.close());
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setIsActive(false);
    setStatus('idle');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050508] relative overflow-hidden text-right font-['Heebo']" dir="rtl">
      {/* Header */}
      <div className="h-16 px-6 bg-[#050508] flex items-center justify-between shrink-0 w-full border-b border-white/5 z-10">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-orange-600 transition-all font-bold text-xs shadow-lg">← חזור</button>
          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">צ'אט לייב קולי</h2>
        </div>
      </div>

      {/* Main Content Area - Flexible */}
      <div className="flex-1 flex flex-col items-center p-4 overflow-hidden">
        
        {/* WAVEFORM */}
        <div className="w-full max-w-sm aspect-[2/1] flex flex-col items-center justify-center relative mb-4 shrink-0">
            <div className={`absolute inset-0 bg-gradient-to-br ${status === 'speaking' ? 'from-orange-600/10 to-transparent' : 'from-indigo-600/10 to-transparent'} blur-[80px] rounded-full transition-all duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
            <canvas ref={canvasRef} width={300} height={150} className={`w-full h-full relative z-10 transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}></canvas>
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-6xl animate-pulse grayscale opacity-50">🐼</div>
              </div>
            )}
        </div>

        {/* TRANSCRIPTION BOX - Flex 1 to fill space but scrollable */}
        <div className="w-full max-w-2xl flex-1 min-h-0 bg-white/5 rounded-3xl p-4 border border-white/10 shadow-inner flex flex-col">
            <h3 className="text-xs font-black text-zinc-500 uppercase mb-2 px-2 shrink-0">תמלול בזמן אמת</h3>
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-3 px-2">
                {history.length > 0 ? (
                history.map((h, i) => (
                    <div key={i} className={`flex flex-col ${h.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in duration-300`}>
                        <div className={`px-4 py-2 rounded-2xl text-sm font-medium ${h.role === 'user' ? 'bg-orange-600/20 text-orange-100' : 'bg-white/10 text-white'}`}>
                        <span className="text-[9px] font-black uppercase opacity-60 block mb-1 text-right">{h.role === 'user' ? 'אתה' : 'פנדה'}</span>
                        <p className="text-right leading-relaxed">{h.text}</p>
                        </div>
                    </div>
                ))
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-600 text-sm italic">
                        {isActive ? 'מקשיב...' : 'היסטוריית השיחה תופיע כאן'}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* FIXED FOOTER CONTROLS */}
      <div className="shrink-0 p-6 bg-[#0a0a0c] border-t border-white/10 flex justify-center items-center gap-8 md:gap-12 z-20">
           <button 
             onClick={() => setIsMuted(!isMuted)}
             className={`p-4 md:p-5 rounded-full transition-all border ${isMuted ? 'bg-red-600 text-white border-red-400' : 'bg-white/5 text-zinc-200 border-white/10 hover:text-white'}`}
             disabled={!isActive}
           >
             <span className="text-xl md:text-2xl">{isMuted ? '🔇' : '🎙️'}</span>
           </button>

           <button 
             onClick={isActive ? stopSession : startSession}
             className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative ${isActive ? 'bg-white text-black scale-105' : 'bg-orange-600 text-white hover:scale-105'}`}
           >
             <span className="text-3xl md:text-4xl relative z-10">{isActive ? '⏹️' : '🎤'}</span>
           </button>

           <button 
             onClick={() => onSaveAsChat(history)}
             className="p-4 md:p-5 rounded-full bg-white/5 text-zinc-200 border border-white/10 hover:text-white transition-all disabled:opacity-20"
             disabled={history.length === 0}
           >
             <span className="text-xl md:text-2xl">💾</span>
           </button>
      </div>
    </div>
  );
};

export default VoiceInterface;
