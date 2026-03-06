import { useEffect, useState, type ReactNode } from "react";

type ToastType = "success" | "error" | "info";

export interface ToastDetail {
  label: string;
  value: string;
}

interface ToastProps {
  message: string;
  type?: ToastType;
  details?: ToastDetail[];
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "success", details, duration = 4500, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => { cancelAnimationFrame(enter); clearTimeout(timer); };
  }, [duration, onClose]);

  const iconBg: Record<ToastType, string> = {
    success: "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400",
    error:   "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
    info:    "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
  };

  const icons: Record<ToastType, ReactNode> = {
    success: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
      </svg>
    ),
  };

  const strip: Record<ToastType, string> = {
    success: "bg-green-500 dark:bg-green-600",
    error:   "bg-red-500 dark:bg-red-600",
    info:    "bg-blue-500 dark:bg-blue-600",
  };

  return (
    <div
      className={`
        fixed top-6 left-1/2 z-50 -translate-x-1/2
        w-full max-w-sm
        bg-white dark:bg-slate-800
        rounded-2xl shadow-2xl overflow-hidden
        transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      {/* Coloured top strip */}
      <div className={`h-1.5 w-full ${strip[type]}`} />

      {/* Header */}
      <div className="flex items-start gap-4 px-5 pt-5 pb-4">
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconBg[type]}`}>
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 dark:text-white">{message}</p>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors mt-0.5"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Detail grid */}
      {details && details.length > 0 && (
        <div className="border-t border-gray-100 dark:border-slate-700 grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4">
          {details.map((d) => (
            <div key={d.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-0.5">{d.label}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{d.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
