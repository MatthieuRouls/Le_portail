import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
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
  const baseStyles = 'font-bold py-3 px-6 rounded-lg border-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono';
  
  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white border-red-800 shadow-[0_0_20px_rgba(220,38,38,0.3)]',
    secondary: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-800 shadow-[0_0_20px_rgba(147,51,234,0.3)]',
    danger: 'bg-red-700 hover:bg-red-800 text-white border-red-900',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <motion.svg 
            className="h-5 w-5" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </motion.svg>
          CHARGEMENT...
        </span>
      ) : children}
    </motion.button>
  );
}
