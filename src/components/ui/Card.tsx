import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  glow?: boolean;
  className?: string;
}

export default function Card({ children, glow = false, className = '' }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-900/90 backdrop-blur-sm border-2 border-red-900/30 rounded-lg p-6 shadow-2xl relative overflow-hidden ${glow ? 'shadow-red-500/20' : ''} ${className}`}
    >
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/50" />
      
      {children}
    </motion.div>
  );
}
