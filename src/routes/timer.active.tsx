import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";
import {
  useStore,
  estimateFee,
  minutesToNextUnit,
  fmtClock,
  fmtTime,
} from "@/lib/app-store";
import { won } from "@/lib/parking-data";
import { Screen, InfoRow, PrimaryButton } from "@/components/parking/ui";

export const Route = createFileRoute("/timer/active")({
  head: () => ({
    meta: [
      { title: "주차 중 — 여기주차" },
      {
        name: "description",
        content: "무료주차 남은 시간과 현재 예상 주차비를 한 화면에서 확인하세요.",
      },
      { property: "og:title", content: "주차 중 — 여기주차" },
      { property: "og:description", content: "경과시간, 무료주차 잔여시간, 예상 주차비를 실시간으로." },
    ],
  }),
  component: TimerActive,
});

function TimerActive() {
  const navigate = useNavigate();
  const { timer, endTimer } = useStore();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timer) {
    return (
      <Screen>
        <div className="pt-24 text-center">
          <p className="text-[15px] text-muted-foreground">진행 중인 주차가 없어요.</p>
          <Link
            to="/timer/setup"
            className="mt-4 inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-[15px] font-bold text-primary-foreground shadow-hero"
          >
            주차 타이머 시작
          </Link>
        </div>
      </Screen>
    );
  }

  const elapsedMs = Math.max(0, now - timer.startedAt);
  const elapsedMin = elapsedMs / 60000;
  const freeLeft = Math.ceil(timer.freeMinutes - elapsedMin);
  const inFree = freeLeft > 0;
  const fee = estimateFee(timer, now);
  const nextUnit = minutesToNextUnit(timer, now);
  const freeEndsAt = timer.startedAt + timer.freeMinutes * 60000;
  const soon = inFree && freeLeft <= 10;

  return (
    <Screen
      dock={
        <PrimaryButton
          onClick={() => {
            endTimer();
            navigate({ to: "/timer/done" });
          }}
        >
          주차 종료
        </PrimaryButton>
      }
    >
      <p className="mt-2 text-[13.5px] font-semibold text-muted-foreground">주차 중</p>
      <p className="tnum mt-1 text-[46px] font-extrabold leading-none tracking-tight text-foreground">
        {fmtClock(elapsedMs)}
      </p>

      <div
        className={
          inFree
            ? soon
              ? "mt-5 rounded-3xl bg-warning-soft p-5"
              : "mt-5 rounded-3xl bg-success-soft p-5"
            : "mt-5 rounded-3xl bg-card p-5 shadow-card ring-1 ring-border"
        }
      >
        {inFree ? (
          <>
            <p
              className={
                soon
                  ? "text-[24px] font-extrabold text-warning-foreground"
                  : "text-[24px] font-extrabold text-success"
              }
            >
              무료주차 {freeLeft}분 남았어요
            </p>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              {fmtTime(freeEndsAt)}까지 무료 · 지금 예상요금 {timer.unitFee == null ? "미설정" : won(0)}
            </p>
            {timer.alertBefore != null ? (
              <p className="mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground">
                <BellRing className="size-3.5" /> 종료 {timer.alertBefore}분 전에 알려드려요
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-[18px] font-bold text-foreground">무료주차가 끝났어요</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              무료시간 이후 {Math.floor(elapsedMin - timer.freeMinutes)}분 경과
            </p>
            {fee != null ? (
              <>
                <p className="mt-4 text-[13px] font-medium text-muted-foreground">
                  현재 예상 주차비
                </p>
                <p className="tnum text-[34px] font-extrabold leading-none text-primary-soft-foreground">
                  {won(fee)}
                </p>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  다음 요금 증가까지 {nextUnit}분
                </p>
              </>
            ) : (
              <p className="mt-3 text-[13.5px] text-muted-foreground">
                요금을 입력하지 않아 시간만 기록하고 있어요.
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-3 rounded-2xl bg-card px-4 py-2 shadow-card">
        <div className="divide-y divide-border">
          <InfoRow label="주차 시작" value={fmtTime(timer.startedAt)} />
          <InfoRow
            label="무료주차 종료"
            value={timer.freeMinutes > 0 ? fmtTime(freeEndsAt) : "무료시간 없음"}
          />
          <InfoRow
            label="요금 기준"
            value={
              timer.unitFee == null
                ? "미설정"
                : `${timer.unitMinutes === 60 ? "1시간" : `${timer.unitMinutes}분`}당 ${won(timer.unitFee)}`
            }
          />
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] text-muted-foreground">
        <CheckCircle2 className="size-3.5" /> 화면을 닫아도 타이머는 계속 진행돼요
      </p>
    </Screen>
  );
}
