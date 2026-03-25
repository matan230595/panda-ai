
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { generateOrEditImage } from '../services/gemini';
import { ViewMode } from '../types';
import { translations } from '../utils/translations';
import { useAppSettings, useUI, useChat, useApi } from '../contexts/AppContext';

// --- Helper Components ---

const artisticStyles = [
    { name: 'ריאליסטי', prompt: 'photorealistic, 8k, detailed, professional photography, sharp focus', icon: '📸' },
    { name: 'אנימה', prompt: 'anime style, vibrant, studio ghibli inspired, detailed illustration', icon: '🌸' },
    { name: 'ציור שמן', prompt: 'classic oil painting, impasto, visible brushstrokes, masterpiece', icon: '🧑‍🎨' },
    { name: 'פיקסל ארט', prompt: '16-bit pixel art, retro gaming style, detailed sprite', icon: '👾' },
    { name: 'אמנות פנטזיה', prompt: 'fantasy art, epic, detailed, concept art, lord of the rings style', icon: '🧙' },
    { name: 'צבעי מים', prompt: 'watercolor painting, soft wash, vibrant colors, artistic', icon: '🎨' },
    { name: 'סייברפאנק', prompt: 'cyberpunk style, neon lights, futuristic city, dystopian', icon: '🤖' },
    { name: 'קומיקס', prompt: 'comic book style, bold lines, vibrant colors, pop art', icon: '💥' },
    { name: 'וינטג\'', prompt: 'vintage photography, retro, 1950s style, grainy', icon: '🎞️' },
    { name: 'מינימליסטי', prompt: 'minimalist, clean lines, simple, modern', icon: '⚪' },
    { name: 'תלת מימד', prompt: '3D render, blender, octane render, high detail', icon: '🧊' },
    { name: 'רישום פחם', prompt: 'charcoal drawing, sketch, black and white, dramatic lighting', icon: '✏️' },
    { name: 'ארכיטקטורה', prompt: 'architectural design, modern architecture, clean lines, realistic rendering', icon: '🏛️' },
    { name: 'אוכל', prompt: 'food photography, delicious, mouth-watering, detailed, professional lighting', icon: '🍔' },
    { name: 'טבע', prompt: 'nature photography, national geographic, beautiful landscape', icon: '🏞️' },
    { name: 'מופשט', prompt: 'abstract art, geometric, colorful, modern art', icon: '🌀' },
];

const StyleSelector: React.FC<{ selected: string, onSelect: (prompt: string) => void }> = ({ selected, onSelect }) => (
    <div className="space-y-3">
        <label className="text-[10px] font-black text-zinc-500 uppercase px-1">סגנון אמנותי</label>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {artisticStyles.map(style => (
                <button key={style.name} onClick={() => onSelect(style.prompt)} className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${selected === style.prompt ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white/5 border-transparent text-zinc-400 hover:bg-white/10'}`}>
                    <span>{style.icon}</span> {style.name}
                </button>
            ))}
        </div>
    </div>
);

const ImageEditor: React.FC<{ 
    imageUrl: string, 
    onDownload: (edits: any) => void, 
    onClose: () => void 
}> = ({ imageUrl, onDownload, onClose }) => {
    const [edits, setEdits] = useState({
        brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, blur: 0,
        rotate: 0, scaleX: 1, scaleY: 1
    });

    const resetEdits = () => setEdits({
        brightness: 100, contrast: 100, saturate: 100, grayscale: 0, sepia: 0, blur: 0,
        rotate: 0, scaleX: 1, scaleY: 1
    });

    const filterString = `brightness(${edits.brightness}%) contrast(${edits.contrast}%) saturate(${edits.saturate}%) grayscale(${edits.grayscale}%) sepia(${edits.sepia}%) blur(${edits.blur}px)`;
    const transformString = `rotate(${edits.rotate}deg) scaleX(${edits.scaleX}) scaleY(${edits.scaleY})`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in">
            <div className="lg:col-span-4 space-y-6">
                <h3 className="text-xl font-black text-white italic">עורך תמונות</h3>
                <div className="glass p-6 rounded-2xl border border-white/10 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <EditorSlider label="בהירות" value={edits.brightness} onChange={v => setEdits(e => ({...e, brightness: v}))} min={0} max={200} />
                    <EditorSlider label="ניגודיות" value={edits.contrast} onChange={v => setEdits(e => ({...e, contrast: v}))} min={0} max={200} />
                    <EditorSlider label="רוויה" value={edits.saturate} onChange={v => setEdits(e => ({...e, saturate: v}))} min={0} max={200} />
                    <EditorSlider label="גווני אפור" value={edits.grayscale} onChange={v => setEdits(e => ({...e, grayscale: v}))} />
                    <EditorSlider label="ספיה" value={edits.sepia} onChange={v => setEdits(e => ({...e, sepia: v}))} />
                    <EditorSlider label="טשטוש" value={edits.blur} onChange={v => setEdits(e => ({...e, blur: v}))} max={20} step={0.1} />
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
                        <button onClick={() => setEdits(e => ({...e, rotate: e.rotate - 90}))} className="p-2 bg-white/5 rounded-lg">סובב ⟲</button>
                        <button onClick={() => setEdits(e => ({...e, rotate: e.rotate + 90}))} className="p-2 bg-white/5 rounded-lg">סובב ⟳</button>
                        <button onClick={() => setEdits(e => ({...e, scaleX: e.scaleX * -1}))} className="p-2 bg-white/5 rounded-lg">הפוך ↔</button>
                        <button onClick={() => setEdits(e => ({...e, scaleY: e.scaleY * -1}))} className="p-2 bg-white/5 rounded-lg">הפוך ↕</button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={resetEdits} className="flex-1 py-3 bg-white/10 rounded-lg">אפס שינויים</button>
                    <button onClick={() => onDownload(edits)} className="flex-1 py-3 bg-emerald-600 rounded-lg">שמור עותק</button>
                </div>
                 <button onClick={onClose} className="w-full py-3 bg-orange-600 rounded-lg">צור תמונה חדשה</button>
            </div>
            <div className="lg:col-span-8 flex items-center justify-center">
                <img src={imageUrl} alt="Generated Art" className="rounded-2xl border-4 border-white/10 shadow-2xl max-h-[70vh] object-contain" style={{ filter: filterString, transform: transformString }}/>
            </div>
        </div>
    );
};

