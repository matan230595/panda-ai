
import React, { useState, useRef } from 'react';
import { generateOrEditImage } from '../services/gemini';
import { AppSettings } from '../types';
import { translations } from '../utils/translations';

interface ImageGeneratorProps {
  appSettings?: AppSettings;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ appSettings }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lang = appSettings?.language || 'he';
  const t = translations[lang] || translations.he;
  const isRTL = lang === 'he';

  const aspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];

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
    if (!prompt) return;

    setLoading(true);
    try {
      const url = await generateOrEditImage(prompt, baseImage || undefined, mimeType, { aspectRatio });
      setResult(url);
    } catch (e) {
      console.error(e);
      alert("שגיאה ביצירת התמונה. אנא נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-12 md:p-24 bg-[#020205] scrollbar-hide ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-16 pb-24">
        <div className={isRTL ? 'text-right' : 'text-left'}>
           <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none glow-text">{t.imageTitle} <span className="text-orange-500">PRO</span></h2>
           <p className="text-zinc-500 text-[10px] font-black tracking-[0.4em] uppercase mt-4">{t.imageSubtitle}</p>
        </div>

        <div className="glass p-12 rounded-[4rem] border border-white/10 bg-white/[0.01] shadow-3xl space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-4">{t.whatToCreate}</label>
                <textarea 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-2xl text-white outline-none h-48 resize-none font-medium placeholder-zinc-900 shadow-inner"
                  placeholder={baseImage ? t.imageInputPlaceholder : t.imageGenPlaceholder}
                />
              </div>

              {/* Config Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-4">{t.aspectRatio}</label>
                    <div className="flex flex-wrap gap-2">
                       {aspectRatios.map(ratio => (
                         <button 
                           key={ratio} 
                           onClick={() => setAspectRatio(ratio)}
                           className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${aspectRatio === ratio ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}
                         >
                            {ratio}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6 flex flex-col items-center justify-center">
              <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-4 mb-4">{t.analyzeEdit}</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 bg-white/5 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all overflow-hidden relative"
              >
                 {baseImage ? (
                   <>
                     <img src={baseImage} alt="Source" className="w-full h-full object-cover opacity-50" />
                     <div className="absolute inset-0 flex items-center justify-center font-black text-white text-xs uppercase">{t.replace}</div>
                   </>
                 ) : (
                   <>
                     <span className="text-4xl mb-2">📸</span>
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{t.uploadPhoto}</span>
                   </>
                 )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full py-8 bg-orange-600 hover:bg-orange-500 text-white font-black text-2xl rounded-[2.5rem] shadow-2xl transition-all active:scale-95 italic uppercase flex items-center justify-center gap-4"
          >
            {loading ? <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>{baseImage ? t.processFlash : t.renderBtn}</span>}
          </button>
        </div>

        {result && (
          <div className="animate-in zoom-in-95 duration-1000 space-y-8 pb-32">
             <div className="glass p-4 rounded-[4rem] border border-orange-500/20 shadow-3xl overflow-hidden">
                <img src={result} alt="Generated" className="w-full h-auto rounded-[3rem] shadow-2xl mx-auto" />
             </div>
             <div className="flex justify-center gap-6">
                <a href={result} download="panda-art.png" className="px-12 py-5 bg-orange-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all">{t.downloadImage}</a>
                <button onClick={() => setResult(null)} className="px-12 py-5 bg-white/5 text-zinc-500 rounded-2xl font-black">{t.generateNew}</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
