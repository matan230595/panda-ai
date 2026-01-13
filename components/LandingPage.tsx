
import React from 'react';
import Logo from './Logo';
import { UserRole, AppSettings } from '../types';
import { translations } from '../utils/translations';

interface LandingPageProps {
  onStart: (role: UserRole) => void;
  customLogo?: string;
  appSettings: AppSettings;
  onLanguageChange: (lang: 'he' | 'en' | 'es') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, customLogo, appSettings, onLanguageChange }) => {
  const t = translations[appSettings.language] || translations.he;
  const isRTL = appSettings.language === 'he';

  return (
    <div className={`flex-1 overflow-y-auto scrollbar-hide bg-[#020205] ${isRTL ? 'text-right' : 'text-left'} font-['Heebo']`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>

        {/* Language Switcher */}
        <div className="absolute top-6 right-6 z-50 flex gap-2">
           {['he', 'en', 'es'].map((lang) => (
             <button 
               key={lang}
               onClick={() => onLanguageChange(lang as any)}
               className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${appSettings.language === lang ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
             >
               {lang}
             </button>
           ))}
        </div>

        <div className="relative z-10 max-w-6xl w-full text-center space-y-12 animate-in fade-in duration-1000">
          <div className="flex justify-center mb-12">
            <div className="p-4 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-2xl">
               <Logo size="md" customLogo={customLogo} showText={false} />
            </div>
          </div>

          <div className="space-y-8">
            <h1 className="text-6xl md:text-[8rem] font-black leading-[0.9] italic tracking-tighter uppercase hero-title glow-text">
              <span className="block" dir="ltr">PANDA <span className="text-indigo-500">AI</span></span>
              <span className="block mt-4 text-3xl md:text-5xl font-light normal-case tracking-normal text-zinc-400 opacity-80">{t.landingSubtitleSimple}</span>
            </h1>

            <p className="text-xl md:text-3xl text-zinc-500 font-medium max-w-3xl mx-auto leading-relaxed italic">
              {t.landingDescSimple}
            </p>
          </div>

          <div className="pt-12">
            <button 
              onClick={() => onStart(UserRole.BEGINNER)} 
              className="px-16 md:px-24 py-6 md:py-8 bg-white text-black font-black text-xl md:text-2xl rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase italic tracking-widest"
            >
              {t.landingCtaSimple} 🚀
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass p-12 rounded-[4rem] border border-white/5 bg-gradient-to-br from-indigo-500/[0.03] to-transparent h-[400px] flex flex-col justify-end">
            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">{t.intelUnleashed}</h3>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed italic">{t.intelDesc}</p>
          </div>
          <div className="glass p-12 rounded-[4rem] border border-white/5 bg-white/[0.01] h-[400px] flex flex-col items-center justify-center text-center">
            <span className="text-7xl mb-6">🎙️</span>
            <h4 className="text-2xl font-black text-white uppercase italic">{t.voice}</h4>
            <p className="text-zinc-600 text-sm mt-2">{t.voiceActive}</p>
          </div>
          <div className="glass p-12 rounded-[4rem] border border-white/5 bg-white/[0.01] h-[400px] flex flex-col items-center justify-center text-center">
            <span className="text-7xl mb-6">🎨</span>
            <h4 className="text-2xl font-black text-white uppercase italic">{t.imageGen}</h4>
            <p className="text-zinc-600 text-sm mt-2">{t.imageSubtitle}</p>
          </div>
          <div className="lg:col-span-2 glass p-12 rounded-[4rem] border border-white/5 bg-gradient-to-bl from-amber-500/[0.02] to-transparent h-[400px] flex flex-col justify-end">
            <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">{t.messageGen}</h3>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed italic">{t.stratMsgSubtitle}</p>
          </div>
        </div>
      </section>

      <footer className="py-20 text-center opacity-30">
        <Logo size="sm" showText={false} />
        <p className="text-[10px] font-black uppercase tracking-[1em] mt-8">© 2025 PANDAAI ELITE STUDIO</p>
      </footer>
    </div>
  );
};

export default LandingPage;
