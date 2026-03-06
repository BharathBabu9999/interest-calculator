import { useState } from "react";
import { formatDateForDisplay, parseDDMMYYYY } from "../utils/dateUtils";

interface DateInputProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

/**
 * A text input that displays and accepts dates in DD/MM/YYYY format.
 * Internally keeps a draft string while the user is typing and commits
 * the parsed Date on blur (or when Enter is pressed).
 */
export default function DateInput({ value, onChange, className }: DateInputProps) {
  const [draft, setDraft] = useState(formatDateForDisplay(value));
  const [invalid, setInvalid] = useState(false);
  // Track the last external value seen — using state (not a ref) so we can
  // update it during render without triggering extra effects.
  const [lastExternalValue, setLastExternalValue] = useState(value);

  // Sync external value changes (e.g. a "Today" reset) into the draft string.
  // Setting state during render is the React-recommended way to derive state
  // from a changing prop without running an extra effect cycle.
  if (lastExternalValue !== value) {
    setLastExternalValue(value);
    setDraft(formatDateForDisplay(value));
    setInvalid(false);
  }

  function commit(text: string) {
    const parsed = parseDDMMYYYY(text);
    if (parsed) {
      setInvalid(false);
      setDraft(formatDateForDisplay(parsed)); // normalise display
      onChange(parsed);
    } else {
      setInvalid(true);
    }
  }

  return (
    <input
      type="text"
      value={draft}
      placeholder="DD/MM/YYYY"
      onChange={(e) => {
        setDraft(e.target.value);
        setInvalid(false);
      }}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit((e.target as HTMLInputElement).value);
      }}
      className={`${className ?? ""} ${invalid ? "border-red-500 ring-1 ring-red-500" : ""}`}
    />
  );
}
