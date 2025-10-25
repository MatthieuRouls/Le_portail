import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  glow?: boolean;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  className?: string;
}

export default function Card({
  children,
  glow = false,
  variant = 'default',
  className = ''
}: CardProps) {
  const variantStyles = {
    default: 'border-portal-primary/20',
    primary: 'border-portal-primary/30',
    danger: 'border-portal-danger/30',
    success: 'border-portal-success/30',
  };

  const glowStyles = {
    default: 'shadow-glow-primary',
    primary: 'shadow-glow-primary',
    danger: 'shadow-glow-danger',
    success: 'shadow-glow-success',
  };

  const cornerColor = {
    default: 'border-portal-primary/60',
    primary: 'border-portal-primary',
    danger: 'border-portal-danger',
    success: 'border-portal-success',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`
        bg-portal-bg-dark/80 backdrop-blur-md
        border ${variantStyles[variant]}
        rounded-lg p-6 shadow-2xl
        relative overflow-hidden
        ${glow ? glowStyles[variant] : ''}
        ${className}
      `}
    >
      {/* Coins décoratifs */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${cornerColor[variant]}`} />
      <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${cornerColor[variant]}`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${cornerColor[variant]}`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${cornerColor[variant]}`} />

      {/* Effet de scan subtle */}
      {glow && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-portal-primary/5 to-transparent"
          animate={{
            y: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {children}
    </motion.div>
  );
}
