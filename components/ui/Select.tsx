import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  // Group options if group property exists
  const groupedOptions = options.reduce<Record<string, SelectOption[]>>((acc, option) => {
    const group = option.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {});

  const hasGroups = Object.keys(groupedOptions).length > 1 || !groupedOptions['General'];

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
        {...props}
      >
        {hasGroups
          ? Object.entries(groupedOptions).map(([group, opts]) => (
              <optgroup
                key={group}
                label={group}
                className="bg-white text-slate-900 font-bold dark:bg-slate-900 dark:text-slate-100"
              >
                {opts.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1"
                  >
                    {opt.label}
                  </option>
                ))}
              </optgroup>
            ))
          : options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 py-1"
              >
                {opt.label}
              </option>
            ))}
      </select>
      {helperText && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
};
