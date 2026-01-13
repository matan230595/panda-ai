
import React from 'react';
import { translations } from '../utils/translations';
import { AppSettings } from '../types';

interface LegalModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | 'accessibility' | 'contact';
  appSettings: AppSettings;
}

const LegalModal: React.FC<LegalModalProps> = ({ title, isOpen, onClose, type, appSettings }) => {
  if (!isOpen) return null;
  const t = translations.he;
  const legal = appSettings.legalContent || {};

  // FALLBACK CONTENT if appSettings is empty
  const getContent = () => {
    switch (type) {
      case 'terms': return legal.terms || t.termsFull || "טוען תנאי שימוש...";
      case 'privacy': return legal.privacy || t.privacyFull || "טוען מדיניות פרטיות...";
      case 'accessibility': return legal.accessibility || t.accessibilityFull || "טוען הצהרת נגישות...";
      default: return '';
    }
  };

  const renderContent = (text: string) => {
    if (!text) return <p className="text-white font-bold text-center mt-10">התוכן יעודכן בקרוב.</p>;
    return text.split('\n').map((line, i) => (
      <p key={i} className={`mb-4 text-zinc-200 ${line.length < 60 && (line.includes(':') || line.includes('.')) ? 'font-black text-white text-lg mt-6 border-r-4 border-orange-500 pr-3' : 'text-base leading-relaxed'}`}>
        {line}
      </p>
    ));
  };

  return (
    // Z-INDEX 9999 FORCED
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in" dir="rtl">
      <div className="max-w-4xl w-full bg-[#0a0a0c] rounded-[2rem] border border-white/20 overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)] flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-white/10 flex justify-between items-center bg-[#1a1a1c]">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{title}</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-zinc-300 hover:text-white transition-all text-xl hover:bg-red-500/20">✕</button>
        </div>
        
        {/* Content - Force White Text */}
        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar text-right flex-1 bg-[#0a0a0c] text-white">
          {type === 'contact' ? (
            <div className="space-y-10">
               <div className="space-y-2">
                   <h4 className="text-3xl font-black text-white italic">צור קשר</h4>
                   <p className="text-zinc-400">אנחנו כאן לכל שאלה.</p>
               </div>
               <div className="space-y-6">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <label className="text-xs text-zinc-500 font-black uppercase">טלפון</label>
                       <p className="text-xl font-bold text-white">{legal.mobile || '050-XXXXXXX'}</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                       <label className="text-xs text-zinc-500 font-black uppercase">אימייל</label>
                       <p className="text-xl font-bold text-white">{legal.email || 'support@panda.co.il'}</p>
                   </div>
               </div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
               {renderContent(getContent())}
            </div>
          )}
        </div>
        
        <div className="px-8 py-5 border-t border-white/10 flex justify-end bg-[#1a1a1c]">
          <button onClick={onClose} className="px-8 py-3 bg-white/10 text-white font-black text-xs uppercase rounded-xl border border-white/5 hover:bg-white/20">סגור</button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
