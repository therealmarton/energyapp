import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

interface DateWindowCtx {
  start: string;
  end: string;
  setStart: (s: string) => void;
  setEnd: (s: string) => void;
  reset: () => void;
  applyPreset: (preset: "day" | "week" | "month" | "year") => void;
  startIso: () => string;
  endIso: () => string;
}

const DEFAULT_START = "2026-06-01";
const DEFAULT_END = "2026-06-30";
const STORAGE_KEY = "ec:dateWindow";

const Ctx = createContext<DateWindowCtx | null>(null);

function readInitial(): { start: string; end: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return { start: DEFAULT_START, end: DEFAULT_END };
}

function persist(start: string, end: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ start, end }));
}

export function DateWindowProvider({ children }: PropsWithChildren) {
  const initial = readInitial();
  const [start, setStartState] = useState<string>(initial.start);
  const [end, setEndState] = useState<string>(initial.end);

  const setStart = useCallback(
    (s: string) => {
      setStartState(s);
      persist(s, end);
    },
    [end],
  );
  const setEnd = useCallback(
    (e: string) => {
      setEndState(e);
      persist(start, e);
    },
    [start],
  );
  const reset = useCallback(() => {
    setStartState(DEFAULT_START);
    setEndState(DEFAULT_END);
    persist(DEFAULT_START, DEFAULT_END);
  }, []);

  const applyPreset = useCallback((preset: "day" | "week" | "month" | "year") => {
    const e = new Date("2026-06-30");
    const s = new Date(e);
    if (preset === "day") s.setDate(e.getDate() - 1);
    if (preset === "week") s.setDate(e.getDate() - 6);
    if (preset === "month") s.setDate(e.getDate() - 29);
    if (preset === "year") {
      s.setFullYear(2026, 0, 1);
      e.setFullYear(2026, 11, 31);
    }
    const sStr = s.toISOString().slice(0, 10);
    const eStr = e.toISOString().slice(0, 10);
    setStartState(sStr);
    setEndState(eStr);
    persist(sStr, eStr);
  }, []);

  const value = useMemo<DateWindowCtx>(
    () => ({
      start,
      end,
      setStart,
      setEnd,
      reset,
      applyPreset,
      startIso: () => (start ? `${start}T00:00:00` : ""),
      endIso: () => (end ? `${end}T23:59:59` : ""),
    }),
    [start, end, setStart, setEnd, reset, applyPreset],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDateWindow(): DateWindowCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDateWindow must be used within DateWindowProvider");
  return v;
}
