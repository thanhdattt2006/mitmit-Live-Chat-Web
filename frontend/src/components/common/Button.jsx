import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Button({ children, className, variant = 'primary', disabled, ...props }) {
  const baseStyle = "px-4 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-gray-200",
    secondary: "bg-gray-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-gray-200 dark:hover:bg-neutral-700",
    outline: "border border-gray-200 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white text-neutral-900 dark:text-white bg-transparent",
    ghost: "bg-transparent shadow-none hover:shadow-none hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white"
  };

  return (
    <button 
      className={twMerge(clsx(
        baseStyle, 
        variants[variant], 
        disabled && "opacity-50 cursor-not-allowed active:scale-100 shadow-none hover:shadow-none",
        className
      ))} 
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