const EditorSlider: React.FC<{label: string, value: number, onChange: (v: number) => void, min?: number, max?: number, step?: number}> = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => (
    <div className="text-xs">
        <label className="font-bold text-zinc-400">{label}</label>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} className="w-full mt-1"/>
    </div>
);

// --- Main Component ---

const ImageGenerator: React.FC = () => {
  const { setView, showToast } = useUI();
  const { newChat } = useChat();
  const { apiConfigs } = useApi();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [selectedStyle, setSelectedStyle] = useState(artisticStyles[0].prompt);
  
  const t = translations.he;

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(null);
    try {
      const fullPrompt = `${prompt}, ${selectedStyle}`;
      const url = await generateOrEditImage(fullPrompt, undefined, undefined, { aspectRatio, imageSize }, apiConfigs);
      setResult(url);
    } catch (e) {
        showToast('שגיאה ביצירת התמונה. נסה שנית.', 'info');
    } finally { setLoading(false); }
  };

  const handleDownloadEdited = (edits: any) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = result!;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      const w = img.width;
      const h = img.height;
      
      canvas.width = w;
      canvas.height = h;

      ctx.filter = `brightness(${edits.brightness}%) contrast(${edits.contrast}%) saturate(${edits.saturate}%) grayscale(${edits.grayscale}%) sepia(${edits.sepia}%) blur(${edits.blur}px)`;

      ctx.translate(w / 2, h / 2);
      ctx.rotate(edits.rotate * Math.PI / 180);
      ctx.scale(edits.scaleX, edits.scaleY);
      ctx.drawImage(img, -w / 2, -h / 2);
      
      const link = document.createElement('a');
      link.download = 'panda-art-edited.png';
      link.href = canvas.toDataURL();
      link.click();
      showToast('התמונה הערוכה נשמרה!', 'success');
    };
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-[#020205] text-right" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-12 pb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-8 gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setView(ViewMode.DASHBOARD)} className="px-4 py-2 bg-white/5 rounded-xl text-white hover:bg-orange-600 transition-all font-bold text-xs shadow-lg">{t.back}</button>
            <h2 className="text-2xl md:text-4xl font-black text-white italic">סטודיו תמונות <span className="text-orange-600 uppercase italic">PRO</span></h2>
          </div>
        </div>

        {result ? (
            <ImageEditor imageUrl={result} onDownload={handleDownloadEdited} onClose={() => setResult(null)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-12 space-y-8">
               <div className="glass p-6 md:p-8 rounded-3xl md:rounded-[3rem] border border-white/10 bg-white/[0.01] shadow-2xl space-y-6">
                 <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t.imagePlaceholder} className="w-full h-24 bg-transparent text-white text-xl md:text-2xl font-bold outline-none resize-none placeholder-zinc-700"></textarea>
                 
                 <StyleSelector selected={selectedStyle} onSelect={setSelectedStyle} />

                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-6 border-t border-white/5 gap-6 md:gap-4">
                   <div className="flex gap-2 flex-wrap items-center">
                     <span className="text-xs font-bold text-zinc-500">יחס:</span>
                     {['1:1', '16:9', '9:16', '4:3', '3:4'].map(r => <button key={r} onClick={() => setAspectRatio(r)} className={`px-3 py-1.5 md:px-4 md:py-2 text-xs rounded-lg border ${aspectRatio === r ? 'bg-white text-black' : 'bg-white/5 text-zinc-400'}`}>{r}</button>)}
                     <div className="w-full h-2 md:hidden"></div>
                     <span className="text-xs font-bold text-zinc-500 md:ml-4">רזולוציה:</span>
                     {['1K', '2K', '4K'].map(s => <button key={s} onClick={() => setImageSize(s as any)} className={`px-3 py-1.5 md:px-4 md:py-2 text-xs rounded-lg border ${imageSize === s ? 'bg-white text-black' : 'bg-white/5 text-zinc-400'}`}>{s}</button>)}
                   </div>
                   <button onClick={handleGenerate} disabled={loading || !prompt} className="w-full md:w-auto px-8 py-3 md:py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl shadow-lg disabled:bg-zinc-700">
                    {loading ? 'יוצר...' : t.generateImage}
                   </button>
                 </div>
               </div>
               {loading && <div className="text-center p-20 text-orange-500 animate-pulse">מצייר יצירת מופת...</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
