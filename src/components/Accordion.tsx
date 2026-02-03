import { useState } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <span className="text-2xl font-semibold text-gray-900">{title}</span>
        <span className={`bg-gray-100 p-2 rounded-full transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}
