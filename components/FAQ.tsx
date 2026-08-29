'use client';

import React, { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQProps {
  items: FAQItem[];
  title?: string;
}

export const FAQ: React.FC<FAQProps> = ({
  items,
  title = 'Frequently Asked Questions',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-200">{title}</h3>
      <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#0B1020]/80 backdrop-blur-xl shadow-xl">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="p-4">
              <button
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-100 focus:outline-none hover:text-blue-400 transition-colors"
              >
                <span>{item.question}</span>
                <span className="ml-2 font-mono text-xs text-blue-400 font-bold">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className="mt-2.5 text-xs leading-relaxed text-slate-400 border-t border-white/5 pt-2 animate-fadeIn">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
