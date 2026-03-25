import React, { useState, useEffect, useMemo } from 'react';
import { ViewMode, AIEngine } from '../types';
import { generateWebComponent } from '../services/gemini';
import { useUI, useApi, useAppSettings } from '../contexts/AppContext';
import { translations } from '../utils/translations';

const PandaCoder: React.FC = () => {
  const { setView, showToast } = useUI();
  const { apiConfigs } = useApi();
  const { appSettings } = useAppSettings();

  const [prompt, setPrompt] = useState('');
  const [htmlCode, setHtmlCode] = useState('<!-- התוצאה תופיע כאן -->');
  const [cssCode, setCssCode] = useState('/* עיצובים יופיעו כאן */');
  const [jsCode, setJsCode] = useState('// קוד JavaScript יופיע כאן');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [engine, setEngine] = useState<AIEngine>({ provider: 'gemini' });

  const t = translations.he;
  
  const srcDoc = useMemo(() => `
    <html>
      <head>
        <style>${cssCode}</style>
      </head>
      <body>
        ${htmlCode}
        <script>${jsCode}</script>
      </body>
    </html>
  `, [htmlCode, cssCode, jsCode]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await generateWebComponent(prompt, engine, apiConfigs);
      setHtmlCode(result.html);
      setCssCode(result.css);
      setJsCode(result.js);
      showToast('הרכיב נוצר בהצלחה!', 'success');
    } catch (e) {
      showToast('שגיאה ביצירת הרכיב, נסה שוב', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
      const content = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panda Coder Component</title>
    <style>
        body { font-family: sans-serif; }
        ${cssCode}
    </style>
</head>
<body>
    ${htmlCode}
    <script>
        ${jsCode}
    </script>
</body>
</html>`;
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'panda-component.html';
      a.click();
      URL.revokeObjectURL(url);
  };
  
  const handleCopyCode = () => {
    let codeToCopy = '';
    switch(activeTab) {
        case 'html': codeToCopy = htmlCode; break;
        case 'css': codeToCopy = cssCode; break;
        case 'js': codeToCopy = jsCode; break;
    }
    navigator.clipboard.writeText(codeToCopy);
    showToast(`קוד ${activeTab.toUpperCase()} הועתק!`, 'success');
  };

  const CodeEditor = ({ value, onChange, language }: { value: string, onChange: (v: string) => void, language: string }) => (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-full bg-transparent text-white font-mono outline-none resize-none p-4 custom-scrollbar text-sm"
      spellCheck="false"
    />
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050508]" dir="rtl">
      <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-white/10 bg-[#0d0d0f]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setView(ViewMode.DASHBOARD)} className="p-3 bg-white/5 rounded-xl text-white">חזור</button>
          <h2 className="text-2xl font-black text-white italic">Panda <span className="text-orange-600">Coder</span></h2>
        </div>
        <div className="flex gap-2">
            <button onClick={handleDownload} className="px-4 py-2 bg-white/5 rounded-xl text-xs font-black border border-white/10">הורד קובץ</button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Live Preview */}
        <div className="flex-1 lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-l border-white/10 min-h-[50vh] lg:min-h-0">
            <div className="p-3 bg-black/30 text-xs font-black uppercase text-zinc-500 border-b border-white/10">תצוגה חיה</div>
            <iframe
              srcDoc={srcDoc}
              title="Live Preview"
              sandbox="allow-scripts"
              className="w-full h-full bg-white"
            />
        </div>

        {/* Code Editor */}
        <div className="flex-1 lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-l border-white/10 min-h-[50vh] lg:min-h-0">
           <div className="p-2 bg-black/30 border-b border-white/10 flex justify-between items-center">
               <div className="flex gap-2">
                 {([ { id: 'html', label: 'HTML' }, { id: 'css', label: 'CSS' }, { id: 'js', label: 'JS' } ]).map(tab => (
                   <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 text-xs font-black rounded-lg ${activeTab === tab.id ? 'bg-orange-600 text-white' : 'text-zinc-500 hover:bg-white/10'}`}>{tab.label}</button>
                 ))}
               </div>
               <button onClick={handleCopyCode} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold text-zinc-300 hover:bg-white/20">העתק</button>
           </div>
           <div className="flex-1 bg-[#1e1e1e]">
              {activeTab === 'html' && <CodeEditor value={htmlCode} onChange={setHtmlCode} language="html" />}
              {activeTab === 'css' && <CodeEditor value={cssCode} onChange={setCssCode} language="css" />}
              {activeTab === 'js' && <CodeEditor value={jsCode} onChange={setJsCode} language="javascript" />}
           </div>
        </div>

        {/* Command Panel */}
        <div className="lg:w-[350px] flex-shrink-0 bg-[#0d0d0f] p-6 flex flex-col gap-6 lg:border-l border-white/10 min-h-[50vh] lg:min-h-0">
          <h3 className="text-lg font-black text-white uppercase italic">לוח בקרה</h3>
          <textarea 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="תאר את הרכיב שברצונך לבנות..."
            className="w-full flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none resize-none placeholder-zinc-500"
          />
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-white font-black text-lg rounded-xl shadow-lg transition-all"
          >
            {loading ? 'בונה...' : 'בנה רכיב 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PandaCoder;
