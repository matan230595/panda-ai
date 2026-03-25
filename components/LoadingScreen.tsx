import React from 'react';
import { motion } from 'framer-motion';
import { PandaAvatar } from './PandaAvatar';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#050508] text-white min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          {/* Glowing background */}
          <motion.div 
            className="absolute inset-0 bg-orange-500/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <PandaAvatar size={120} className="relative z-10" />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            Panda <span className="text-orange-500">AI</span>
          </h2>
          <div className="flex items-center gap-1 text-zinc-500 text-sm font-medium">
            <span>טוען את המערכת</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >.</motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            >.</motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            >.</motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
