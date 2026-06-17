import React from 'react';

export const Card = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className = '', children, ...props }) => {
  return (
    <div className={`p-6 border-b border-hdfc-gray-100 dark:border-slate-800 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ className = '', children, ...props }) => {
  return (
    <h3
      className={`text-lg font-semibold text-hdfc-gray-900 dark:text-white tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ className = '', children, ...props }) => {
  return (
    <p
      className={`text-xs text-hdfc-gray-300 dark:text-slate-400 mt-1 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ className = '', children, ...props }) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`px-6 py-4 bg-hdfc-gray-50/50 dark:bg-slate-800/20 border-t border-hdfc-gray-100 dark:border-slate-800 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
