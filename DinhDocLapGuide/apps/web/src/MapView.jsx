import React, { useEffect, useMemo, useRef, useState } from "react";
import { stops, localized, t, PALACE_MAP_POSITIONS } from "@palaceguide/shared";
import { imageFor } from "./images.js";

const ZONES = [
  { id: "grounds", icon: "🌳", title: { vi: "Khuôn viên", en: "Grounds", zh: "庭院", ja: "敷地", ko: "경내" }, sub: { vi: "Sơ đồ khuôn viên ngoài trời", en: "Outdoor grounds map", zh: "室外庭院地图", ja: "屋外敷地図", ko: "야외 경내 지도" } },
  { id: "bunker", icon: "📡", title: { vi: "Tầng hầm", en: "Basement", zh: "地下层", ja: "地下階", ko: "지하층" }, sub: { vi: "Khu chỉ huy và thông tin liên lạc", en: "Command and communications", zh: "指挥与通信区", ja: "指揮・通信エリア", ko: "지휘·통신 구역" } },
  { id: "ground", icon: "🚙", title: { vi: "Tầng trệt", en: "Ground floor", zh: "底层", ja: "地上階", ko: "지상층" }, sub: { vi: "Không gian phục vụ và trưng bày", en: "Service and display areas", zh: "服务与展览空间", ja: "サービス・展示エリア", ko: "서비스 및 전시 공간" } },
  { id: "floor1", icon: "🏛️", title: { vi: "Tầng 1", en: "Floor 1", zh: "一层", ja: "1階", ko: "1층" }, sub: { vi: "Không gian nghi lễ và tiếp khách", en: "Ceremonial and reception spaces", zh: "礼仪与接待空间", ja: "儀礼・応接スペース", ko: "의전 및 접견 공간" } },
  { id: "floor2", icon: "🖋️", title: { vi: "Tầng 2", en: "Floor 2", zh: "二层", ja: "2階", ko: "2층" }, sub: { vi: "Khu làm việc và tiếp khách cấp cao", en: "Offices and formal reception", zh: "办公与正式接待区", ja: "執務・公式応接エリア", ko: "집무 및 공식 접견 구역" } },
  { id: "floor3", icon: "🎬", title: { vi: "Tầng 3", en: "Floor 3", zh: "三层", ja: "3階", ko: "3층" }, sub: { vi: "Không gian sinh hoạt và giải trí", en: "Living and recreation spaces", zh: "起居与娱乐空间", ja: "居住・娯楽スペース", ko: "생활 및 여가 공간" } },
  { id: "floor4", icon: "🪟", title: { vi: "Tầng 4", en: "Floor 4", zh: "四层", ja: "4階", ko: "4층" }, sub: { vi: "Tứ phương vô sự lầu", en: "Four-direction salon", zh: "四方无事楼", ja: "四方無事楼", ko: "사방무사루" } },
  { id: "rooftop", icon: "🚁", title: { vi: "Sân thượng", en: "Rooftop", zh: "屋顶", ja: "屋上", ko: "옥상" }, sub: { vi: "Sân đỗ trực thăng UH-1", en: "UH-1 helicopter landing area", zh: "UH-1直升机停机区", ja: "UH-1ヘリコプター発着場", ko: "UH-1 헬리콥터 착륙 구역" } }
];

const ZONE_BY_STOP = {
  gate: "grounds", exhibition: "grounds", garden: "grounds", architecture: "grounds", history: "grounds", reunification: "grounds",
  bunker: "bunker", vehicles: "ground", cabinet: "floor1", reception: "floor1", office: "floor2", presidentRoom: "floor2", credentials: "floor2", family: "floor3", rooftop: "rooftop"
};

// Vị trí điểm đặt theo từng sơ đồ, không dùng tọa độ địa lý hay Google Maps.
const GROUNDS_PINS = {
  gate: [500, 605], exhibition: [170, 456], garden: [765, 210], architecture: [500, 345], history: [415, 300], reunification: [585, 300]
};

