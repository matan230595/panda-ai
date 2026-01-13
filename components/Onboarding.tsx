
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "ברוך הבא ל-PandaAi Elite",
      desc: "סביבת העבודה המתקדמת ביותר לבינה מלאכותית. אנחנו כאן כדי להפוך את הרעיונות שלך למציאות.",
      icon: "🐼",
      color: "from-indigo-600 to-violet-700"
    },
    {
      title: "ניהול פרויקטים חכם",
      desc: "צור פרויקטים, העלה קבצים (Drag & Drop) ותן לבינה המלאכותית להכיר את הקוד והידע שלך לעומק.",
      icon: "📁",
      color: "from-emerald-500 to-teal-700"
    },
    {
      title: "מרכז מנועי ה-AI",
      desc: "חבר את ה-API של Google, OpenAI ועוד. נהל את כולם במקום אחד עם ביצועים מקסימליים.",
      icon: "🔌",
      color: "from-amber-500 to-orange-700"
    },
    {
      title: "כלי תקשורת ויצירה",
      desc: "שיחות קוליות, יצירת תמונות ווידאו, ועוזר הודעות אסטרטגי - הכל תחת קורת גג אחת.",
      icon: "🚀",
      color: "from-pink-600 to-rose-700"
    }
  ];

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      localStorage.setItem('panda_onboarding_v1', 'true');
      onComplete();
    }
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500" dir="rtl">
      <div className="max-w-2xl w-full glass rounded-[4rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.2)] animate-in zoom-in-95 duration-500">
        <div className={`h-2 bg-gradient-to-r ${current.color} transition-all duration-700`} style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
        
        <div className="p-10 md:p-16 text-center space-y-10">
          <div className={`w-32 h-32 md:w-40 md:h-40 mx-auto bg-gradient-to-br ${current.color} rounded-[2.5rem] flex items-center justify-center text-6xl md:text-8xl shadow-2xl animate-bounce duration-[3s]`}>
            {current.icon}
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none glow-text">{current.title}</h2>
            <p className="text-zinc-400 text-base md:text-xl font-medium leading-relaxed max-w-lg mx-auto italic">
              {current.desc}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <button 
              onClick={next}
              className={`flex-1 py-5 rounded-3xl font-black text-xl shadow-2xl transition-all active:scale-95 bg-gradient-to-r ${current.color} text-white`}
            >
              {step === steps.length - 1 ? "בוא נתחיל! 🚀" : "המשך לשלב הבא"}
            </button>
            {step < steps.length - 1 && (
              <button onClick={onComplete} className="px-10 py-5 text-zinc-600 hover:text-white transition-all text-sm font-black uppercase tracking-widest">דלג</button>
            )}
          </div>

          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'}`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
