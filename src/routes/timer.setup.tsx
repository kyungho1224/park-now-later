import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useState } from "react";
import { useStore, fmtTime } from "@/lib/app-store";
import { Screen, Chip, PrimaryButton } from "@/components/parking/ui";

export const Route = createFileRoute("/timer/setup")({
  head: () => ({
    meta: [
      { title: "주차 타이머 설정 — 여기주차" },
      {
        name: "description",
        content: "무료주차 시간과 요금 단위를 빠르게 선택하고 주차 타이머를 시작하세요.",
      },
      { property: "og:title", content: "주차 타이머 설정 — 여기주차" },
      {
        property: "og:description",
        content: "무료시간 종료 알림까지 몇 번의 탭으로 설정하는 주차 타이머.",
      },
    ],
  }),
  component: TimerSetup,
});

const FREE = [0, 10, 30, 60];
const UNITS = [10, 30, 60];
const ALERTS = [5, 10, 20, null];

function TimerSetup() {
  const navigate = useNavigate();
  const { startTimer } = useStore();
  const [startNow, setStartNow] = useState(true);
  const [startTime, setStartTime] = useState(fmtTime(Date.now()));
  const [free, setFree] = useState(30);
  const [customFree, setCustomFree] = useState("");
  const [unit, setUnit] = useState(10);
  const [fee, setFee] = useState("500");
  const [alert, setAlert] = useState<number | null>(10);

  const freeMinutes = customFree ? Number(customFree) || 0 : free;

  const start = () => {
    let startedAt = Date.now();
    if (!startNow) {
      const [h, m] = startTime.split(":").map(Number);
      const d = new Date();
      d.setHours(h ?? d.getHours(), m ?? 0, 0, 0);
      startedAt = d.getTime();
    }
    startTimer({
      startedAt,
      freeMinutes,
      unitMinutes: unit,
      unitFee: fee.trim() ? Number(fee.replace(/[^0-9]/g, "")) : null,
      alertBefore: alert,
    });
    navigate({ to: "/timer/active" });
  };

  return (
    <Screen dock={<PrimaryButton onClick={start}>주차 시작</PrimaryButton>}>
      <h1 className="text-[22px] font-bold text-foreground">주차 타이머</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        무료시간과 요금만 정하면 바로 시작할 수 있어요.
      </p>

      <section className="mt-5">
        <p className="mb-2 text-[14px] font-bold text-foreground">주차 시작시간</p>
        <div className="flex items-center gap-2">
          <Chip active={startNow} onClick={() => setStartNow(true)} className="px-5">
            지금
          </Chip>
          <Chip active={!startNow} onClick={() => setStartNow(false)} className="px-5">
            시간 직접 선택
          </Chip>
        </div>
        {!startNow ? (
          <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-card px-4 py-3 shadow-card">
            <Clock className="size-4.5 text-primary" />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="tnum bg-transparent text-[16px] font-bold text-foreground outline-none"
            />
          </div>
        ) : null}
      </section>

      <section className="mt-6">
        <p className="mb-2 text-[14px] font-bold text-foreground">무료주차</p>
        <div className="flex flex-wrap gap-2">
          {FREE.map((f) => (
            <Chip
              key={f}
              active={!customFree && free === f}
              onClick={() => {
                setFree(f);
                setCustomFree("");
              }}
              className="px-4"
            >
              {f === 0 ? "없음" : f === 60 ? "1시간" : `${f}분`}
            </Chip>
          ))}
          <div className="flex h-10 items-center gap-1 rounded-full bg-secondary px-4">
            <input
              value={customFree}
              onChange={(e) => setCustomFree(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="직접 입력"
              inputMode="numeric"
              className="tnum w-20 bg-transparent text-[14px] font-semibold text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground"
            />
            {customFree ? <span className="text-[13px] text-muted-foreground">분</span> : null}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <p className="mb-2 text-[14px] font-bold text-foreground">무료시간 이후 요금</p>
        <div className="flex gap-2">
          {UNITS.map((u) => (
            <Chip key={u} active={unit === u} onClick={() => setUnit(u)} className="flex-1">
              {u === 60 ? "1시간당" : `${u}분당`}
            </Chip>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-2xl bg-card px-4 py-3.5 shadow-card">
          <input
            value={fee}
            onChange={(e) => setFee(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="금액 입력 (예: 500)"
            inputMode="numeric"
            className="tnum w-full bg-transparent text-[17px] font-bold text-foreground outline-none placeholder:text-[15px] placeholder:font-medium placeholder:text-muted-foreground"
          />
          <span className="text-[15px] font-semibold text-muted-foreground">원</span>
        </div>
        <p className="mt-2 text-[12.5px] text-muted-foreground">
          요금을 모르면 비워두세요. 시간만 재는 타이머로 시작할 수 있어요.
        </p>
      </section>

      <section className="mt-6">
        <p className="mb-2 text-[14px] font-bold text-foreground">무료시간 종료 알림</p>
        <div className="flex gap-2">
          {ALERTS.map((a) => (
            <Chip key={String(a)} active={alert === a} onClick={() => setAlert(a)} className="flex-1">
              {a == null ? "알림 없음" : `${a}분 전`}
            </Chip>
          ))}
        </div>
      </section>

      <Link
        to="/"
        className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-secondary text-[15px] font-bold text-foreground"
      >
        취소
      </Link>
    </Screen>
  );
}
