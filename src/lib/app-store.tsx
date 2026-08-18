import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type TimerConfig = {
  startedAt: number;
  freeMinutes: number;
  unitMinutes: number;
  unitFee: number | null;
  alertBefore: number | null;
};

export type Session = TimerConfig & { endedAt: number };

type Store = {
  duration: number;
  setDuration: (m: number) => void;
  place: string;
  setPlace: (p: string) => void;
  usingCurrentLocation: boolean;
  setUsingCurrentLocation: (v: boolean) => void;
  locationGranted: boolean;
  setLocationGranted: (v: boolean) => void;
  timer: TimerConfig | null;
  startTimer: (t: TimerConfig) => void;
  lastSession: Session | null;
  endTimer: () => void;
};

const Ctx = createContext<Store | null>(null);

const KEY = "yeogi-parking-state";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [duration, setDuration] = useState(120);
  const [place, setPlace] = useState("성수역");
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(true);
  const [locationGranted, setLocationGranted] = useState(true);
  const [timer, setTimer] = useState<TimerConfig | null>(null);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.timer) setTimer(s.timer);
        if (s.lastSession) setLastSession(s.lastSession);
        if (typeof s.duration === "number") setDuration(s.duration);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify({ timer, lastSession, duration }));
  }, [timer, lastSession, duration, hydrated]);

  const value = useMemo<Store>(
    () => ({
      duration,
      setDuration,
      place,
      setPlace,
      usingCurrentLocation,
      setUsingCurrentLocation,
      locationGranted,
      setLocationGranted,
      timer,
      startTimer: (t) => setTimer(t),
      lastSession,
      endTimer: () => {
        if (timer) setLastSession({ ...timer, endedAt: Date.now() });
        setTimer(null);
      },
    }),
    [duration, place, usingCurrentLocation, locationGranted, timer, lastSession],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside AppStoreProvider");
  return ctx;
}

/** 무료시간 이후 단위 올림 기준 예상요금 */
export function estimateFee(t: TimerConfig, nowMs: number) {
  if (t.unitFee == null) return null;
  const elapsedMin = Math.max(0, (nowMs - t.startedAt) / 60000);
  const paid = elapsedMin - t.freeMinutes;
  if (paid <= 0) return 0;
  return Math.ceil(paid / t.unitMinutes) * t.unitFee;
}

export function minutesToNextUnit(t: TimerConfig, nowMs: number) {
  const elapsedMin = (nowMs - t.startedAt) / 60000;
  const paid = elapsedMin - t.freeMinutes;
  if (paid <= 0) return Math.ceil(-paid);
  const units = Math.ceil(paid / t.unitMinutes);
  return Math.max(1, Math.ceil(units * t.unitMinutes - paid));
}

export function fmtClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function fmtTime(ms: number) {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function fmtDurationKo(ms: number) {
  const total = Math.floor(ms / 60000);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
}
