
import React from 'react';

interface FAQModalProps {
  onClose: () => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ onClose }) => {
  const faqs = [
    { q: "איך אני מתחיל שיחה חדשה?", a: "לחץ על כפתור 'שיחה חדשה' (⚡) בתפריט הצדדי או במרכז המסך." },
    { q: "האם המידע שלי שמור?", a: "המידע נשמר מקומית על הדפדפן שלך. מפתחות API אינם נשמרים בשרתים שלנו." },
    { q: "איך להשתמש בחיפוש בזמן אמת?", a: "בחר במודל 'Gemini Research' או בקש מהמודל לחפש מידע עדכני." },
    { q: "איך ליצור תמונה?", a: "עבור לכלי 'סטודיו תמונות', כתוב תיאור ולחץ על 'צור'." },
    { q: "מה זה Agent Mode?", a: "מצב זה מאפשר למודל להשתמש בכלים, להריץ קוד ולבצע משימות מורכבות יותר." }
  ];

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={onClose} dir="rtl">
      <div className="max-w-2xl w-full bg-[#1e1e1e] rounded-2xl border border-[#444746] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#444746] flex justify-between items-center bg-[#2d2d2d]">
          <h3 className="text-lg font-bold text-white">שאלות נפוצות (FAQ)</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-4">
          {faqs.map((item, i) => (
            <div key={i} className="bg-[#2d2d2d] rounded-xl p-4 border border-[#444746]">
              <h4 className="font-bold text-white mb-2 text-sm">{item.q}</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-[#2d2d2d] border-t border-[#444746] text-center">
            <p className="text-xs text-zinc-500">לשאלות נוספות: support@panda-ai.co.il</p>
        </div>
      </div>
    </div>
  );
};

export default FAQModal;