const FLOOR_ROOMS = {
  bunker: {
    title: "TẦNG HẦM", rooms: [
      { n: "19", name: "Phòng tham mưu tác chiến", color: "#b5ca9a", x: 0.4, y: 0.4, w: 2.1, h: 1.5 },
      { n: "21", name: "Thông tin liên lạc", color: "#78cbd1", x: 2.7, y: 0.4, w: 2.1, h: 1.5 },
      { n: "20", name: "Đài phát thanh dự phòng", color: "#e5be63", x: 5.0, y: 0.4, w: 1.5, h: 1.5 },
      { n: "24", name: "Phòng an ninh", color: "#e99a6c", x: 0.4, y: 2.2, w: 1.7, h: 1.5 },
      { n: "23", name: "Phòng trực chiến", color: "#9cafad", x: 2.3, y: 2.2, w: 1.8, h: 1.5 },
      { n: "22", name: "Phòng lưu trú", color: "#c88991", x: 4.3, y: 2.2, w: 2.2, h: 1.5 }
    ], stopGrid: { bunker: [3.7, 1.15] }
  },
  ground: {
    title: "TẦNG TRỆT", rooms: [
      { n: "25", name: "Khu bếp", color: "#c89c72", x: 0.4, y: 0.4, w: 1.7, h: 1.4 },
      { n: "30", name: "Phòng tập bắn", color: "#c98080", x: 2.3, y: 0.4, w: 1.7, h: 1.4 },
      { n: "31", name: "Phòng chiếu tư liệu", color: "#a9a0ca", x: 4.2, y: 0.4, w: 2.3, h: 1.4 },
      { n: "26", name: "Xe Jeep M151A2", color: "#8ca5b7", x: 0.4, y: 2.1, w: 2.3, h: 1.6 },
      { n: "27", name: "Khu dịch vụ", color: "#9fbf8b", x: 2.9, y: 2.1, w: 1.5, h: 1.6 },
      { n: "28", name: "Xe Mercedes", color: "#8c9da0", x: 4.6, y: 2.1, w: 1.9, h: 1.6 }
    ], stopGrid: { vehicles: [5.45, 2.9] }
  },
  floor1: {
    title: "TẦNG 1", rooms: [
      { n: "1", name: "Phòng Nội các", color: "#98b9a1", x: 4.3, y: 0.5, w: 2.2, h: 1.45 },
      { n: "2", name: "Phòng Đại yến", color: "#e8c46c", x: 0.4, y: 2.2, w: 2.2, h: 1.45 },
      { n: "3", name: "Sảnh và cầu thang", color: "#aab6b6", x: 2.8, y: 1.75, w: 1.25, h: 1.3 },
      { n: "4", name: "Phòng Khánh tiết", color: "#bf8d91", x: 0.4, y: 0.45, w: 2.8, h: 1.45 },
      { n: "5", name: "Hành lang đón khách", color: "#d7d0b4", x: 4.3, y: 2.2, w: 2.2, h: 1.45 }
    ], stopGrid: { cabinet: [5.35, 1.18], reception: [1.75, 1.18] }
  },
  floor2: {
    title: "TẦNG 2", rooms: [
      { n: "5", name: "Phòng Hội đồng An ninh", color: "#b1a2ce", x: 0.4, y: 0.4, w: 2.0, h: 1.35 },
      { n: "6", name: "Phòng làm việc Tổng thống", color: "#8db4d2", x: 2.6, y: 0.4, w: 2.2, h: 1.35 },
      { n: "7", name: "Phòng tiếp khách Tổng thống", color: "#d9b69b", x: 0.4, y: 2.0, w: 2.2, h: 1.55 },
      { n: "11", name: "Phòng trình Quốc thư", color: "#c88b8d", x: 4.9, y: 2.0, w: 1.6, h: 1.55 },
      { n: "8", name: "Khu tiếp khách phụ", color: "#a8c8a0", x: 2.9, y: 2.0, w: 1.8, h: 1.55 }
    ], stopGrid: { office: [3.7, 1.05], presidentRoom: [1.5, 2.75], credentials: [5.7, 2.75] }
  },
  floor3: {
    title: "TẦNG 3", rooms: [
      { n: "13", name: "Thư viện", color: "#ccb99a", x: 0.4, y: 0.45, w: 1.6, h: 1.45 },
      { n: "14", name: "Phòng tiếp khách Phu nhân", color: "#d3a6b8", x: 2.2, y: 0.45, w: 2.0, h: 1.45 },
      { n: "15", name: "Phòng chiếu phim", color: "#bb9197", x: 4.4, y: 0.45, w: 2.1, h: 1.45 },
      { n: "16", name: "Phòng giải trí", color: "#e7c678", x: 1.25, y: 2.15, w: 2.1, h: 1.45 },
      { n: "12", name: "Khu sinh hoạt gia đình", color: "#a6c49a", x: 3.55, y: 2.15, w: 2.95, h: 1.45 }
    ], stopGrid: { family: [4.95, 2.85] }
  },
  floor4: {
    title: "TẦNG 4", rooms: [
      { n: "17", name: "Tứ phương vô sự lầu", color: "#c98e91", x: 1.0, y: 0.65, w: 4.8, h: 2.5 },
      { n: "18", name: "Khu mái và hành lang", color: "#ddd6be", x: 0.4, y: 3.35, w: 6.1, h: 0.45 }
    ], stopGrid: { rooftop: [3.3, 1.8] }
  },
  rooftop: {
    title: "SÂN THƯỢNG", rooms: [
      { n: "A", name: "Sân đỗ trực thăng UH-1", color: "#d7d5c7", x: 0.5, y: 0.45, w: 5.9, h: 3.25 },
      { n: "B", name: "Khu kỹ thuật", color: "#9ba7a2", x: 0.5, y: 3.85, w: 1.6, h: 0.35 }
    ], stopGrid: { rooftop: [3.4, 2.1] }
  }
};

