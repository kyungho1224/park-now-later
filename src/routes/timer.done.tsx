import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useStore, estimateFee, fmtTime, fmtDurationKo } from "@/lib/app-store";
import { won } from "@/lib/parking-data";
import { Screen, InfoRow } from "@/components/parking/ui";

export const Route = createFileRoute("/timer/done")({
  head: () => ({
    meta: [
      { title: "주차 종료 — 여기주차" },
      { name: "description", content: "총 주차시간과 예상 최종 주차비를 확인하고 마무리하세요." },
      { property: "og:title", content: "주차 종료 — 여기주차" },
      { property: "og:description", content: "총 주차시간과 예상 주차비 요약." },
    ],
  }),
  component: TimerDone,
});

function TimerDone() {
  const { lastSession } = useStore();

  return (
    <Screen
      dock={
        <Link
          to="/"
          className="flex h-14 items-center justify-center rounded-2xl bg-primary text-[16px] font-bold text-primary-foreground shadow-hero"
        >
          완료
        </Link>
      }
    >
      <div className="pt-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-success-soft text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <h1 className="mt-4 text-[22px] font-bold text-foreground">주차 종료</h1>
      </div>

      {lastSession ? (
        <>
          <div className="mt-6 rounded-3xl bg-card p-6 text-center shadow-hero ring-1 ring-primary/15">
            <p className="text-[13px] font-medium text-muted-foreground">총 주차시간</p>
            <p className="tnum text-[26px] font-extrabold text-foreground">
              {fmtDurationKo(lastSession.endedAt - lastSession.startedAt)}
            </p>
            <p className="mt-5 text-[13px] font-medium text-muted-foreground">예상 주차비</p>
            <p className="tnum text-[34px] font-extrabold leading-none text-primary-soft-foreground">
              {(() => {
                const f = estimateFee(lastSession, lastSession.endedAt);
                return f == null ? "요금 미설정" : won(f);
              })()}
            </p>
          </div>

          <div className="mt-3 rounded-2xl bg-card px-4 py-2 shadow-card">
            <div className="divide-y divide-border">
              <InfoRow label="주차 시작 시각" value={fmtTime(lastSession.startedAt)} />
              <InfoRow label="주차 종료 시각" value={fmtTime(lastSession.endedAt)} />
              <InfoRow
                label="무료주차"
                value={lastSession.freeMinutes > 0 ? `${lastSession.freeMinutes}분` : "없음"}
              />
            </div>
          </div>
          <p className="mt-3 text-center text-[12.5px] text-muted-foreground">
            예상 주차비는 입력한 요금 기준으로 계산한 값이에요.
          </p>
        </>
      ) : (
        <p className="mt-10 text-center text-[15px] text-muted-foreground">
          최근 주차 기록이 없어요.
        </p>
      )}
    </Screen>
  );
}
