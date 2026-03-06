interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  /** Color applied when active. Defaults to "blue". */
  activeColor?: "blue" | "violet";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const activeClasses: Record<string, string> = {
  blue: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
  violet: "bg-violet-600 text-white border-violet-600 hover:bg-violet-700",
};

const inactiveClass =
  "bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600";

export default function ToggleButton({
  active,
  onClick,
  activeColor = "blue",
  icon,
  children,
}: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
        active ? activeClasses[activeColor] : inactiveClass
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