const MAP_LABELS = {
  vi: { outside: "KHUÔN VIÊN NGOÀI DINH", map: "SƠ ĐỒ THAM QUAN DINH ĐỘC LẬP", outsideNote: "Các điểm tham quan ngoài trời", insideNote: "Mặt bằng minh họa theo tầng", selectHint: "Chọn một điểm đánh số để xem thuyết minh.", legend: "CHÚ GIẢI", narration: "THUYẾT MINH ĐIỂM THAM QUAN", place: "Điểm tham quan", viewFloor: "Xem sơ đồ khu vực", backGrounds: "Quay lại khuôn viên", roomMapNote: "Sơ đồ định hướng tham quan; bố cục phòng được minh họa để hỗ trợ tìm điểm, không thay thế bản vẽ kỹ thuật." },
  en: { outside: "PALACE GROUNDS", map: "INDEPENDENCE PALACE VISITOR MAP", outsideNote: "Outdoor attractions", insideNote: "Illustrated floor plan", selectHint: "Select a numbered point to read its narration.", legend: "LEGEND", narration: "VISITOR STOP NARRATION", place: "Visitor stop", viewFloor: "Open area map", backGrounds: "Back to grounds", roomMapNote: "Visitor-orientation diagram. Room layouts are illustrative and are not technical floor plans." },
  zh: { outside: "宫殿庭院", map: "独立宫参观地图", outsideNote: "室外参观点", insideNote: "楼层示意图", selectHint: "选择编号位置查看讲解。", legend: "图例", narration: "参观点讲解", place: "参观点", viewFloor: "查看区域地图", backGrounds: "返回庭院地图", roomMapNote: "参观导向示意图；房间布局为辅助寻找位置的示意，并非技术平面图。" },
  ja: { outside: "宮殿の敷地", map: "統一会堂の見学マップ", outsideNote: "屋外の見学スポット", insideNote: "各階の案内図", selectHint: "番号付きの場所を選ぶと解説が表示されます。", legend: "凡例", narration: "見学スポットの解説", place: "見学スポット", viewFloor: "エリア図を開く", backGrounds: "敷地図に戻る", roomMapNote: "見学用の案内図です。部屋の配置は位置確認のための模式図で、技術図面ではありません。" },
  ko: { outside: "궁전 경내", map: "통일궁 관람 지도", outsideNote: "야외 관람 지점", insideNote: "층별 안내도", selectHint: "번호가 있는 위치를 선택하면 해설이 표시됩니다.", legend: "범례", narration: "관람 지점 해설", place: "관람 지점", viewFloor: "구역 지도 보기", backGrounds: "경내 지도로 돌아가기", roomMapNote: "관람 안내용 도식입니다. 방 배치는 위치 확인을 위한 예시이며 기술 평면도가 아닙니다." }
};

const TREE_POSITIONS = [
  [95,120],[145,160],[225,115],[280,175],[350,130],[430,105],[575,108],[660,120],[735,145],[850,122],
  [105,245],[135,315],[110,395],[145,520],[220,555],[300,535],[365,485],[640,485],[735,525],[850,495],
  [850,400],[875,315],[825,270],[730,330],[660,390],[335,390],[255,365],[190,330],[90,455]
];

function MapMarker({ stop, x, y, selected, onClick, labelColor = "#8b2927", scale = 1, lang = "vi" }) {
  const number = String(stop.order ?? stop.badge ?? "•");
  const activate = (event) => {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
    if (event.type === "keydown") event.preventDefault();
    onClick(stop);
  };
  return (
    <g
      className={`custom-map-marker ${selected ? "is-selected" : ""}`}
      role="button"
      tabIndex="0"
      aria-label={localized(stop, "title", lang)}
      onClick={activate}
      onKeyDown={activate}
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <title>{localized(stop, "title", lang)}</title>
      {selected && <circle r="26" fill="#d4aa45" opacity="0.30" />}
      <circle r="19" fill={selected ? "#d6aa45" : labelColor} stroke="#fffdf5" strokeWidth="3" />
      <circle r="14" fill="none" stroke={selected ? "#6f4d15" : "#ffffff"} strokeOpacity=".7" strokeWidth="1" />
      <text y="5" textAnchor="middle" fontSize="14" fontWeight="900" fill={selected ? "#432d10" : "#fff"}>{number}</text>
    </g>
  );
}

