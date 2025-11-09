import React from 'react';

// Modify the Input component to forward the ref
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div className="relative flex-1">
        <input
          ref={ref}
          type="text"
          className={`px-3 py-1 border rounded focus:ring-2 focus:ring-purple-500 outline-none bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

// Ensure the component properly forwards refs
Input.displayName = 'Input';
