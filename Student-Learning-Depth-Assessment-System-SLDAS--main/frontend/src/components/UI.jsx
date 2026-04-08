import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  ...props 
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg focus:ring-blue-500',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:shadow-md focus:ring-slate-200',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg focus:ring-red-500',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md hover:shadow-lg focus:ring-emerald-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />}
      {children}
    </button>
  );
};

export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{label}</label>}
      <input 
        className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
    </div>
  );
};

export const Card = ({ children, title, subtitle, className = '', footer }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Table = ({ headers, children, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/80 dark:bg-slate-900/80 sticky top-0 backdrop-blur-sm z-10">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, onClick, className = '' }) => {
  return (
    <tr 
      onClick={onClick} 
      className={`group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/50 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {React.Children.map(children, (child) => (
        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
          {child}
        </td>
      ))}
    </tr>
  );
};

export const Loader = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full border-blue-100 border-t-blue-600 ${sizes[size]}`}></div>
    </div>
  );
};
