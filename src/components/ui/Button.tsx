import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = ''
}: ButtonProps) {
  const baseStyles = `
    font-semibold py-3 px-8 rounded-lg border
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    font-mono uppercase tracking-wider text-sm
    relative overflow-hidden
  `;

  const variants = {
    primary: `
      bg-portal-primary/10 hover:bg-portal-primary/20
      text-portal-primary border-portal-primary
      shadow-glow-primary hover:shadow-glow-primary
    `,
    secondary: `
      bg-portal-secondary/10 hover:bg-portal-secondary/20
      text-portal-secondary border-portal-secondary
      shadow-glow-secondary hover:shadow-glow-secondary
    `,
    danger: `
      bg-portal-danger/10 hover:bg-portal-danger/20
      text-portal-danger border-portal-danger
      shadow-glow-danger hover:shadow-glow-danger
    `,
    success: `
      bg-portal-success/10 hover:bg-portal-success/20
      text-portal-success border-portal-success
      shadow-glow-success hover:shadow-glow-success
    `,
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {/* Effet de brillance au survol */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.5 }}
      />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <motion.svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </motion.svg>
            <span>CHARGEMENT...</span>
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}
