import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, MapPin, Timer, RefreshCw, WifiOff, ParkingCircle, Locate } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/app-store";
import { LOTS, durationLabel } from "@/lib/parking-data";
import {
  Screen,
  DurationChips,
  HeroLotCard,
  LotCard,
  MapPreview,
  SkeletonHero,
  EmptyState,
  PrimaryButton,
  SectionLabel,
} from "@/components/parking/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "여기주차 — 주변 주차장 추천과 주차 타이머" },
      {
        name: "description",
        content:
          "현재 위치나 목적지 주변 주차장을 예상 주차시간 기준으로 비교하고, 무료주차 시간과 예상 주차비를 타이머로 관리하세요.",
      },
      { property: "og:title", content: "여기주차 — 주변 주차장 추천과 주차 타이머" },
      {
        property: "og:description",
        content: "예상 주차시간 기준으로 가까운 곳, 저렴한 곳, 종합 추천 주차장을 10초 안에 확인하세요.",
      },
    ],
  }),
  component: Home,
});

type DemoState = "ready" | "loading" | "empty" | "error" | "no-permission";

function Home() {
  const navigate = useNavigate();
  const { duration, setDuration, timer, locationGranted, setLocationGranted } = useStore();
  const [state, setState] = useState<DemoState>("loading");

  useEffect(() => {
    const t = setTimeout(() => setState(locationGranted ? "ready" : "no-permission"), 700);
    return () => clearTimeout(t);
  }, [locationGranted]);

  const recommended = LOTS[0]!;
  const closest = LOTS[1]!;
  const cheapest = LOTS[2]!;

  return (
    <Screen
      dock={
        timer ? (
          <Link to="/timer/active" className="block">
            <div className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3.5 shadow-hero">
              <div>
                <p className="text-[12px] font-medium text-primary-foreground/80">주차 중</p>
                <p className="text-[15px] font-bold text-primary-foreground">주차 상태 보기</p>
              </div>
              <Timer className="size-5 text-primary-foreground" />
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl bg-secondary px-4 py-3.5">
            <p className="text-[14px] font-bold text-foreground">이미 주차하셨나요?</p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              무료시간과 주차비를 놓치지 마세요.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/timer/setup" })}
              className="mt-3 h-11 w-full rounded-xl bg-card text-[15px] font-bold text-primary shadow-card transition-transform active:scale-[0.98]"
            >
              주차 타이머 시작
            </button>
          </div>
        )
      }
    >
      {/* 검색 */}
      <Link
        to="/search"
        className="flex h-13 items-center gap-2.5 rounded-2xl bg-card px-4 py-3.5 shadow-card"
      >
        <Search className="size-5 text-primary" />
        <span className="text-[16px] font-semibold text-muted-foreground">어디 가세요?</span>
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-foreground">
          <MapPin className="size-4 text-primary" />
          현재 위치 <span className="text-muted-foreground">· 성수역 주변</span>
        </p>
        <button
          type="button"
          onClick={() => {
            setState("loading");
            setTimeout(() => setState("ready"), 700);
          }}
          className="flex items-center gap-1 text-[13px] font-semibold text-primary"
        >
          <RefreshCw className="size-3.5" /> 새로고침
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[13.5px] font-bold text-foreground">얼마나 주차하세요?</p>
        <DurationChips value={duration} onChange={setDuration} />
      </div>

      <div className="mt-5 space-y-3">
        {state === "loading" ? <SkeletonHero /> : null}

        {state === "no-permission" ? (
          <EmptyState
            icon={<Locate className="size-6" />}
            title="위치 권한이 필요해요"
            desc="현재 위치 기준 추천을 보려면 위치 권한을 허용해 주세요. 목적지 검색은 권한 없이도 사용할 수 있어요."
            actions={
              <>
                <PrimaryButton
                  className="h-12"
                  onClick={() => {
                    setLocationGranted(true);
                    setState("loading");
                  }}
                >
                  위치 권한 허용
                </PrimaryButton>
                <Link
                  to="/search"
                  className="flex h-12 items-center justify-center rounded-2xl bg-secondary text-[15px] font-bold text-foreground"
                >
                  목적지 검색으로 찾기
                </Link>
              </>
            }
          />
        ) : null}

        {state === "empty" ? (
          <EmptyState
            icon={<ParkingCircle className="size-6" />}
            title="이 근처에서는 확인 가능한 주차장을 찾지 못했어요"
            desc="목적지를 바꾸거나 검색 범위를 넓혀 다시 찾아보세요."
            actions={
              <>
                <Link
                  to="/search"
                  className="flex h-12 items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-primary-foreground shadow-hero"
                >
                  목적지 변경
                </Link>
                <button
                  type="button"
                  onClick={() => setState("ready")}
                  className="h-12 rounded-2xl bg-secondary text-[15px] font-bold text-foreground"
                >
                  검색 범위 1km로 넓히기
                </button>
              </>
            }
          />
        ) : null}

        {state === "error" ? (
          <EmptyState
            icon={<WifiOff className="size-6" />}
            title="정보를 불러오지 못했어요"
            desc="네트워크 연결을 확인한 뒤 다시 시도해 주세요."
            actions={
              <PrimaryButton
                className="h-12"
                onClick={() => {
                  setState("loading");
                  setTimeout(() => setState("ready"), 700);
                }}
              >
                다시 시도
              </PrimaryButton>
            }
          />
        ) : null}

        {state === "ready" ? (
          <>
            <HeroLotCard lot={recommended} minutes={duration} />

            <div className="pt-2">
              <SectionLabel>다른 기준으로 보기</SectionLabel>
              <div className="space-y-2.5">
                <LotCard lot={closest} minutes={duration} label="가장 가까운 곳" />
                <LotCard lot={cheapest} minutes={duration} label="가장 저렴한 곳" />
              </div>
            </div>

            <Link to="/results" className="block pt-1">
              <MapPreview />
            </Link>

            <Link
              to="/results"
              className="flex h-12 items-center justify-center rounded-2xl bg-secondary text-[15px] font-bold text-foreground"
            >
              {durationLabel(duration)} 기준 주차장 전체 보기
            </Link>

            <div className="flex flex-wrap gap-2 pt-1">
              <p className="w-full text-[12px] font-semibold text-muted-foreground">
                프로토타입 상태 보기
              </p>
              {(
                [
                  ["로딩", "loading"],
                  ["결과 없음", "empty"],
                  ["네트워크 오류", "error"],
                  ["권한 미허용", "no-permission"],
                ] as const
              ).map(([label, s]) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (s === "no-permission") setLocationGranted(false);
                    setState(s);
                  }}
                  className="rounded-full bg-card px-3 py-1.5 text-[12px] font-semibold text-muted-foreground shadow-card"
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </Screen>
  );
}
