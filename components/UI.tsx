
import React, { forwardRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm text-lg";
  
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-100",
    secondary: "bg-white text-teal-700 border-2 border-teal-600 hover:bg-teal-50",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
      {icon && <span>{icon}</span>}
    </button>
  );
};

export const NavigationBar: React.FC<{ 
  onBack?: () => void; 
  onNext?: () => void; 
  nextDisabled?: boolean;
}> = ({ onBack, onNext, nextDisabled }) => (
  <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-center bg-transparent pointer-events-none">
    <div className="w-full flex justify-between items-center px-4 pt-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 pointer-events-auto" style={{ paddingBottom: 'calc(2.5rem + var(--sab))' }}>
      <div className="pointer-events-auto">
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg px-4 py-2 transition-colors gap-1 font-medium"
          >
            <ChevronLeft size={20} />
            Indietro
          </button>
        )}
      </div>
      <div className="pointer-events-auto">
        {onNext && (
          <button 
            onClick={onNext}
            disabled={nextDisabled}
            className="flex items-center justify-center bg-teal-600 text-white hover:bg-teal-700 rounded-xl px-6 py-3 shadow-md gap-2 font-bold disabled:opacity-50 disabled:grayscale"
          >
             Avanti
             <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, required, className = '', ...props }, ref) => (
  <div className="mb-4 w-full">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <input 
      ref={ref}
      className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-lg bg-white text-gray-900 placeholder:text-gray-400 ${className}`}
      {...props}
    />
  </div>
));

export const ScreenLayout: React.FC<{ 
  title?: string; 
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}> = ({ title, subtitle, children, headerAction }) => (
  <div className="bg-white flex flex-col overflow-hidden h-[100dvh] screen-enter">
    <div className="pb-2 px-5 bg-white shrink-0 z-10 border-b border-gray-50" style={{ paddingTop: 'calc(1.5rem + var(--sat))' }}>
      <div className="flex justify-between items-start gap-4">
        <div>
           {title && <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>}
           {subtitle && <p className="text-gray-500 mt-1 text-sm font-medium">{subtitle}</p>}
        </div>
        {headerAction && <div className="mt-1">{headerAction}</div>}
      </div>
    </div>
    <div className="flex-1 px-5 py-4 overflow-y-auto no-scrollbar min-h-0" style={{ paddingBottom: 'calc(8rem + var(--sab))' }}>
      {children}
    </div>
  </div>
);
