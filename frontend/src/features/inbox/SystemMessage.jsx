import React from 'react';

export default function SystemMessage({ text }) {
  return (
    <div className="flex justify-center my-4">
      <span className="bg-neutral-800 text-gray-400 text-[11px] px-4 py-1.5 rounded-full shadow-sm">
        {text}
      </span>
    </div>
  );
}
