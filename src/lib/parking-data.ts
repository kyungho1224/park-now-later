export type LiveStatus = "free" | "busy" | "full" | "unknown";

export type Lot = {
  id: string;
  name: string;
  address: string;
  walkMinutes: number;
  /** 예상요금 (분 단위 키). null이면 요금 정보 없음 */
  fees: Record<number, number> | null;
  live: LiveStatus;
  spotsLeft?: number;
  open: boolean;
  hours: string;
  baseFee?: string;
  extraFee?: string;
  dailyMax?: string;
  updatedAt?: string;
  reason?: string;
  tag?: "recommend" | "closest" | "cheapest";
};

export const DURATIONS = [
  { minutes: 30, label: "30분" },
  { minutes: 60, label: "1시간" },
  { minutes: 120, label: "2시간" },
  { minutes: 240, label: "4시간+" },
];

export const LOTS: Lot[] = [
  {
    id: "seongsu2",
    name: "성수2가 공영주차장",
    address: "서울 성동구 성수이로 51",
    walkMinutes: 4,
    fees: { 30: 1000, 60: 2000, 120: 4000, 240: 8000 },
    live: "free",
    spotsLeft: 23,
    open: true,
    hours: "00:00 ~ 24:00 (연중무휴)",
    baseFee: "최초 30분 1,000원",
    extraFee: "10분당 300원",
    dailyMax: "20,000원",
    updatedAt: "2분 전",
    reason: "거리와 요금의 균형이 가장 좋아요",
    tag: "recommend",
  },
  {
    id: "seongsu-station",
    name: "성수역 민영주차장",
    address: "서울 성동구 아차산로 96",
    walkMinutes: 1,
    fees: { 30: 2000, 60: 4000, 120: 8000, 240: 16000 },
    live: "busy",
    spotsLeft: 3,
    open: true,
    hours: "07:00 ~ 23:00",
    baseFee: "최초 30분 2,000원",
    extraFee: "10분당 700원",
    dailyMax: "정보 없음",
    updatedAt: "1분 전",
    reason: "목적지에서 가장 가까워요",
    tag: "closest",
  },
  {
    id: "seongdong-public",
    name: "성동 공영주차장",
    address: "서울 성동구 왕십리로 88",
    walkMinutes: 7,
    fees: { 30: 600, 60: 1200, 120: 2400, 240: 4800 },
    live: "free",
    spotsLeft: 41,
    open: true,
    hours: "06:00 ~ 24:00",
    baseFee: "최초 30분 600원",
    extraFee: "10분당 200원",
    dailyMax: "12,000원",
    updatedAt: "5분 전",
    reason: "이 근처에서 가장 저렴해요",
    tag: "cheapest",
  },
  {
    id: "ttukseom",
    name: "뚝섬로 노외주차장",
    address: "서울 성동구 뚝섬로 12",
    walkMinutes: 5,
    fees: { 30: 800, 60: 1500, 120: 3000, 240: 6000 },
    live: "unknown",
    open: true,
    hours: "24시간",
    baseFee: "최초 30분 800원",
    extraFee: "10분당 250원",
    dailyMax: "15,000원",
  },
  {
    id: "forest",
    name: "서울숲 앞 주차장",
    address: "서울 성동구 서울숲2길 32",
    walkMinutes: 6,
    fees: null,
    live: "full",
    spotsLeft: 0,
    open: true,
    hours: "09:00 ~ 22:00",
    updatedAt: "3분 전",
  },
];

export const getLot = (id: string) => LOTS.find((l) => l.id === id);

export const feeFor = (lot: Lot, minutes: number) => lot.fees?.[minutes] ?? null;

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export const LIVE_TEXT: Record<LiveStatus, string> = {
  free: "현재 여유",
  busy: "혼잡",
  full: "만차",
  unknown: "실시간 정보 없음",
};

export const SEARCH_RESULTS = [
  { name: "성수역 2호선", address: "서울 성동구 아차산로 100" },
  { name: "성수동 카페거리", address: "서울 성동구 연무장길 33" },
  { name: "서울숲", address: "서울 성동구 뚝섬로 273" },
  { name: "왕십리역", address: "서울 성동구 왕십리로 300" },
  { name: "성수 이마트", address: "서울 성동구 아차산로 6" },
];

export const durationLabel = (minutes: number) =>
  DURATIONS.find((d) => d.minutes === minutes)?.label ?? `${minutes}분`;
