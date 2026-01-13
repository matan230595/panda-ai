
import React, { useState, useRef } from 'react';
import { generateOrEditImage } from '../services/gemini';
import { AppSettings, ViewMode } from '../types';
import { translations } from '../utils/translations';

const ImageGenerator: React.FC<{ appSettings?: AppSettings; setView: (v: ViewMode) => void; }> = ({ appSettings, setView }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  // Ref Image State
  const [refImage, setRefImage] = useState<string | null>(null);
  const [refStrength, setRefStrength] = useState(70);
  const [refMode, setRefMode] = useState('balanced');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations.he;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
          alert('הקובץ גדול מדי (מקסימום 10MB)');
          return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setRefImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('הקובץ גדול מדי (מקסימום 10MB)');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setRefImage(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(null);
    try {
      const url = await generateOrEditImage(prompt, refImage || undefined, undefined, { 
        aspectRatio, 
        referenceStrength: refStrength / 100,
        mode: refMode 
      });
      setResult(url);
    } catch (e) {
        alert('שגיאה ביצירת התמונה. נסה שנית.');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-[#020205] text-right" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-12 pb-24">
        <div className="flex justify-between items-center border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setView(ViewMode.DASHBOARD)} className="px-4 py-2 bg-white/5 rounded-xl text-white hover:bg-orange-600 transition-all font-bold text-xs shadow-lg">{t.back}</button>
            <h2 className="text-4xl font-black text-white italic">סטודיו תמונות <span className="text-orange-600 uppercase italic">PRO</span></h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-4 space-y-8">
            <div className="glass p-8 rounded-[3rem] border border-white/10 bg-white/[0.01] space-y-6">
              <textarea 
                value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder={t.imagePlaceholder}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none h-40 resize-none focus:border-orange-500/50 transition-all font-medium"
              />
              
              {/* RESTORED REFERENCE IMAGE SECTION */}
              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">{t.imageRefLabel}</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="h-48 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 overflow-hidden relative group transition-all"
                >
                  {refImage ? (
                    <>
                        <img src={refImage} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="ref" />
                        <div className="relative z-10 bg-black/60 px-4 py-2 rounded-xl text-white text-xs font-bold hover:bg-red-600/80 transition-colors" onClick={(e) => { e.stopPropagation(); setRefImage(null); }}>הסר תמונה ✕</div>
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                        <div className="text-4xl opacity-50">🖼️</div>
                        <span className="text-xs text-zinc-500 font-bold block">{t.imageRefDesc}</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>

              {refImage && (
                <div className="space-y-6 p-6 bg-white/5 rounded-3xl border border-white/5 animate-in slide-in-from-top-4 fade-in">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      <span>{t.imageRefStrength}</span>
                      <span>{refStrength}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={refStrength} onChange={e => setRefStrength(parseInt(e.target.value))} className="w-full accent-orange-600 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">{t.imageRefMode}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['balanced', 'style', 'layout', 'colors'].map(m => (
                        <button key={m} onClick={() => setRefMode(m)} className={`py-2 rounded-xl text-[10px] font-black border transition-all ${refMode === m ? 'bg-orange-600 border-orange-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-zinc-500 hover:text-white'}`}>
                          {m === 'balanced' ? t.imageRefModeBalanced : m === 'style' ? t.imageRefModeStyle : m === 'layout' ? t.imageRefModeLayout : t.imageRefModeColors}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                  <button onClick={handleGenerate} disabled={loading || !prompt} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl rounded-2xl shadow-xl transition-all active:scale-95 uppercase italic tracking-wider">
                    {loading ? t.loading : t.generateImage}
                  </button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8">
            <div className="glass min-h-[600px] h-full rounded-[3rem] border border-white/10 flex items-center justify-center overflow-hidden bg-black/20 relative">
              {result ? (
                  <img src={result} className="w-full h-full object-contain animate-in zoom-in-95 duration-700" alt="result" />
              ) : (
                  <div className="text-center opacity-20">
                      <div className="text-9xl mb-4">🎨</div>
                      <p className="text-2xl font-black uppercase tracking-widest">Panda Art Studio</p>
                  </div>
              )}
              {loading && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
                      <div className="w-20 h-20 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                      <div className="text-white font-black italic text-2xl uppercase tracking-widest animate-pulse">{t.loading}</div>
                  </div>
              )}
            </div>
            {result && (
                <div className="flex justify-center mt-8">
                    <a href={result} download="panda-art.png" className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold border border-white/10 transition-all flex items-center gap-2">
                        <span>⬇️</span> {t.downloadVideo} (PNG)
                    </a>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
