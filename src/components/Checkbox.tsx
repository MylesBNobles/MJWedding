'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const checkboxId = id || props.name;

    return (
      <label htmlFor={checkboxId} className={`flex items-center gap-2 cursor-pointer ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className="
            w-4 h-4 rounded border-border text-accent
            focus:ring-2 focus:ring-accent focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          {...props}
        />
        <span className="text-sm text-fg">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
