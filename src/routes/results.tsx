import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/app-store";
import { LOTS, feeFor } from "@/lib/parking-data";
import { Screen, DurationChips, Chip, LotCard, MapPreview } from "@/components/parking/ui";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "주변 주차장 결과 — 여기주차" },
      {
        name: "description",
        content: "추천순, 가까운순, 저렴한순으로 주변 주차장을 비교하고 예상 주차요금을 확인하세요.",
      },
      { property: "og:title", content: "주변 주차장 결과 — 여기주차" },
      {
        property: "og:description",
        content: "선택한 주차시간 기준 예상요금과 실시간 혼잡도를 한눈에 비교하세요.",
      },
    ],
  }),
  component: Results,
});

const SORTS = [
  { id: "recommend", label: "추천순" },
  { id: "near", label: "가까운순" },
  { id: "cheap", label: "저렴한순" },
] as const;

function Results() {
  const { duration, setDuration, place } = useStore();
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("recommend");

  const lots = [...LOTS].sort((a, b) => {
    if (sort === "near") return a.walkMinutes - b.walkMinutes;
    if (sort === "cheap") {
      const fa = feeFor(a, duration) ?? Number.MAX_SAFE_INTEGER;
      const fb = feeFor(b, duration) ?? Number.MAX_SAFE_INTEGER;
      return fa - fb;
    }
    return (a.tag === "recommend" ? -1 : 0) - (b.tag === "recommend" ? -1 : 0);
  });

  return (
    <Screen>
      <h1 className="flex items-center gap-1.5 text-[20px] font-bold text-foreground">
        <MapPin className="size-5 text-primary" />
        {place} 주변 주차장
      </h1>
      <p className="mt-1 text-[13px] text-muted-foreground">{lots.length}곳 · 도보 10분 이내</p>

      <div className="mt-4">
        <DurationChips value={duration} onChange={setDuration} />
      </div>

      <div className="mt-3 flex gap-2">
        {SORTS.map((s) => (
          <Chip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)} className="px-3.5">
            {s.label}
          </Chip>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {lots.map((lot) => (
          <LotCard
            key={lot.id}
            lot={lot}
            minutes={duration}
            highlight={lot.tag === "recommend"}
            {...(lot.tag === "recommend" ? { label: "추천" } : {})}
          />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <MapPreview />
        <Link
          to="/"
          className="flex h-12 items-center justify-center rounded-2xl bg-secondary text-[15px] font-bold text-foreground"
        >
          홈으로
        </Link>
      </div>
    </Screen>
  );
}
