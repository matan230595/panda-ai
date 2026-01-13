
import React from 'react';

interface LegalModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | 'accessibility' | 'contact';
  content?: string; // New prop for dynamic content
}

const LegalModal: React.FC<LegalModalProps> = ({ title, isOpen, onClose, type, content }) => {
  if (!isOpen) return null;

  // Function to render text with newlines as paragraphs
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className={`mb-3 ${line.startsWith('•') || line.startsWith('-') ? 'mr-4 text-zinc-400' : 'text-zinc-300'} ${line.length < 50 && !line.startsWith('•') ? 'font-black text-white mt-4 mb-2' : ''}`}>
        {line}
      </p>
    ));
  };

  const getStaticContact = () => (
    <div className="space-y-6 text-center py-8">
      <div className="text-5xl mb-4">🐼</div>
      <h4 className="text-xl font-black text-white italic">Panda Agency - Digital Solutions</h4>
      <div className="space-y-2 text-zinc-400 font-medium">
        <p>Email: hello@panda-agency.co.il</p>
        <p>Tel: +972-50-XXXXXXX</p>
        <p>HQ: Azrieli Towers, Tel Aviv</p>
      </div>
      <div className="pt-4">
        <button className="px-8 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-500 transition-all">
          Send Message
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="max-w-xl w-full glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-3xl bg-[#0a0a14] animate-in zoom-in-95">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-all text-xl">✕</button>
        </div>
        
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar text-sm leading-relaxed">
          {type === 'contact' ? getStaticContact() : (content ? renderContent(content) : <p>Loading content...</p>)}
        </div>
        
        <div className="px-8 py-4 border-t border-white/5 flex justify-end bg-black/20">
          <button onClick={onClose} className="px-6 py-2 bg-white/5 text-zinc-400 hover:text-white rounded-lg font-bold text-xs uppercase transition-all">
             Close / סגור
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
