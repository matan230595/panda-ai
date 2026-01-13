
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  customLogo?: string;
  isLoading?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, customLogo, isLoading }) => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  };

  return (
    <div className={`flex items-center gap-4 select-none transition-all ${isLoading ? 'scale-105' : ''}`}>
      <div className={`${sizes[size]} rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-orange-600 to-black flex items-center justify-center text-2xl shadow-2xl relative ${isLoading ? 'animate-pulse ring-4 ring-orange-500/20' : ''}`}>
        {customLogo ? (
          <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <span className="relative z-10">🐼</span>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-orange-600/20 animate-ping rounded-full"></div>
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col text-right">
          <div dir="ltr" className={`font-black tracking-tighter leading-none text-white uppercase italic ${textSizes[size]}`}>
            Panda<span className="text-orange-500">Ai</span>
          </div>
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1 mr-1">סטודיו עלית</div>
        </div>
      )}
    </div>
  );
};

export default Logo;
