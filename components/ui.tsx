import React from 'react';
import { Loader2, ChevronDown } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyle = "px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 transform active:scale-95";
  const variants = {
    primary: "bg-[#002147] text-white hover:bg-[#2264ab] shadow-lg shadow-[#002147]/20",
    secondary: "bg-[#2264ab] text-white hover:bg-[#89cff0] hover:text-[#002147] shadow-lg shadow-[#2264ab]/20",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20",
    outline: "border-2 border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

interface InputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  className?: string;
  accept?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
  accept
}) => (
  <div className={`flex flex-col gap-1.5 sm:gap-2 ${className}`}>
    {label && <label className="text-sm sm:text-base font-bold text-[#002147] ml-1">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      accept={accept}
      className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-base sm:text-lg text-[#002147] focus:bg-white focus:ring-4 focus:ring-[#89cff0]/30 focus:border-[#2264ab] outline-none transition-all placeholder:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#2264ab]/10 file:text-[#2264ab] hover:file:bg-[#2264ab]/20"
    />
  </div>
);

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  className = "",
  rows = 4
}) => (
  <div className={`flex flex-col gap-1.5 sm:gap-2 ${className}`}>
    {label && <label className="text-sm sm:text-base font-bold text-[#002147] ml-1">{label}</label>}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-base sm:text-lg text-[#002147] focus:bg-white focus:ring-4 focus:ring-[#89cff0]/30 focus:border-[#2264ab] outline-none transition-all placeholder:text-gray-400 resize-none"
    />
  </div>
);

interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  className = ""
}) => (
  <div className={`flex flex-col gap-1.5 sm:gap-2 ${className}`}>
    {label && <label className="text-sm sm:text-base font-bold text-[#002147] ml-1">{label}</label>}
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-base sm:text-lg focus:bg-white focus:ring-4 focus:ring-[#89cff0]/30 focus:border-[#2264ab] outline-none transition-all appearance-none text-[#002147]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => (
  <div 
    className={`bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 border border-gray-100 ${className}`}
    {...props}
  >
    {children}
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-[#002147]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200 custom-scrollbar">
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur rounded-t-[2rem] z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-[#002147]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
             <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        <div className="p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
