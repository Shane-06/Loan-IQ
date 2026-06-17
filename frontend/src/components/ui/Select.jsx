import React from 'react';

const Select = React.forwardRef(({
  label,
  options = [],
  error = '',
  helperText = '',
  className = '',
  id,
  required = false,
  ...props
}, ref) => {
  const selectId = id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-hdfc-gray-800 dark:text-slate-300"
        >
          {label} {required && <span className="text-hdfc-red">*</span>}
        </label>
      )}

      <select
        id={selectId}
        ref={ref}
        required={required}
        className={`px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 border-hdfc-gray-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-hdfc-blue focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-hdfc-gray-50
          ${error ? 'border-hdfc-red focus:ring-hdfc-red' : ''}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-xs text-hdfc-red font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xxs text-hdfc-gray-300 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