function GroundsMap({ stopsInZone, selectedId, onMarkerClick, lang }) {
  const pins = {
    gate: [500, 600], exhibition: [175, 452], garden: [775, 202], architecture: [500, 340], history: [415, 297], reunification: [585, 297]
  };
  const labels = {
    vi: ["Đường Huyền Trân Công Chúa", "Đường Nguyễn Du", "Đường Nguyễn Thị Minh Khai", "Đường Nam Kỳ Khởi Nghĩa", "DINH ĐỘC LẬP", "Đài phun nước", "Nhà trưng bày", "Máy bay F-5E", "Khu trưng bày xe tăng"],
    en: ["Huyen Tran Cong Chua St.", "Nguyen Du St.", "Nguyen Thi Minh Khai St.", "Nam Ky Khoi Nghia St.", "INDEPENDENCE PALACE", "Fountain", "Exhibition house", "F-5E aircraft", "Tank display"],
    zh: ["玄珍公主街", "阮攸街", "阮氏明开街", "南圻起义街", "独立宫", "喷泉", "展览馆", "F-5E飞机", "坦克展区"],
    ja: ["フエン・チャン・コン・チュア通り", "グエン・ズー通り", "グエン・ティ・ミン・カイ通り", "ナムキーコイギア通り", "統一会堂", "噴水", "展示館", "F-5E航空機", "戦車展示"],
    ko: ["후옌쩐꽁쭈아 거리", "응우옌주 거리", "응우옌티민카이 거리", "남끼코이응이어 거리", "통일궁", "분수", "전시관", "F-5E 항공기", "전차 전시"]
  };
  const l = labels[lang] || labels.vi;
  return (
    <svg className="custom-map-svg grounds-svg" viewBox="0 0 1000 670" role="group" aria-label={MAP_LABELS[lang]?.outside || MAP_LABELS.vi.outside}>
      <defs>
        <linearGradient id="groundsLawn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8fca67"/><stop offset="1" stopColor="#5f9f43"/></linearGradient>
        <linearGradient id="groundsRoad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9d9cc"/><stop offset="1" stopColor="#b9bbae"/></linearGradient>
        <linearGradient id="palaceRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffdf5"/><stop offset="1" stopColor="#ded9c9"/></linearGradient>
        <filter id="groundsShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#17341f" floodOpacity=".22"/></filter>
      </defs>
      <rect width="1000" height="670" fill="#f7f2df" />
      <text x="500" y="28" textAnchor="middle" className="map-road-label">{l[0]}</text>
      <text x="24" y="340" textAnchor="middle" transform="rotate(-90 24 340)" className="map-road-label">{l[1]}</text>
      <text x="976" y="340" textAnchor="middle" transform="rotate(-90 976 340)" className="map-road-label">{l[2]}</text>
      <text x="500" y="654" textAnchor="middle" className="map-road-label">{l[3]}</text>
      <rect x="43" y="45" width="914" height="575" rx="14" fill="url(#groundsRoad)" stroke="#a4a897" strokeWidth="2"/>
      <rect x="61" y="62" width="878" height="540" rx="10" fill="#fbf8ed" stroke="#fff" strokeWidth="4"/>
      <rect x="76" y="78" width="848" height="510" rx="8" fill="url(#groundsLawn)" stroke="#477b37" strokeWidth="2"/>
      {/* Thảm cỏ và đường đi bộ: hình học riêng của khuôn viên */}
      <path d="M82 270 C130 145 250 112 350 145 C395 170 395 218 350 250 C290 290 214 298 155 355 C120 390 88 355 82 270Z" fill="#6bab4c" stroke="#477d37" strokeWidth="2"/>
      <path d="M585 110 C720 90 850 140 910 250 L910 365 C850 330 800 280 740 255 C665 225 625 175 585 110Z" fill="#73b951" stroke="#4f853b" strokeWidth="2"/>
      <path d="M90 432 C180 375 272 397 345 440 L383 575 L85 575Z" fill="#70b54d" stroke="#4f853b" strokeWidth="2"/>
      <path d="M595 394 C680 360 802 380 914 435 L914 580 L590 580 C630 515 650 462 595 394Z" fill="#6dad4a" stroke="#4f853b" strokeWidth="2"/>
      {/* Đường dạo uốn cong */}
      <path d="M88 275 C170 170 270 170 340 234 C392 282 380 340 334 386 C275 445 230 455 165 430 C100 405 96 330 143 290" fill="none" stroke="#faf6df" strokeWidth="18" strokeLinecap="round"/>
      <path d="M590 155 C692 102 820 157 869 250 C907 323 857 395 781 407 C704 420 640 384 604 333" fill="none" stroke="#faf6df" strokeWidth="18" strokeLinecap="round"/>
      <path d="M115 500 C220 470 323 520 389 555 C470 598 615 580 721 542 C805 510 886 438 899 366" fill="none" stroke="#faf6df" strokeWidth="18" strokeLinecap="round"/>
      <path d="M330 90 C375 145 400 190 416 236 M587 92 C550 142 543 188 557 240" fill="none" stroke="#faf6df" strokeWidth="15" strokeLinecap="round"/>
      <path d="M385 565 C440 527 555 527 617 562" fill="none" stroke="#f6e9b3" strokeWidth="7" strokeLinecap="round"/>
      {/* Cây xanh */}
      {TREE_POSITIONS.map(([x, y], i) => <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} opacity={i % 3 === 0 ? 0.96 : 0.82}>
        <circle cx="2" cy="5" r="14" fill="#356e34" opacity=".22"/><circle r="12" fill={i % 2 ? "#2f7136" : "#397c3a"}/><circle cx="-4" cy="-4" r="5" fill="#70ad53"/><path d="M0 10 v7" stroke="#755b38" strokeWidth="3" strokeLinecap="round"/>
      </g>)}
      {/* Khu trưng bày xe chuyên dụng */}
      <g transform="translate(115 102)"><rect width="150" height="76" rx="4" fill="#e5ddc5" stroke="#fffdf5" strokeWidth="4"/><rect x="14" y="12" width="36" height="20" rx="4" fill="#7b8d83"/><rect x="62" y="12" width="36" height="20" rx="4" fill="#7b8d83"/><rect x="108" y="12" width="28" height="20" rx="4" fill="#7b8d83"/><rect x="20" y="44" width="40" height="18" rx="3" fill="#53685a"/><rect x="75" y="44" width="44" height="18" rx="3" fill="#53685a"/></g>
      {/* Máy bay F-5E cách điệu */}
      <g transform="translate(730 160) rotate(-8)" fill="#c7d0cb" stroke="#415b55" strokeWidth="2"><path d="M0 -53 L10 -12 L68 4 L68 14 L12 9 L6 42 L21 52 L18 58 L0 48 L-18 58 L-21 52 L-6 42 L-12 9 L-68 14 L-68 4 L-10 -12Z"/><path d="M0 -36 v72" fill="none" stroke="#657a73"/></g>
      {/* Bãi trưng bày xe tăng */}
      {[0, 1].map((i) => <g key={i} transform={`translate(${827 + i * 48} 145)`} fill="#526648" stroke="#263f2b" strokeWidth="2"><rect x="-21" y="-8" width="42" height="19" rx="5"/><rect x="-17" y="8" width="36" height="8" rx="4" fill="#334a30"/><rect x="-5" y="-15" width="18" height="10" rx="3"/><path d="M7 -10 L28 -20" strokeWidth="4"/></g>)}
      {/* Nhà trưng bày độc lập */}
      <g transform="translate(115 420)" filter="url(#groundsShadow)"><rect x="0" y="16" width="115" height="66" fill="#fffaf0" stroke="#8d8b78" strokeWidth="2"/><path d="M-6 18 L57 -14 L121 18Z" fill="#c5bda5" stroke="#8d8b78" strokeWidth="2"/><rect x="15" y="28" width="18" height="35" fill="#cfdbd4" stroke="#8d8b78"/><rect x="48" y="28" width="18" height="35" fill="#cfdbd4" stroke="#8d8b78"/><rect x="80" y="28" width="18" height="35" fill="#cfdbd4" stroke="#8d8b78"/></g>
      {/* Dinh chính: khối kiến trúc chữ Cát và hai sân trong */}
      <g filter="url(#groundsShadow)">
        <rect x="390" y="220" width="90" height="68" fill="#67984b" stroke="#466f38" strokeWidth="2"/>
        <rect x="520" y="220" width="90" height="68" fill="#67984b" stroke="#466f38" strokeWidth="2"/>
        <path d="M423 205 H577 V255 H626 V367 H374 V255 H423Z" fill="url(#palaceRoof)" stroke="#4a5950" strokeWidth="3"/>
        <rect x="391" y="277" width="218" height="73" fill="#f4f0e5" stroke="#69766d" strokeWidth="2"/>
        <rect x="445" y="216" width="110" height="28" fill="#e9e4d6" stroke="#69766d" strokeWidth="2"/>
        <rect x="470" y="224" width="60" height="14" fill="#c4cfc7" stroke="#718078"/>
        <path d="M420 367 H580 L557 387 H443Z" fill="#d4cdbc" stroke="#69766d" strokeWidth="2"/>
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={406 + i * 16} y1="288" x2={406 + i * 16} y2="342" stroke="#d3cdc0" strokeWidth="2"/>)}
        <text x="500" y="321" textAnchor="middle" className="palace-building-title">{l[4]}</text>
      </g>
      {/* Đài phun nước và trục vào cổng */}
      <path d="M500 389 V492 V570" fill="none" stroke="#faf6df" strokeWidth="24" strokeLinecap="round"/>
      <path d="M500 390 V492 V570" fill="none" stroke="#e8d6a0" strokeWidth="4" strokeDasharray="9 7"/>
      <circle cx="500" cy="480" r="65" fill="#7bbb56" stroke="#fbf6df" strokeWidth="10"/>
      <circle cx="500" cy="480" r="27" fill="#53b7d6" stroke="#fff" strokeWidth="4"/><circle cx="500" cy="480" r="9" fill="#e7fbff"/>
      {/* Cổng chính */}
      <path d="M444 586 L465 570 M556 586 L535 570" fill="none" stroke="#4e5a4d" strokeWidth="7" strokeLinecap="round"/><path d="M476 594 H524" stroke="#b42b2b" strokeWidth="12" strokeLinecap="round"/>
      <text x="540" y="521" className="map-feature-label">{l[5]}</text>
      <text x="103" y="515" className="map-feature-label">{l[6]}</text>
      <text x="672" y="232" className="map-feature-label">{l[7]}</text>
      <text x="804" y="118" className="map-feature-label">{l[8]}</text>
      {/* La bàn */}
      <g transform="translate(875 92)"><circle r="25" fill="#fdfaf1" stroke="#25533d" strokeWidth="2"/><path d="M0 -18 L-8 8 L0 3 L8 8Z" fill="#25533d"/><text x="0" y="37" textAnchor="middle" className="map-feature-label">N</text></g>
      {stopsInZone.map((stop) => {
        const [x, y] = pins[stop.id] || [500, 480];
        return <MapMarker key={stop.id} stop={stop} x={x} y={y} selected={stop.id === selectedId} onClick={onMarkerClick} labelColor={stop.id === "garden" ? "#315e8b" : "#922e2a"} lang={lang} />;
      })}
    </svg>
  );
}

