import { useState } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function Accordion({ title, children, defaultOpen = false, className = '' }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white dark:bg-slate-800/60 border border-transparent dark:border-slate-700/50 rounded-lg shadow dark:shadow-none mb-6 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 text-left focus:outline-none hover:bg-gray-50 dark:hover:bg-slate-700/40 transition-colors rounded-t-lg"
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-white">{title}</span>
        <span className={`bg-gray-100 dark:bg-slate-700 p-1.5 rounded-full transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-slate-700/50">
          {children}
        </div>
      )}
    </div>
  );
}
