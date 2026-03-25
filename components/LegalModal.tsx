
import React from 'react';
import DOMPurify from 'dompurify';
import { translations } from '../utils/translations';
import { useUI, useAppSettings } from '../contexts/AppContext';

const LegalModal: React.FC = () => {
  const { legalModal, closeLegalModal } = useUI();
  const { appSettings } = useAppSettings();

  if (!legalModal.isOpen) return null;
  
  const { type } = legalModal;
  const t = translations.he;
  const legal = appSettings.legalContent || { terms: '', privacy: '', accessibility: '', contact: '', mobile: '', email: '', address: '', waLink: '', mapEmbed: '' };
  
  const title = type === 'terms' ? t.terms : type === 'privacy' ? t.privacy : type === 'accessibility' ? t.accessibility : t.contact;

  const getContent = () => {
    switch (type) {
      case 'terms': return legal.terms && legal.terms.length > 10 ? legal.terms : t.termsFull;
      case 'privacy': return legal.privacy && legal.privacy.length > 10 ? legal.privacy : t.privacyFull;
      case 'accessibility': return legal.accessibility && legal.accessibility.length > 10 ? legal.accessibility : t.accessibilityFull;
      default: return '';
    }
  };

  const renderContent = (text: string) => {
    if (!text) return <p className="text-white">טוען תוכן...</p>;
    return text.split('\n').map((line, i) => (
      <p key={i} className={`mb-4 text-zinc-300 ${line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') ? 'font-black text-white text-lg mt-6 border-r-4 border-orange-500 pr-4' : 'text-base leading-relaxed'}`}>
        {line}
      </p>
    ));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" dir="rtl" onClick={closeLegalModal}>
      <div 
        className="max-w-4xl w-full bg-[#18181b] rounded-[2rem] border border-white/20 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        
        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-[#27272a] shrink-0">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{title}</h3>
          <button 
            onClick={closeLegalModal} 
            className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-zinc-300 hover:text-white hover:bg-white/20 transition-all text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar text-right flex-1 bg-[#18181b]">
          {type === 'contact' ? (
            <div className="space-y-10">
               <div className="space-y-4">
                  <h4 className="text-3xl font-black text-white italic">צור קשר</h4>
                  <p className="text-zinc-400">אנחנו זמינים לכל שאלה.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                     <div className="text-2xl mb-2">📞</div>
                     <div className="text-xs font-bold text-zinc-500 uppercase">טלפון</div>
                     <div className="text-lg font-bold text-white mt-1" dir="ltr">{legal.mobile || '050-XXXXXXX'}</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                     <div className="text-2xl mb-2">📧</div>
                     <div className="text-xs font-bold text-zinc-500 uppercase">מייל</div>
                     <div className="text-lg font-bold text-white mt-1 break-all">{legal.email || 'hello@panda.co.il'}</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                     <div className="text-2xl mb-2">📍</div>
                     <div className="text-xs font-bold text-zinc-500 uppercase">כתובת</div>
                     <div className="text-lg font-bold text-white mt-1">{legal.address || 'תל אביב, ישראל'}</div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <a href={legal.waLink || '#'} target="_blank" className="flex-1 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black rounded-xl text-center shadow-lg transition-transform hover:scale-[1.02]">
                      WhatsApp
                  </a>
                  <a href={`mailto:${legal.email}`} className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl text-center shadow-lg transition-transform hover:scale-[1.02]">
                      Email
                  </a>
               </div>
               
               {legal.mapEmbed && (
                 <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(legal.mapEmbed, { ADD_TAGS: ["iframe"], ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src", "width", "height", "style"] })}} />
               )}
            </div>
          ) : (
            <div className="text-zinc-300">
               {renderContent(getContent())}
            </div>
          )}
        </div>
        
        <div className="px-8 py-5 border-t border-white/10 bg-[#27272a] shrink-0 flex justify-end">
          <button onClick={closeLegalModal} className="px-8 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all text-sm">סגור</button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
