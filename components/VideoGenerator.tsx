
import React, { useState, useRef, useEffect } from 'react';
import { generateVideo } from '../services/gemini';
import { translations } from '../utils/translations';
import { useAppSettings, useUI, useApi } from '../contexts/AppContext';

const VideoGenerator: React.FC = () => {
  const { appSettings } = useAppSettings();
  const { showToast } = useUI();
  const { apiConfigs } = useApi();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lang = appSettings?.language === 'he' ? 'he' : 'he';
  const t = translations[lang];
  const isRTL = lang === 'he';
  
  const loadingMessages = [
    "מאתחל מנוע וידאו...",
    "מרכיב את הסצנה פיקסל אחר פיקסל...",
    "מלמד את הבינה המלאכותית על קולנוע...",
    "זה עשוי לקחת מספר דקות, אנחנו מכינים קפה וירטואלי...",
    "מבצע רינדור של הפריימים הראשונים...",
    "מוסיף אפקטים מיוחדים...",
    "כמעט שם, מבצע ליטוש אחרון..."
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      let i = 0;
      setProgressMsg(loadingMessages[i]);
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setProgressMsg(loadingMessages[i]);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBaseImage(event.target?.result as string);
        setMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt && !baseImage) return;
    
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
    }

    setLoading(true);
    setResult(null);
    try {
      const url = await generateVideo(prompt, () => {}, baseImage || undefined, mimeType, aspectRatio, apiConfigs);
      setResult(url);
    } catch (e: any) {
      // UX FIX: Replaced jarring `alert()` with styled Toast notifications.
      // This provides clearer, less intrusive feedback to the user, especially
      // for API key and billing issues, improving the overall experience.
      if (e.message && e.message.includes("was not found")) {
        showToast("שגיאה. יצירת וידאו דורשת מפתח API מפרויקט Google Cloud עם חיוב פעיל.", "info");
        window.aistudio?.openSelectKey();
      } else {
        showToast("שגיאה ביצירת הווידאו. אנא נסה שנית.", "info");
      }
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-16 animate-in fade-in duration-700 bg-[#020205] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-12 pb-24">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
           <div className={isRTL ? 'text-right' : 'text-left'}>
              <h2 className="text-3xl md:text-7xl font-black text-white italic tracking-tighter glow-text leading-none uppercase">{t.videoTitle} <span className="text-indigo-500">PRO</span></h2>
              <p className="text-zinc-500 text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.4em] uppercase mt-2">{t.videoSubtitle}</p>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setAspectRatio('16:9')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === '16:9' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'}`}
              >
                {t.landscape}
              </button>
              <button 
                onClick={() => setAspectRatio('9:16')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === '9:16' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500'}`}
              >
                {t.portrait}
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-4 space-y-6">
              <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">{t.animateImage}</h4>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="glass p-10 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-white/5 transition-all overflow-hidden relative"
              >
                 {baseImage ? (
                   <>
                     <img src={baseImage} alt="Source" className="w-full h-full object-cover absolute inset-0 opacity-40" />
                     <div className="relative z-10 text-white font-black text-xs uppercase">{t.replace}</div>
                   </>
                 ) : (
                   <>
                     <span className="text-6xl mb-4">🖼️</span>
                     <p className="text-xs font-bold text-zinc-500 text-center uppercase tracking-widest">{t.clickToAnimate}</p>
                   </>
                 )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
           </div>

           <div className="lg:col-span-8 space-y-6 md:space-y-10">
              <div className="glass p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] border border-white/5 space-y-6 md:space-y-10 shadow-3xl bg-white/[0.01]">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block pr-2">{t.sceneDesc}</label>
                   <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] p-6 md:p-8 text-lg md:text-xl text-white outline-none focus:ring-2 ring-indigo-500/20 h-32 md:h-48 resize-none font-medium placeholder-zinc-800"
                      placeholder={isRTL ? "תאר את הסצנה לסרטון..." : "Describe the video scene..."}
                   />
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={loading || (!prompt && !baseImage)}
                  className="w-full py-4 md:py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl md:text-2xl rounded-3xl md:rounded-[2.5rem] shadow-2xl transition-all hover:scale-105 active:scale-90 flex items-center justify-center gap-4 group"
                >
                  {loading ? <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>{t.renderVideo}</span>}
                </button>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center p-20 space-y-8 glass rounded-[3rem] border border-white/10">
                   <div className="text-center">
                      <div className="text-2xl font-black text-white italic tracking-tighter uppercase transition-all duration-500">{progressMsg}</div>
                   </div>
                </div>
              )}

              {result && (
                <div className="animate-in zoom-in-95 duration-1000 space-y-8 pb-20">
                  <div className="glass p-4 rounded-[3.5rem] border border-indigo-500/20 shadow-3xl overflow-hidden">
                     <video src={result} controls autoPlay loop className="w-full h-auto rounded-[2.5rem] shadow-2xl" />
                  </div>
                  <div className="flex justify-center">
                     <a href={result} download="panda-video.mp4" className="px-16 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-2xl shadow-xl transition-all active:scale-95">{t.downloadVideo}</a>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;