function toIso(x, y) {
  return [330 + (x - y) * 42, 230 + (x + y) * 22];
}
function isoPointString(points) { return points.map(([x, y]) => `${x},${y}`).join(" "); }
function roomPoints(room) {
  const x = room.x, y = room.y, w = room.w, h = room.h;
  return isoPointString([toIso(x, y), toIso(x + w, y), toIso(x + w, y + h), toIso(x, y + h)]);
}
function IsoFloorMap({ zone, stopsInZone, selectedId, onMarkerClick, lang }) {
  const meta = FLOOR_ROOMS[zone] || FLOOR_ROOMS.floor1;
  const zoneInfo = ZONES.find((z) => z.id === zone) || ZONES[1];
  const gridFor = (stop) => meta.stopGrid?.[stop.id] || [3.5, 2.2];
  const outline = [[0, 0], [7, 0], [7, 4.4], [0, 4.4]].map(([x, y]) => toIso(x, y));
  const labels = MAP_LABELS[lang] || MAP_LABELS.vi;
  const markerColor = zone === "bunker" ? "#336d79" : "#8d2b2b";
  return (
    <svg className="custom-map-svg floor-svg" viewBox="0 0 1000 620" role="img" aria-label={`${meta.title} · ${labels.insideNote}`}>
      <defs><filter id={`floorShadow-${zone}`} x="-20%" y="-20%" width="150%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#20372a" floodOpacity=".19"/></filter></defs>
      <rect width="1000" height="620" rx="12" fill="#f8f2df"/>
      {/* Sàn tầng dạng isometric */}
      <polygon points={isoPointString(outline.map(([x,y]) => [x, y + 28]))} fill="#c9c6b6" stroke="#8b897a" strokeWidth="2"/>
      <polygon points={isoPointString([outline[1], outline[2], [outline[2][0], outline[2][1] + 28], [outline[1][0], outline[1][1] + 28]])} fill="#b7b6a8" stroke="#8b897a" strokeWidth="1.5"/>
      <polygon points={isoPointString([outline[2], outline[3], [outline[3][0], outline[3][1] + 28], [outline[2][0], outline[2][1] + 28]])} fill="#d3d0bf" stroke="#8b897a" strokeWidth="1.5"/>
      <polygon points={isoPointString(outline)} fill="#fffdf5" stroke="#4d5c52" strokeWidth="3" filter={`url(#floorShadow-${zone})`}/>
      {/* Trục hành lang và vạch tường */}
      <polyline points={isoPointString([toIso(0.25, 2.0), toIso(6.7, 2.0)])} fill="none" stroke="#ddd8c7" strokeWidth="8" strokeLinecap="round"/>
      <polyline points={isoPointString([toIso(3.4, 0.2), toIso(3.4, 4.15)])} fill="none" stroke="#e5dfcf" strokeWidth="5" strokeLinecap="round"/>
      {meta.rooms.map((room) => {
        const center = toIso(room.x + room.w / 2, room.y + room.h / 2);
        const labelName = room.name.length > 23 ? `${room.n}` : room.n;
        return <g key={room.n}>
          <polygon points={roomPoints(room)} fill={room.color} stroke="#fffdf7" strokeWidth="3"/>
          <polygon points={isoPointString([toIso(room.x, room.y), toIso(room.x + room.w, room.y), toIso(room.x + room.w, room.y + 0.08), toIso(room.x, room.y + 0.08)])} fill="#ffffff" opacity=".26"/>
          <text x={center[0]} y={center[1] + 5} textAnchor="middle" className="iso-room-number">{labelName}</text>
        </g>;
      })}
      {/* Nhãn chỉ tầng và mũi tên hướng tham quan */}
      <g transform="translate(62 92)"><rect width="164" height="44" rx="9" fill="#24513e"/><text x="82" y="28" textAnchor="middle" className="floor-stamp">{meta.title}</text></g>
      <g transform="translate(620 105)"><circle r="21" fill="#fffdf5" stroke="#bba86f" strokeWidth="2"/><path d="M0 -14 L-7 7 L0 3 L7 7Z" fill="#27553f"/><text x="0" y="36" textAnchor="middle" className="map-feature-label">N</text></g>
      {stopsInZone.map((stop) => {
        const [gx, gy] = gridFor(stop); const [x, y] = toIso(gx, gy);
        return <MapMarker key={`${zone}-${stop.id}`} stop={stop} x={x} y={y} selected={stop.id === selectedId} onClick={onMarkerClick} labelColor={markerColor} scale={0.9} lang={lang}/>;
      })}
      {/* Khung chú giải riêng cho đúng tầng */}
      <rect x="705" y="32" width="270" height="556" rx="14" fill="#efe7d1" stroke="#d4c8a8" strokeWidth="1.5"/>
      <text x="730" y="68" className="floor-legend-title">{labels.legend}</text>
      <text x="730" y="91" className="floor-legend-sub">{labels.insideNote}</text>
      {meta.rooms.map((room, index) => {
        const y = 116 + index * Math.min(72, 430 / meta.rooms.length);
        const fontSize = room.name.length > 26 ? 12 : 13;
        return <g key={`legend-${room.n}`}>
          <rect x="728" y={y} width="34" height="30" rx="5" fill={room.color} stroke="#fff" strokeWidth="1.5"/>
          <text x="745" y={y + 20} textAnchor="middle" className="floor-legend-code">{room.n}</text>
          <text x="774" y={y + 13} className="floor-legend-name" fontSize={fontSize}>{room.name.length > 32 ? `${room.name.slice(0, 31)}…` : room.name}</text>
          <line x1="728" y1={y + 43} x2="950" y2={y + 43} stroke="#ded4bc" strokeWidth="1"/>
        </g>;
      })}
      <text x="730" y="558" className="floor-legend-foot">{labels.selectHint}</text>
    </svg>
  );
}

