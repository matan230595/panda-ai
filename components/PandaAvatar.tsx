import React from 'react';
import { motion } from 'framer-motion';

interface PandaAvatarProps {
  className?: string;
  size?: number;
}

export const PandaAvatar: React.FC<PandaAvatarProps> = ({ className = "", size = 40 }) => {
  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{ 
        y: [0, -5, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Ears */}
        <motion.circle 
          cx="20" cy="25" r="15" fill="#111" 
          animate={{ rotate: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          style={{ originX: '20px', originY: '25px' }}
        />
        <motion.circle 
          cx="80" cy="25" r="15" fill="#111" 
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.2 }}
          style={{ originX: '80px', originY: '25px' }}
        />
        
        {/* Head */}
        <circle cx="50" cy="55" r="40" fill="#fff" />
        
        {/* Eye Patches */}
        <ellipse cx="32" cy="50" rx="14" ry="18" fill="#111" transform="rotate(-15 32 50)" />
        <ellipse cx="68" cy="50" rx="14" ry="18" fill="#111" transform="rotate(15 68 50)" />
        
        {/* Eyes (Whites) */}
        <circle cx="34" cy="48" r="4" fill="#fff" />
        <circle cx="66" cy="48" r="4" fill="#fff" />
        
        {/* Pupils (Animated) */}
        <motion.circle 
          cx="35" cy="48" r="2" fill="#f97316" /* Orange-500 */
          animate={{ cx: [35, 33, 35], cy: [48, 49, 48] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.circle 
          cx="65" cy="48" r="2" fill="#f97316" /* Orange-500 */
          animate={{ cx: [65, 67, 65], cy: [48, 49, 48] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Nose */}
        <ellipse cx="50" cy="65" rx="6" ry="4" fill="#111" />
        
        {/* Mouth */}
        <path d="M 42 72 Q 50 78 58 72" stroke="#111" strokeWidth="3" strokeLinecap="round" fill="none" />
        
        {/* Cheeks */}
        <circle cx="22" cy="62" r="6" fill="#fca5a5" opacity="0.6" />
        <circle cx="78" cy="62" r="6" fill="#fca5a5" opacity="0.6" />
      </svg>
    </motion.div>
  );
};
