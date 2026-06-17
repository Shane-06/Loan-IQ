import React from 'react';

const Input = React.forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  error = '',
  helperText = '',
  className = '',
  id,
  required = false,
  ...props
}, ref) => {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-hdfc-gray-800 dark:text-slate-300"
        >
          {label} {required && <span className="text-hdfc-red">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        ref={ref}
        required={required}
        className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 border-hdfc-gray-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-hdfc-blue focus:border-transparent transition-all duration-200 placeholder:text-hdfc-gray-300/60 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:bg-hdfc-gray-50
          ${error ? 'border-hdfc-red focus:ring-hdfc-red' : ''}
        `}
        {...props}
      />
      
      {error ? (
        <p className="text-xs text-hdfc-red font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xxs text-hdfc-gray-300 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