export default function MapView({ lang = "vi", activeId, onSelect, onPlay }) {
  const palette = MAP_LABELS[lang] || MAP_LABELS.vi;
  const skipNextActiveIdRef = useRef(false);
  const palaceStops = useMemo(() => stops.filter((s) => s.category === "palace").map((s) => {
    const pos = PALACE_MAP_POSITIONS[s.id] || {};
    return { ...s, roomCode: pos.roomCode || "", zone: ZONE_BY_STOP[s.id] || pos.zone || "grounds" };
  }), []);
  const initialStop = palaceStops.find((s) => s.id === activeId) || palaceStops[0];
  const [activeZone, setActiveZone] = useState(initialStop?.zone || "grounds");
  const zoneStops = useMemo(() => palaceStops.filter((s) => s.zone === activeZone || (s.id === "rooftop" && activeZone === "floor4")), [palaceStops, activeZone]);
  const selectedStop = zoneStops.find((s) => s.id === activeId) || zoneStops[0] || null;
  const currentZone = ZONES.find((z) => z.id === activeZone) || ZONES[0];
  const roomMeta = FLOOR_ROOMS[activeZone];

  // Nếu người dùng chọn một điểm từ danh sách chính, tự chuyển đúng sơ đồ.
  // Khi nhấn marker hoặc tab ngay trên bản đồ thì giữ nguyên khu vực do người dùng chọn.
  useEffect(() => {
    if (skipNextActiveIdRef.current) { skipNextActiveIdRef.current = false; return; }
    const found = palaceStops.find((s) => s.id === activeId);
    if (found?.zone) setActiveZone(found.zone);
  }, [activeId, palaceStops]);

  const selectStop = (stop) => {
    if (!stop) return;
    if (stop.id !== activeId) skipNextActiveIdRef.current = true;
    if (onSelect) onSelect(stop.id);
  };
  const switchZone = (zoneId) => {
    setActiveZone(zoneId);
    const available = palaceStops.filter((s) => s.zone === zoneId || (s.id === "rooftop" && zoneId === "floor4"));
    if (available.length && !available.some((s) => s.id === activeId)) selectStop(available[0]);
  };
  const pinClick = (stop) => selectStop(stop);

  return (
    <section className="custom-map-shell" aria-label={t(lang, "map")}>
      <div className="custom-map-topline">
        <div className="custom-map-brand"><span className="custom-map-mark">✦</span><div><h3>{palette.map}</h3><p>{activeZone === "grounds" ? palette.outsideNote : currentZone.sub[lang] || currentZone.sub.vi}</p></div></div>
        <div className="custom-map-key"><span><i className="key-dot outdoor"/> {lang === "en" ? "Outdoor" : lang === "zh" ? "室外" : lang === "ja" ? "屋外" : lang === "ko" ? "야외" : "Ngoài khuôn viên"}</span><span><i className="key-dot indoor"/> {lang === "en" ? "Inside the building" : lang === "zh" ? "室内" : lang === "ja" ? "屋内" : lang === "ko" ? "건물 내부" : "Trong tòa nhà"}</span></div>
      </div>
      <nav className="custom-map-tabs" aria-label={lang === "en" ? "Map sections" : "Chọn khu vực bản đồ"}>
        {ZONES.map((zone) => {
          const count = palaceStops.filter((s) => s.zone === zone.id || (s.id === "rooftop" && zone.id === "floor4")).length;
          return <button type="button" key={zone.id} className={`custom-map-tab ${zone.id === activeZone ? "active" : ""}`} aria-pressed={zone.id === activeZone} onClick={() => switchZone(zone.id)}>
            <span className="custom-map-tab-icon" aria-hidden="true">{zone.icon}</span><span>{zone.title[lang] || zone.title.vi}</span><b>{count}</b>
          </button>;
        })}
      </nav>
      <div className={`custom-map-board ${activeZone === "grounds" ? "is-grounds" : "is-floor"}`}>
        <div className="custom-map-board-heading">
          <div><span className="custom-map-kicker">{activeZone === "grounds" ? "01 / OUTDOOR MAP" : `0${ZONES.findIndex((z) => z.id === activeZone) + 1} / FLOOR MAP`}</span><h4>{activeZone === "grounds" ? palette.outside : currentZone.title[lang] || currentZone.title.vi}</h4></div>
          <span className="custom-map-heading-note">{activeZone === "grounds" ? palette.selectHint : palette.insideNote}</span>
        </div>
        {activeZone === "grounds" ? <GroundsMap stopsInZone={zoneStops} selectedId={selectedStop?.id} onMarkerClick={pinClick} lang={lang}/> : <IsoFloorMap zone={activeZone} stopsInZone={zoneStops} selectedId={selectedStop?.id} onMarkerClick={pinClick} lang={lang}/>}
      </div>
      {activeZone !== "grounds" && <p className="custom-map-disclaimer">ⓘ {palette.roomMapNote}</p>}
      {selectedStop && <div className="custom-map-transcript" aria-live="polite">
        <div className="custom-map-transcript-top">
          {imageFor(selectedStop.id) && <img src={imageFor(selectedStop.id)} alt={localized(selectedStop, "title", lang)} className="custom-map-place-image"/>}
          <div className="custom-map-transcript-heading">
            <div className="custom-map-place-meta"><span>{palette.place} #{selectedStop.order}</span>{selectedStop.roomCode && <span>📍 {selectedStop.roomCode}</span>}</div>
            <h4>{selectedStop.icon} {localized(selectedStop, "title", lang)}</h4>
            <p>{localized(selectedStop, "summary", lang)}</p>
            <div className="custom-map-actions">
              {onPlay && <button type="button" className="custom-map-play" onClick={() => onPlay(selectedStop)}>🔊 {t(lang, "play")}</button>}
              {activeZone === "grounds" && selectedStop.zone !== "grounds" && <button type="button" className="custom-map-secondary" onClick={() => switchZone(selectedStop.zone)}>🏛️ {palette.viewFloor}</button>}
              {activeZone !== "grounds" && <button type="button" className="custom-map-secondary" onClick={() => switchZone("grounds")}>🌳 {palette.backGrounds}</button>}
            </div>
          </div>
        </div>
        <div className="custom-map-full-transcript"><strong>{palette.narration}</strong><p lang={lang}>{localized(selectedStop, "text", lang)}</p></div>
      </div>}
      <p className="custom-map-footnote">{palette.selectHint}</p>
    </section>
  );
}
