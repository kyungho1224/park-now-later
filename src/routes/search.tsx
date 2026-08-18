import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, X, MapPin, Navigation, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/app-store";
import { SEARCH_RESULTS } from "@/lib/parking-data";
import { Screen } from "@/components/parking/ui";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "목적지 검색 — 여기주차" },
      { name: "description", content: "가려는 곳을 검색해 목적지 주변 주차장을 비교해 보세요." },
      { property: "og:title", content: "목적지 검색 — 여기주차" },
      { property: "og:description", content: "장소를 검색하고 주변 주차장 추천을 바로 확인하세요." },
    ],
  }),
  component: SearchScreen,
});

const RECENT = ["성수동 카페거리", "서울숲"];

function SearchScreen() {
  const navigate = useNavigate();
  const { setPlace, setUsingCurrentLocation } = useStore();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = q.trim()
    ? SEARCH_RESULTS.filter((r) => r.name.includes(q.trim()) || r.address.includes(q.trim()))
    : [];

  const pick = (name: string) => {
    setPlace(name);
    setUsingCurrentLocation(false);
    navigate({ to: "/results" });
  };

  return (
    <Screen>
      <div className="flex items-center gap-2.5 rounded-2xl bg-card px-4 py-3.5 shadow-card ring-1 ring-primary/25">
        <Search className="size-5 text-primary" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="목적지를 검색하세요"
          className="w-full bg-transparent text-[16px] font-semibold text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground"
        />
        {q ? (
          <button type="button" onClick={() => setQ("")} aria-label="지우기">
            <X className="size-5 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => {
          setPlace("성수역");
          setUsingCurrentLocation(true);
          navigate({ to: "/results" });
        }}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-primary-soft px-4 py-3.5 text-left"
      >
        <Navigation className="size-5 text-primary" />
        <span className="text-[15px] font-bold text-primary-soft-foreground">현재 위치에서 찾기</span>
      </button>

      {q.trim() ? (
        <ul className="mt-4 divide-y divide-border">
          {results.map((r) => (
            <li key={r.name}>
              <button
                type="button"
                onClick={() => pick(r.name)}
                className="flex w-full items-center gap-3 py-3.5 text-left"
              >
                <MapPin className="size-5 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-[15.5px] font-bold text-foreground">
                    {r.name}
                  </span>
                  <span className="block truncate text-[13px] text-muted-foreground">
                    {r.address}
                  </span>
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 ? (
            <li className="py-10 text-center text-[14px] text-muted-foreground">
              검색 결과가 없어요. 다른 이름으로 찾아보세요.
            </li>
          ) : null}
        </ul>
      ) : (
        <div className="mt-6">
          <p className="mb-1 text-[13.5px] font-bold text-foreground">최근 검색</p>
          <ul className="divide-y divide-border">
            {RECENT.map((r) => (
              <li key={r}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  className="flex w-full items-center gap-3 py-3.5 text-left"
                >
                  <Clock className="size-4.5 text-muted-foreground" />
                  <span className="text-[15px] font-semibold text-foreground">{r}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Screen>
  );
}
