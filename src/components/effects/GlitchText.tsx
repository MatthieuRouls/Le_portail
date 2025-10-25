import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlitchTextProps {
  children: ReactNode;
  className?: string;
}

export default function GlitchText({ children, className = '' }: GlitchTextProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative z-10">{children}</div>
      <motion.div
        className="absolute inset-0 text-red-500"
        animate={{
          x: [0, -2, 2, -2, 0],
          opacity: [0, 0.8, 0, 0.8, 0],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        {children}
      </motion.div>
      <motion.div
        className="absolute inset-0 text-blue-500"
        animate={{
          x: [0, 2, -2, 2, 0],
          opacity: [0, 0.8, 0, 0.8, 0],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          repeatDelay: 3,
          delay: 0.1,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
