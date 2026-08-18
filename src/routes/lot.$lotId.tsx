import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Navigation, Info } from "lucide-react";
import { useStore } from "@/lib/app-store";
import { durationLabel, feeFor, getLot, won } from "@/lib/parking-data";
import { Screen, LiveBadge, InfoRow, PrimaryButton, DurationChips } from "@/components/parking/ui";

export const Route = createFileRoute("/lot/$lotId")({
  head: () => ({
    meta: [
      { title: "주차장 상세 — 여기주차" },
      {
        name: "description",
        content: "예상 주차비, 실시간 혼잡도, 요금 기준과 운영시간을 한 화면에서 확인하세요.",
      },
      { property: "og:title", content: "주차장 상세 — 여기주차" },
      {
        property: "og:description",
        content: "선택한 체류시간 기준 예상 주차비와 실시간 상태를 확인하세요.",
      },
    ],
  }),
  component: LotDetail,
});

function LotDetail() {
  const { lotId } = Route.useParams();
  const navigate = useNavigate();
  const { duration, setDuration } = useStore();
  const lot = getLot(lotId);

  if (!lot) {
    return (
      <Screen>
        <p className="pt-20 text-center text-[15px] text-muted-foreground">
          주차장 정보를 찾을 수 없어요.
        </p>
      </Screen>
    );
  }

  const fee = feeFor(lot, duration);

  return (
    <Screen
      dock={
        <div className="flex gap-2.5">
          <Link
            to="/results"
            className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-secondary text-[15px] font-bold text-foreground"
          >
            목록으로
          </Link>
          <PrimaryButton className="flex-[1.4]" onClick={() => navigate({ to: "/timer/setup" })}>
            여기 주차하고 타이머 시작
          </PrimaryButton>
        </div>
      }
    >
      <h1 className="text-[22px] font-bold leading-tight text-foreground">{lot.name}</h1>
      <p className="mt-1.5 flex items-center gap-1 text-[13.5px] text-muted-foreground">
        <MapPin className="size-4" /> {lot.address}
      </p>
      <p className="mt-1 flex items-center gap-1 text-[13.5px] font-semibold text-foreground">
        <Navigation className="size-4 text-primary" /> 도보 {lot.walkMinutes}분
      </p>

      <div className="mt-4">
        <DurationChips value={duration} onChange={setDuration} />
      </div>

      <div className="mt-4 rounded-3xl bg-card p-5 shadow-hero ring-1 ring-primary/15">
        <p className="text-[13px] font-medium text-muted-foreground">
          {durationLabel(duration)} 예상 주차비
        </p>
        {fee != null ? (
          <p className="tnum mt-1 text-[36px] font-extrabold leading-none text-primary-soft-foreground">
            {won(fee)}
          </p>
        ) : (
          <>
            <p className="mt-1 text-[22px] font-bold text-foreground">요금 정보 없음</p>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">
              요금이 공개되지 않은 주차장이라 예상요금을 계산하지 않아요.
            </p>
          </>
        )}
        <div className="mt-4 flex items-center gap-2">
          <span
            className={
              lot.open
                ? "rounded-full bg-success-soft px-2.5 py-1 text-[12px] font-semibold text-success"
                : "rounded-full bg-secondary px-2.5 py-1 text-[12px] font-semibold text-muted-foreground"
            }
          >
            {lot.open ? "영업 중" : "영업 종료"}
          </span>
          <LiveBadge status={lot.live} spots={lot.spotsLeft} />
        </div>
        {lot.live === "unknown" ? (
          <p className="mt-3 flex items-start gap-1.5 rounded-2xl bg-secondary px-3.5 py-2.5 text-[12.5px] text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            이 주차장은 실시간 주차 가능 정보를 제공하지 않아요. 도착 시 자리 상황이 다를 수 있어요.
          </p>
        ) : null}
      </div>

      <div className="mt-3 rounded-2xl bg-card px-4 py-2 shadow-card">
        <p className="pt-2 text-[13.5px] font-bold text-foreground">요금 기준</p>
        <div className="mt-1 divide-y divide-border">
          <InfoRow label="기본 요금" value={lot.baseFee ?? "정보 없음"} />
          <InfoRow label="추가 요금" value={lot.extraFee ?? "정보 없음"} />
          <InfoRow label="일 최대 요금" value={lot.dailyMax ?? "정보 없음"} />
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-card px-4 py-2 shadow-card">
        <p className="pt-2 text-[13.5px] font-bold text-foreground">운영 정보</p>
        <div className="mt-1 divide-y divide-border">
          <InfoRow label="운영시간" value={lot.hours} />
          <InfoRow
            label="데이터 갱신"
            value={lot.updatedAt ? `${lot.updatedAt} 기준` : "갱신 정보 없음"}
          />
        </div>
      </div>
    </Screen>
  );
}
