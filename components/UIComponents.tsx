import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'danger';
  className?: string;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading,
  ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 border border-transparent",
    secondary: "bg-white text-gray-900 hover:bg-gray-50 shadow-md border border-gray-200",
    glass: "bg-white/30 backdrop-blur-md border border-white/50 text-white hover:bg-white/40 shadow-lg",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ 
  children, 
  className = '',
  onClick
}) => {
  return (
    <motion.div 
      whileHover={onClick ? { y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`glass-panel bg-white/60 rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-white/60 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const SectionTitle: React.FC<{ title: string; subtitle?: string; center?: boolean }> = ({ title, subtitle, center }) => (
  <div className={`mb-12 ${center ? 'text-center' : ''}`}>
    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">{title}</h2>
    {subtitle && <p className="text-gray-500 text-lg max-w-2xl mx-auto">{subtitle}</p>}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "blue" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
    {children}
  </span>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <input
      className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm ${className}`}
      {...props}
    />
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
    <textarea
      className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm min-h-[120px] ${className}`}
      {...props}
    />
  </div>
);