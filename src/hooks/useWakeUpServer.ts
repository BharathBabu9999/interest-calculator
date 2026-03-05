import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/**
 * Pings /health on mount to wake a sleeping Render instance.
 * Returns `isWarmingUp = true` after 1.5 s if the server hasn't responded yet,
 * and flips it back to false once the ping completes.
 */
export function useWakeUpServer() {
  const [isWarmingUp, setIsWarmingUp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => {
      if (!cancelled) setIsWarmingUp(true);
    }, 1500);

    fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(60_000) })
      .catch(() => {})
      .finally(() => {
        clearTimeout(slowTimer);
        if (!cancelled) setIsWarmingUp(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, []);

  return isWarmingUp;
}
