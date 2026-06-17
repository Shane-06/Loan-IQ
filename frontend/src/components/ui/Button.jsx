import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-hdfc-blue text-white hover:bg-hdfc-blue-light focus:ring-hdfc-blue shadow-md hover:shadow-lg active:scale-98',
    secondary: 'bg-hdfc-gray-100 text-hdfc-gray-800 hover:bg-hdfc-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus:ring-hdfc-gray-300',
    accent: 'bg-gradient-to-r from-hdfc-blue to-hdfc-blue-light text-white hover:opacity-95 shadow-md focus:ring-hdfc-blue',
    danger: 'bg-hdfc-red text-white hover:bg-hdfc-red-light focus:ring-hdfc-red-dark shadow-md active:scale-98',
    outline: 'border border-hdfc-gray-300 dark:border-slate-700 bg-transparent text-hdfc-gray-700 dark:text-slate-300 hover:bg-hdfc-gray-100 dark:hover:bg-slate-800 focus:ring-hdfc-blue',
    ghost: 'bg-transparent text-hdfc-gray-700 dark:text-slate-300 hover:bg-hdfc-gray-100 dark:hover:bg-slate-800 focus:ring-hdfc-blue',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
