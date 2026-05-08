import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Input({ className, ...props }) {
  return (
    <input 
      className={twMerge(clsx(
        "w-full bg-gray-100 dark:bg-neutral-900 border border-transparent focus:border-gray-300 dark:focus:border-neutral-700 rounded-2xl px-4 py-3 text-sm outline-none transition-colors text-neutral-900 dark:text-white placeholder:text-gray-400",
        className
      ))}
      {...props}
    />
  );
}
