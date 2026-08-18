import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPin, Clock, Navigation } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DURATIONS, LIVE_TEXT, feeFor, won, type Lot, type LiveStatus } from "@/lib/parking-data";

/** Apps in Toss 기본 navigation bar 아래에서 시작하는 화면 컨테이너 */
export function Screen({
  children,
  className,
  dock,
}: {
  children: ReactNode;
  className?: string;
  dock?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col bg-background">
      <div className={cn("flex-1 px-5 pt-3", dock ? "pb-40" : "pb-10", className)}>{children}</div>
      {dock ? (
        <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[420px] safe-bottom border-t border-border/60 bg-card/95 px-5 pt-3 shadow-dock backdrop-blur">
          {dock}
        </div>
      ) : null}
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="mb-4">
      <h1 className="text-[22px] font-bold leading-tight text-foreground">{title}</h1>
      {sub ? <p className="mt-1 text-[13px] text-muted-foreground">{sub}</p> : null}
    </header>
  );
}

export function DurationChips({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (m: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2", className)}>
      {DURATIONS.map((d) => (
        <button
          key={d.minutes}
          type="button"
          onClick={() => onChange(d.minutes)}
          aria-pressed={value === d.minutes}
          className={cn(
            "h-10 flex-1 rounded-full text-[14px] font-semibold transition-colors",
            value === d.minutes
              ? "bg-primary text-primary-foreground shadow-hero"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-10 rounded-full px-4 text-[14px] font-semibold transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LiveBadge({ status, spots }: { status: LiveStatus; spots?: number }) {
  const map: Record<LiveStatus, string> = {
    free: "bg-success-soft text-success",
    busy: "bg-warning-soft text-warning-foreground",
    full: "bg-danger-soft text-danger",
    unknown: "bg-secondary text-muted-foreground",
  };
  const dot: Record<LiveStatus, string> = {
    free: "bg-success",
    busy: "bg-warning",
    full: "bg-danger",
    unknown: "bg-muted-foreground/50",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold",
        map[status],
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot[status])} />
      {LIVE_TEXT[status]}
      {status !== "unknown" && spots != null ? ` · ${spots}면` : ""}
    </span>
  );
}

export function HeroLotCard({ lot, minutes }: { lot: Lot; minutes: number }) {
  const fee = feeFor(lot, minutes);
  return (
    <Link
      to="/lot/$lotId"
      params={{ lotId: lot.id }}
      className="block rounded-3xl bg-card p-5 shadow-hero ring-1 ring-primary/15 transition-transform active:scale-[0.99]"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
          종합 추천
        </span>
        <LiveBadge status={lot.live} spots={lot.spotsLeft} />
      </div>
      <h2 className="mt-3 text-[19px] font-bold text-foreground">{lot.name}</h2>
      <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
        <Navigation className="size-3.5" /> 도보 {lot.walkMinutes}분 · {lot.open ? "영업 중" : "영업 종료"}
      </p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[12px] font-medium text-muted-foreground">
            {DURATIONS.find((d) => d.minutes === minutes)?.label} 예상
          </p>
          <p className="tnum text-[30px] font-extrabold leading-tight text-primary-soft-foreground">
            {fee != null ? won(fee) : "요금 정보 없음"}
          </p>
        </div>
        <ChevronRight className="mb-2 size-5 text-muted-foreground" />
      </div>
      {lot.reason ? (
        <p className="mt-4 rounded-2xl bg-primary-soft px-3.5 py-2.5 text-[13px] font-medium text-primary-soft-foreground">
          “{lot.reason}”
        </p>
      ) : null}
    </Link>
  );
}

export function LotCard({
  lot,
  minutes,
  label,
  highlight,
}: {
  lot: Lot;
  minutes: number;
  label?: string;
  highlight?: boolean;
}) {
  const fee = feeFor(lot, minutes);
  return (
    <Link
      to="/lot/$lotId"
      params={{ lotId: lot.id }}
      className={cn(
        "block rounded-2xl bg-card p-4 shadow-card transition-transform active:scale-[0.99]",
        highlight && "ring-1 ring-primary/25",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {label ? (
            <span className="text-[11px] font-bold text-primary-soft-foreground">{label}</span>
          ) : null}
          <p className="truncate text-[16px] font-bold text-foreground">{lot.name}</p>
          <p className="tnum mt-1 text-[15px] font-bold text-foreground">
            {fee != null ? (
              <>
                {DURATIONS.find((d) => d.minutes === minutes)?.label} 예상 {won(fee)}
              </>
            ) : (
              <span className="text-muted-foreground">요금 정보 없음</span>
            )}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            도보 {lot.walkMinutes}분 · {lot.open ? "영업 중" : "영업 종료"}
          </p>
          <div className="mt-2">
            <LiveBadge status={lot.live} spots={lot.spotsLeft} />
          </div>
          {highlight && lot.reason ? (
            <p className="mt-2 text-[12px] font-medium text-primary-soft-foreground">
              “{lot.reason}”
            </p>
          ) : null}
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}

export function MapPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary">
      <div className="h-24 w-full bg-[radial-gradient(circle_at_20%_30%,var(--primary-soft),transparent_60%),repeating-linear-gradient(90deg,var(--border)_0_1px,transparent_1px_28px),repeating-linear-gradient(0deg,var(--border)_0_1px,transparent_1px_28px)]" />
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
          <MapPin className="size-4 text-primary" /> 주변 5곳
        </span>
        <span className="rounded-full bg-card px-3 py-1.5 text-[13px] font-semibold text-primary shadow-card">
          지도에서 보기
        </span>
      </div>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-[14px] text-muted-foreground">{label}</span>
      <span className="tnum text-[14px] font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  className,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "h-14 w-full rounded-2xl bg-primary text-[16px] font-bold text-primary-foreground shadow-hero transition-transform active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  desc,
  actions,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card p-6 text-center shadow-card">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-soft-foreground">
        {icon}
      </div>
      <p className="mt-3 text-[16px] font-bold text-foreground">{title}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{desc}</p>
      {actions ? <div className="mt-4 flex flex-col gap-2">{actions}</div> : null}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="space-y-3">
      <div className="rounded-3xl bg-card p-5 shadow-card">
        <div className="h-5 w-24 animate-pulse rounded-full bg-secondary" />
        <div className="mt-3 h-6 w-3/4 animate-pulse rounded-lg bg-secondary" />
        <div className="mt-2 h-4 w-1/3 animate-pulse rounded-lg bg-secondary" />
        <div className="mt-5 h-9 w-2/5 animate-pulse rounded-lg bg-secondary" />
        <div className="mt-4 h-10 w-full animate-pulse rounded-2xl bg-secondary" />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="rounded-2xl bg-card p-4 shadow-card">
          <div className="h-5 w-1/2 animate-pulse rounded-lg bg-secondary" />
          <div className="mt-2 h-4 w-2/5 animate-pulse rounded-lg bg-secondary" />
          <div className="mt-3 h-6 w-24 animate-pulse rounded-full bg-secondary" />
        </div>
      ))}
    </div>
  );
}

export function SectionLabel({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 text-[14px] font-bold text-foreground">
      {icon ?? <Clock className="size-4 text-muted-foreground" />}
      {children}
    </h3>
  );
}
