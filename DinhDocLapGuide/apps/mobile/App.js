import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Image, useWindowDimensions, Platform
} from "react-native";
import * as Speech from "expo-speech";
import Svg, {
  Defs, LinearGradient, Stop, Rect, Text as SvgText,
  Path, G, Circle, Line, Polygon, Polyline
} from "react-native-svg";
import { imageFor } from "./images";
import {
  LANGUAGES, stops, t, localized, detectLang, speechLang, estimateSeconds, formatMinutes, getNextStop, searchStops, stopsByCategory,
  PALACE_MAP_POSITIONS
} from "@palaceguide/shared";

const RED = "#7a1f1f";
const GOLD = "#c9a24a";
const CREAM = "#faf6ee";

// Dữ liệu cấu hình Bản đồ đồng bộ 100% với apps/web/src/MapView.jsx
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

const deviceLang = () => {
  try { return detectLang(Intl.DateTimeFormat().resolvedOptions().locale); } catch { return "vi"; }
};

export default function App() {
  const [lang, setLang] = useState(deviceLang);
  const [activeId, setActiveId] = useState(stops[0].id);
  const [screen, setScreen] = useState("list"); // list | detail
  const [tab, setTab] = useState("palace");
  const [query, setQuery] = useState("");
  const [rate, setRate] = useState(1);
  const [playing, setPlaying] = useState(false);
  const token = useRef(0);

  const active = stops.find((s) => s.id === activeId);
  const list = useMemo(() => searchStops(query, lang, tab), [query, lang, tab]);
  const group = stopsByCategory(active.category);
  const posOf = (st) => stopsByCategory(st.category).findIndex((x) => x.id === st.id) + 1;
  const text = localized(active, "text", lang);

  useEffect(() => () => { Speech.stop(); }, []);

  const stop = () => { token.current += 1; Speech.stop(); setPlaying(false); };

  const play = (target = active, chain = false) => {
    token.current += 1;
    const mine = token.current;
    Speech.stop();
    setPlaying(true);
    Speech.speak(localized(target, "text", lang), {
      language: speechLang(lang),
      rate,
      onDone: () => {
        if (token.current !== mine) return;
        const next = chain ? getNextStop(target.id, 1) : null;
        if (next) { setActiveId(next.id); play(next, true); } else setPlaying(false);
      },
      onStopped: () => { if (token.current === mine) setPlaying(false); },
      onError: () => { if (token.current === mine) setPlaying(false); }
    });
  };

  const changeLang = (code) => { stop(); setLang(code); };
  const open = (id) => { stop(); setActiveId(id); setScreen("detail"); };
  const go = (dir) => {
    const n = getNextStop(activeId, dir);
    if (!n) return;
    const was = playing;
    setActiveId(n.id);
    if (was) play(n); else stop();
  };
  const switchTab = (c) => { setTab(c); setQuery(""); };
  const startTour = () => { setTab("palace"); setActiveId(stops[0].id); setScreen("detail"); play(stops[0], true); };

  const seconds = estimateSeconds(text, lang, rate);
  const { width: screenW } = useWindowDimensions();
  const coverW = screenW - 32;           // trừ padding 16 mỗi bên của s.content
  const coverH = Math.round(coverW * 9 / 16);
  const changeRate = (d) => setRate((r) => Math.round(Math.min(1.4, Math.max(0.6, r + d)) * 10) / 10);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={RED} />
      <View style={s.header}>
        <Text style={s.brand}>{t(lang, "appName")}</Text>
        <Text style={s.tagline}>{t(lang, "tagline")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.langRow}>
          {LANGUAGES.map((l) => (
            <TouchableOpacity key={l.code} onPress={() => changeLang(l.code)} style={[s.lang, l.code === lang && s.langOn]} accessibilityRole="button" accessibilityState={{ selected: l.code === lang }}>
              <Text style={[s.langText, l.code === lang && s.langTextOn]}>{l.flag} {l.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {screen === "list" ? (
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.hero}>
            <Text style={s.heroTitle}>{t(lang, "heroTitle")}</Text>
            <Text style={s.heroText}>{t(lang, "heroText")}</Text>
            <TouchableOpacity style={s.cta} onPress={startTour}><Text style={s.ctaText}>{t(lang, "startTour")} →</Text></TouchableOpacity>
          </View>
          <View style={s.tabs}>
            {["palace", "nearby"].map((c) => (
              <TouchableOpacity key={c} onPress={() => switchTab(c)} style={[s.tab, tab === c && s.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === c }}>
                <Text style={[s.tabText, tab === c && s.tabTextOn]}>{t(lang, c === "palace" ? "tabPalace" : "tabNearby")}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput value={query} onChangeText={setQuery} placeholder={t(lang, "search")} placeholderTextColor="#a89a90" style={s.search} />
          {list.length === 0 && <Text style={s.empty}>{t(lang, "empty")}</Text>}
          {list.map((st) => (
            <TouchableOpacity key={st.id} style={s.stop} onPress={() => open(st.id)}>
              <View style={s.num}><Text style={s.numText}>{posOf(st)}</Text></View>
              <Image source={imageFor(st.id)} style={s.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={s.stopTitle}>{localized(st, "title", lang)}</Text>
                <Text style={s.stopSub}>{localized(st, "summary", lang)}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {tab === "nearby" && <Text style={s.footer}>{t(lang, "nearbyNote")}</Text>}
          <Text style={s.footer}>{t(lang, "footer")}</Text>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          <TouchableOpacity onPress={() => { stop(); setScreen("list"); }}><Text style={s.back}>← {t(lang, "stops")}</Text></TouchableOpacity>
          <Image source={imageFor(active.id)}style={[s.coverImg, { width: coverW, height: coverH }]}resizeMode="cover"accessibilityLabel={localized(active, "title", lang)}/>
          <Text style={s.eyebrow}>{t(lang, "floor")}: {localized(active, "floor", lang)}</Text>
          <Text style={s.title}>{localized(active, "title", lang)}</Text>
          <Text style={s.meta}>{posOf(active)} {t(lang, "of")} {group.length} · ~{formatMinutes(seconds)} {t(lang, "min")}</Text>
          <Text style={s.summary}>{localized(active, "summary", lang)}</Text>
          <Text style={s.h3}>{t(lang, "transcript")}</Text>
          <Text style={s.transcript}>{text}</Text>
          {active.category === "palace" ? (
            <>
              <Text style={[s.h3, { marginTop: 22 }]}>{t(lang, "map")}</Text>
              <StopMap
                lang={lang}
                active={active}
                onSelect={(id) => {
                  const st = stops.find((x) => x.id === id);
                  if (st) {
                    stop();
                    setTab(st.category);
                    setActiveId(id);
                  }
                }}
                onPlay={(st) => play(st, false)}
              />
            </>
          ) : (
            <View style={s.nearbyMapNote}>
              <Text style={s.nearbyMapNoteTitle}>📍 {t(lang, "tabNearby")}</Text>
              <Text style={s.nearbyMapNoteText}>{lang === "en" ? "The interactive map is limited to the Palace grounds and its floors. Nearby landmarks are kept separate." : lang === "zh" ? "交互地图仅显示独立宫的庭院和楼层，附近地标单独显示。" : lang === "ja" ? "インタラクティブマップは統一会堂の敷地と各階のみを表示し、周辺スポットは分けています。" : lang === "ko" ? "대화형 지도는 통일궁 경내와 각 층만 표시하며, 주변 명소는 별도로 구분합니다." : "Bản đồ tương tác chỉ hiển thị khuôn viên và từng tầng của Dinh Độc Lập; địa điểm lân cận được tách riêng."}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {screen === "detail" && (
        <View style={s.player}>
          <View style={s.controls}>
            <TouchableOpacity onPress={() => go(-1)} disabled={!getNextStop(activeId, -1)} style={[s.ctl, !getNextStop(activeId, -1) && s.dis]}><Text>⏮</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => (playing ? stop() : play(active))} style={s.mainBtn}><Text style={s.mainText}>{playing ? t(lang, "stop") : t(lang, "play")}</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => go(1)} disabled={!getNextStop(activeId, 1)} style={[s.ctl, !getNextStop(activeId, 1) && s.dis]}><Text>⏭</Text></TouchableOpacity>
          </View>
          <View style={s.speedRow}>
            <Text style={s.speedLabel}>{t(lang, "speed")}</Text>
            <TouchableOpacity onPress={() => changeRate(-0.1)} style={s.ctl}><Text>−</Text></TouchableOpacity>
            <Text style={s.speedVal}>{rate.toFixed(1)}×</Text>
            <TouchableOpacity onPress={() => changeRate(0.1)} style={s.ctl}><Text>+</Text></TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// --- CÁC COMPONENT VẼ BẢN ĐỒ SVG GIỐNG HỆT BẢN WEB ---

function MapMarker({ stop, x, y, selected, onClick, labelColor = "#8b2927", scale = 1 }) {
  const number = String(stop.order ?? stop.badge ?? "•");
  return (
    <G transform={`translate(${x}, ${y}) scale(${scale})`} onPress={() => onClick(stop)}>
      {selected && <Circle r="26" fill="#d4aa45" opacity="0.35" />}
      <Circle r="19" fill={selected ? "#d6aa45" : labelColor} stroke="#fffdf5" strokeWidth="3" />
      <Circle r="14" fill="none" stroke={selected ? "#6f4d15" : "#ffffff"} strokeOpacity="0.7" strokeWidth="1" />
      <SvgText y="5" textAnchor="middle" fontSize="14" fontWeight="900" fill={selected ? "#432d10" : "#fff"}>
        {number}
      </SvgText>
    </G>
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
    <View style={s.svgContainerGrounds}>
      <Svg viewBox="0 0 1000 670" width="100%" height="100%">
        <Defs>
          <LinearGradient id="groundsLawn" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#8fca67" />
            <Stop offset="1" stopColor="#5f9f43" />
          </LinearGradient>
          <LinearGradient id="groundsRoad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#d9d9cc" />
            <Stop offset="1" stopColor="#b9bbae" />
          </LinearGradient>
          <LinearGradient id="palaceRoof" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#fffdf5" />
            <Stop offset="1" stopColor="#ded9c9" />
          </LinearGradient>
        </Defs>
        <Rect width="1000" height="670" fill="#f7f2df" />
        <SvgText x="500" y="28" textAnchor="middle" fill="#5b6659" fontSize="14" fontWeight="700">{l[0]}</SvgText>
        <SvgText x="24" y="340" textAnchor="middle" transform="rotate(-90 24 340)" fill="#5b6659" fontSize="14" fontWeight="700">{l[1]}</SvgText>
        <SvgText x="976" y="340" textAnchor="middle" transform="rotate(-90 976 340)" fill="#5b6659" fontSize="14" fontWeight="700">{l[2]}</SvgText>
        <SvgText x="500" y="654" textAnchor="middle" fill="#5b6659" fontSize="14" fontWeight="700">{l[3]}</SvgText>

        <Rect x="43" y="45" width="914" height="575" rx="14" fill="url(#groundsRoad)" stroke="#a4a897" strokeWidth="2" />
        <Rect x="61" y="62" width="878" height="540" rx="10" fill="#fbf8ed" stroke="#fff" strokeWidth="4" />
        <Rect x="76" y="78" width="848" height="510" rx="8" fill="url(#groundsLawn)" stroke="#477b37" strokeWidth="2" />

        <Path d="M82 270 C130 145 250 112 350 145 C395 170 395 218 350 250 C290 290 214 298 155 355 C120 390 88 355 82 270Z" fill="#6bab4c" stroke="#477d37" strokeWidth="2" />
        <Path d="M585 110 C720 90 850 140 910 250 L910 365 C850 330 800 280 740 255 C665 225 625 175 585 110Z" fill="#73b951" stroke="#4f853b" strokeWidth="2" />
        <Path d="M90 432 C180 375 272 397 345 440 L383 575 L85 575Z" fill="#70b54d" stroke="#4f853b" strokeWidth="2" />
        <Path d="M595 394 C680 360 802 380 914 435 L914 580 L590 580 C630 515 650 462 595 394Z" fill="#6dad4a" stroke="#4f853b" strokeWidth="2" />

        <Path d="M88 275 C170 170 270 170 340 234 C392 282 380 340 334 386 C275 445 230 455 165 430 C100 405 96 330 143 290" fill="none" stroke="#faf6df" strokeWidth="18" strokeLinecap="round" />
        <Path d="M590 155 C692 102 820 157 869 250 C907 323 857 395 781 407 C704 420 640 384 604 333" fill="none" stroke="#faf6df" strokeWidth="18" strokeLinecap="round" />
        <Path d="M115 500 C220 470 323 520 389 555 C470 598 615 580 721 542 C805 510 886 438 899 366" fill="none" stroke="#faf6df" strokeWidth="18" strokeLinecap="round" />
        <Path d="M330 90 C375 145 400 190 416 236 M587 92 C550 142 543 188 557 240" fill="none" stroke="#faf6df" strokeWidth="15" strokeLinecap="round" />
        <Path d="M385 565 C440 527 555 527 617 562" fill="none" stroke="#f6e9b3" strokeWidth="7" strokeLinecap="round" />

        {TREE_POSITIONS.map(([x, y], i) => (
          <G key={`${x}-${y}`} transform={`translate(${x}, ${y})`} opacity={i % 3 === 0 ? 0.96 : 0.82}>
            <Circle cx="2" cy="5" r="14" fill="#356e34" opacity="0.22" />
            <Circle r="12" fill={i % 2 ? "#2f7136" : "#397c3a"} />
            <Circle cx="-4" cy="-4" r="5" fill="#70ad53" />
            <Path d="M0 10 v7" stroke="#755b38" strokeWidth="3" strokeLinecap="round" />
          </G>
        ))}

        <G transform="translate(115, 102)">
          <Rect width="150" height="76" rx="4" fill="#e5ddc5" stroke="#fffdf5" strokeWidth="4" />
          <Rect x="14" y="12" width="36" height="20" rx="4" fill="#7b8d83" />
          <Rect x="62" y="12" width="36" height="20" rx="4" fill="#7b8d83" />
          <Rect x="108" y="12" width="28" height="20" rx="4" fill="#7b8d83" />
          <Rect x="20" y="44" width="40" height="18" rx="3" fill="#53685a" />
          <Rect x="75" y="44" width="44" height="18" rx="3" fill="#53685a" />
        </G>

        <G transform="translate(730, 160) rotate(-8)" fill="#c7d0cb" stroke="#415b55" strokeWidth="2">
          <Path d="M0 -53 L10 -12 L68 4 L68 14 L12 9 L6 42 L21 52 L18 58 L0 48 L-18 58 L-21 52 L-6 42 L-12 9 L-68 14 L-68 4 L-10 -12Z" />
          <Path d="M0 -36 v72" fill="none" stroke="#657a73" />
        </G>

        {[0, 1].map((i) => (
          <G key={i} transform={`translate(${827 + i * 48}, 145)`} fill="#526648" stroke="#263f2b" strokeWidth="2">
            <Rect x="-21" y="-8" width="42" height="19" rx="5" />
            <Rect x="-17" y="8" width="36" height="8" rx="4" fill="#334a30" />
            <Rect x="-5" y="-15" width="18" height="10" rx="3" />
            <Path d="M7 -10 L28 -20" strokeWidth="4" />
          </G>
        ))}

        <G transform="translate(115, 420)">
          <Rect x="0" y="16" width="115" height="66" fill="#fffaf0" stroke="#8d8b78" strokeWidth="2" />
          <Path d="M-6 18 L57 -14 L121 18Z" fill="#c5bda5" stroke="#8d8b78" strokeWidth="2" />
          <Rect x="15" y="28" width="18" height="35" fill="#cfdbd4" stroke="#8d8b78" />
          <Rect x="48" y="28" width="18" height="35" fill="#cfdbd4" stroke="#8d8b78" />
          <Rect x="80" y="28" width="18" height="35" fill="#cfdbd4" stroke="#8d8b78" />
        </G>

        <G>
          <Rect x="390" y="220" width="90" height="68" fill="#67984b" stroke="#466f38" strokeWidth="2" />
          <Rect x="520" y="220" width="90" height="68" fill="#67984b" stroke="#466f38" strokeWidth="2" />
          <Path d="M423 205 H577 V255 H626 V367 H374 V255 H423Z" fill="url(#palaceRoof)" stroke="#4a5950" strokeWidth="3" />
          <Rect x="391" y="277" width="218" height="73" fill="#f4f0e5" stroke="#69766d" strokeWidth="2" />
          <Rect x="445" y="216" width="110" height="28" fill="#e9e4d6" stroke="#69766d" strokeWidth="2" />
          <Rect x="470" y="224" width="60" height="14" fill="#c4cfc7" stroke="#718078" />
          <Path d="M420 367 H580 L557 387 H443Z" fill="#d4cdbc" stroke="#69766d" strokeWidth="2" />
          {Array.from({ length: 12 }, (_, i) => (
            <Line key={i} x1={406 + i * 16} y1="288" x2={406 + i * 16} y2="342" stroke="#d3cdc0" strokeWidth="2" />
          ))}
          <SvgText x="500" y="321" textAnchor="middle" fill="#1e3a2b" fontSize="15" fontWeight="900">{l[4]}</SvgText>
        </G>

        <Path d="M500 389 V492 V570" fill="none" stroke="#faf6df" strokeWidth="24" strokeLinecap="round" />
        <Path d="M500 390 V492 V570" fill="none" stroke="#e8d6a0" strokeWidth="4" strokeDasharray="9 7" />
        <Circle cx="500" cy="480" r="65" fill="#7bbb56" stroke="#fbf6df" strokeWidth="10" />
        <Circle cx="500" cy="480" r="27" fill="#53b7d6" stroke="#fff" strokeWidth="4" />
        <Circle cx="500" cy="480" r="9" fill="#e7fbff" />

        <Path d="M444 586 L465 570 M556 586 L535 570" fill="none" stroke="#4e5a4d" strokeWidth="7" strokeLinecap="round" />
        <Path d="M476 594 H524" stroke="#b42b2b" strokeWidth="12" strokeLinecap="round" />
        <SvgText x="540" y="521" fill="#1f3b2c" fontSize="13" fontWeight="700">{l[5]}</SvgText>
        <SvgText x="103" y="515" fill="#1f3b2c" fontSize="13" fontWeight="700">{l[6]}</SvgText>
        <SvgText x="672" y="232" fill="#1f3b2c" fontSize="13" fontWeight="700">{l[7]}</SvgText>
        <SvgText x="804" y="118" fill="#1f3b2c" fontSize="13" fontWeight="700">{l[8]}</SvgText>

        <G transform="translate(875, 92)">
          <Circle r="25" fill="#fdfaf1" stroke="#25533d" strokeWidth="2" />
          <Path d="M0 -18 L-8 8 L0 3 L8 8Z" fill="#25533d" />
          <SvgText x="0" y="37" textAnchor="middle" fill="#25533d" fontSize="12" fontWeight="800">N</SvgText>
        </G>

        {stopsInZone.map((stop) => {
          const [x, y] = pins[stop.id] || [500, 480];
          return (
            <MapMarker
              key={stop.id}
              stop={stop}
              x={x}
              y={y}
              selected={stop.id === selectedId}
              onClick={onMarkerClick}
              labelColor={stop.id === "garden" ? "#315e8b" : "#922e2a"}
            />
          );
        })}
      </Svg>
    </View>
  );
}

function toIso(x, y) {
  return [330 + (x - y) * 42, 230 + (x + y) * 22];
}
function isoPointString(points) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}
function roomPoints(room) {
  const { x, y, w, h } = room;
  return isoPointString([toIso(x, y), toIso(x + w, y), toIso(x + w, y + h), toIso(x, y + h)]);
}

function IsoFloorMap({ zone, stopsInZone, selectedId, onMarkerClick, lang }) {
  const meta = FLOOR_ROOMS[zone] || FLOOR_ROOMS.floor1;
  const gridFor = (stop) => meta.stopGrid?.[stop.id] || [3.5, 2.2];
  const outline = [[0, 0], [7, 0], [7, 4.4], [0, 4.4]].map(([x, y]) => toIso(x, y));
  const labels = MAP_LABELS[lang] || MAP_LABELS.vi;
  const markerColor = zone === "bunker" ? "#336d79" : "#8d2b2b";

  return (
    <View style={s.svgContainerFloor}>
      <Svg viewBox="0 0 1000 620" width="100%" height="100%">
        <Rect width="1000" height="620" rx="12" fill="#f8f2df" />
        <Polygon points={isoPointString(outline.map(([x, y]) => [x, y + 28]))} fill="#c9c6b6" stroke="#8b897a" strokeWidth="2" />
        <Polygon points={isoPointString([outline[1], outline[2], [outline[2][0], outline[2][1] + 28], [outline[1][0], outline[1][1] + 28]])} fill="#b7b6a8" stroke="#8b897a" strokeWidth="1.5" />
        <Polygon points={isoPointString([outline[2], outline[3], [outline[3][0], outline[3][1] + 28], [outline[2][0], outline[2][1] + 28]])} fill="#d3d0bf" stroke="#8b897a" strokeWidth="1.5" />
        <Polygon points={isoPointString(outline)} fill="#fffdf5" stroke="#4d5c52" strokeWidth="3" />

        <Polyline points={isoPointString([toIso(0.25, 2.0), toIso(6.7, 2.0)])} fill="none" stroke="#ddd8c7" strokeWidth="8" strokeLinecap="round" />
        <Polyline points={isoPointString([toIso(3.4, 0.2), toIso(3.4, 4.15)])} fill="none" stroke="#e5dfcf" strokeWidth="5" strokeLinecap="round" />

        {meta.rooms.map((room) => {
          const center = toIso(room.x + room.w / 2, room.y + room.h / 2);
          return (
            <G key={room.n}>
              <Polygon points={roomPoints(room)} fill={room.color} stroke="#fffdf7" strokeWidth="3" />
              <Polygon points={isoPointString([toIso(room.x, room.y), toIso(room.x + room.w, room.y), toIso(room.x + room.w, room.y + 0.08), toIso(room.x, room.y + 0.08)])} fill="#ffffff" opacity="0.26" />
              <SvgText x={center[0]} y={center[1] + 5} textAnchor="middle" fill="#1f2f27" fontSize="14" fontWeight="800">{room.n}</SvgText>
            </G>
          );
        })}

        <G transform="translate(62, 92)">
          <Rect width="164" height="44" rx="9" fill="#24513e" />
          <SvgText x="82" y="28" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">{meta.title}</SvgText>
        </G>
        <G transform="translate(620, 105)">
          <Circle r="21" fill="#fffdf5" stroke="#bba86f" strokeWidth="2" />
          <Path d="M0 -14 L-7 7 L0 3 L7 7Z" fill="#27553f" />
          <SvgText x="0" y="36" textAnchor="middle" fill="#27553f" fontSize="12" fontWeight="700">N</SvgText>
        </G>

        {stopsInZone.map((stop) => {
          const [gx, gy] = gridFor(stop);
          const [x, y] = toIso(gx, gy);
          return (
            <MapMarker
              key={`${zone}-${stop.id}`}
              stop={stop}
              x={x}
              y={y}
              selected={stop.id === selectedId}
              onClick={onMarkerClick}
              labelColor={markerColor}
              scale={0.9}
            />
          );
        })}

        <Rect x="705" y="32" width="270" height="556" rx="14" fill="#efe7d1" stroke="#d4c8a8" strokeWidth="1.5" />
        <SvgText x="730" y="68" fill="#1e3a2b" fontSize="16" fontWeight="800">{labels.legend}</SvgText>
        <SvgText x="730" y="91" fill="#5e6b62" fontSize="12">{labels.insideNote}</SvgText>
        {meta.rooms.map((room, index) => {
          const y = 116 + index * Math.min(72, 430 / meta.rooms.length);
          const fontSize = room.name.length > 26 ? 12 : 13;
          return (
            <G key={`legend-${room.n}`}>
              <Rect x="728" y={y} width="34" height="30" rx="5" fill={room.color} stroke="#fff" strokeWidth="1.5" />
              <SvgText x="745" y={y + 20} textAnchor="middle" fill="#1f2f27" fontSize="12" fontWeight="800">{room.n}</SvgText>
              <SvgText x="774" y={y + 20} fill="#25342b" fontSize={fontSize} fontWeight="600">
                {room.name.length > 32 ? `${room.name.slice(0, 31)}…` : room.name}
              </SvgText>
              <Line x1="728" y1={y + 43} x2="950" y2={y + 43} stroke="#ded4bc" strokeWidth="1" />
            </G>
          );
        })}
        <SvgText x="730" y="558" fill="#6b6554" fontSize="11">{labels.selectHint}</SvgText>
      </Svg>
    </View>
  );
}

// Hàm StopMap mới thay thế hàm cũ (dòng 190-271 cũ), hiển thị giống hệt MapView.jsx trên Web
function StopMap({ lang = "vi", active, onSelect, onPlay }) {
  const palette = MAP_LABELS[lang] || MAP_LABELS.vi;
  const skipNextActiveIdRef = useRef(false);

  const palaceStops = useMemo(() => stops.filter((st) => st.category === "palace").map((st) => {
    const pos = PALACE_MAP_POSITIONS[st.id] || {};
    return { ...st, roomCode: pos.roomCode || "", zone: ZONE_BY_STOP[st.id] || pos.zone || "grounds" };
  }), []);

  const initialStop = palaceStops.find((st) => st.id === active?.id) || palaceStops[0];
  const [activeZone, setActiveZone] = useState(initialStop?.zone || "grounds");
  const zoneStops = useMemo(
    () => palaceStops.filter((st) => st.zone === activeZone || (st.id === "rooftop" && activeZone === "floor4")),
    [palaceStops, activeZone]
  );
  const selectedStop = zoneStops.find((st) => st.id === active?.id) || zoneStops[0] || null;
  const currentZone = ZONES.find((z) => z.id === activeZone) || ZONES[0];

  useEffect(() => {
    if (skipNextActiveIdRef.current) {
      skipNextActiveIdRef.current = false;
      return;
    }
    const found = palaceStops.find((st) => st.id === active?.id);
    if (found?.zone) setActiveZone(found.zone);
  }, [active?.id, palaceStops]);

  const selectStop = (st) => {
    if (!st) return;
    if (st.id !== active?.id) skipNextActiveIdRef.current = true;
    if (onSelect) onSelect(st.id);
  };

  const switchZone = (zoneId) => {
    setActiveZone(zoneId);
    const available = palaceStops.filter((st) => st.zone === zoneId || (st.id === "rooftop" && zoneId === "floor4"));
    if (available.length && !available.some((st) => st.id === active?.id)) selectStop(available[0]);
  };

  return (
    <View style={s.customMapWrap}>
      <View style={s.webMapHeader}>
        <Text style={s.webMapHeaderTitle}>✦ {palette.map}</Text>
        <Text style={s.webMapHeaderSub}>
          {activeZone === "grounds" ? palette.outsideNote : currentZone.sub[lang] || currentZone.sub.vi}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.zoneRow}>
        {ZONES.map((zf) => {
          const count = palaceStops.filter((st) => st.zone === zf.id || (st.id === "rooftop" && zf.id === "floor4")).length;
          const isOn = activeZone === zf.id;
          return (
            <TouchableOpacity key={zf.id} style={[s.zoneBtn, isOn && s.zoneBtnOn]} onPress={() => switchZone(zf.id)}>
              <Text style={[s.zoneBtnText, isOn && s.zoneBtnTextOn]}>
                {zf.icon} {zf.title[lang] || zf.title.vi} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={s.webMapBoard}>
        <View style={s.webMapBoardHeading}>
          <Text style={s.webMapKicker}>
            {activeZone === "grounds" ? "01 / OUTDOOR MAP" : `0${ZONES.findIndex((z) => z.id === activeZone) + 1} / FLOOR MAP`}
          </Text>
          <Text style={s.webMapBoardTitle}>
            {activeZone === "grounds" ? palette.outside : currentZone.title[lang] || currentZone.title.vi}
          </Text>
        </View>

        {activeZone === "grounds" ? (
          <GroundsMap stopsInZone={zoneStops} selectedId={selectedStop?.id} onMarkerClick={selectStop} lang={lang} />
        ) : (
          <IsoFloorMap zone={activeZone} stopsInZone={zoneStops} selectedId={selectedStop?.id} onMarkerClick={selectStop} lang={lang} />
        )}
      </View>

      {activeZone !== "grounds" && <Text style={s.floorMapNote}>ⓘ {palette.roomMapNote}</Text>}

      {selectedStop && (
        <View style={s.spotPopup}>
          <Text style={s.spotPopupBadge}>
            {palette.place} #{selectedStop.order} {selectedStop.roomCode ? `· 📍 ${selectedStop.roomCode}` : ""}
          </Text>
          <Text style={s.spotPopupTitle}>{selectedStop.icon} {localized(selectedStop, "title", lang)}</Text>
          <Text style={s.spotPopupSummary}>{localized(selectedStop, "summary", lang)}</Text>
          <View style={s.spotActionRow}>
            <TouchableOpacity style={s.spotPopupPlayBtn} onPress={() => onPlay && onPlay(selectedStop)}>
              <Text style={s.spotPopupPlayText}>🔊 {t(lang, "play")}</Text>
            </TouchableOpacity>
            {activeZone === "grounds" && selectedStop.zone !== "grounds" && (
              <TouchableOpacity style={s.spotSecondaryBtn} onPress={() => switchZone(selectedStop.zone)}>
                <Text style={s.spotSecondaryBtnText}>🏛️ {palette.viewFloor}</Text>
              </TouchableOpacity>
            )}
            {activeZone !== "grounds" && (
              <TouchableOpacity style={s.spotSecondaryBtn} onPress={() => switchZone("grounds")}>
                <Text style={s.spotSecondaryBtnText}>🌳 {palette.backGrounds}</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={s.spotPopupTranscript}>{localized(selectedStop, "text", lang)}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: {backgroundColor: RED,paddingHorizontal: 18,paddingTop: 12 + (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0),paddingBottom: 12},
  brand: { color: "#fff", fontSize: 19, fontWeight: "800" },
  tagline: { color: "#e8c9c4", fontSize: 10, marginTop: 2 },
  langRow: { gap: 8, paddingTop: 10 },
  lang: { borderRadius: 999, borderWidth: 1, borderColor: "#ffffff55", paddingVertical: 6, paddingHorizontal: 12 },
  langOn: { backgroundColor: GOLD, borderColor: GOLD },
  langText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  langTextOn: { color: "#561212" },
  content: { padding: 16, paddingBottom: 130 },
  hero: { backgroundColor: RED, borderRadius: 18, padding: 20, marginBottom: 14 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  heroText: { color: "#f3dcd8", fontSize: 13, marginTop: 6, lineHeight: 19 },
  cta: { backgroundColor: GOLD, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, alignSelf: "flex-start", marginTop: 14 },
  ctaText: { color: "#561212", fontWeight: "800" },
  thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: "#f1e2c4" },
  coverImg: { borderRadius: 14, marginBottom: 14, backgroundColor: "#f1e2c4" },
  customMapWrap: { marginTop: 6, gap: 10 },
  webMapHeader: { backgroundColor: "#f6efe0", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#e2d5c1" },
  webMapHeaderTitle: { fontSize: 14, fontWeight: "800", color: RED },
  webMapHeaderSub: { fontSize: 12, color: "#5c645a", marginTop: 2 },
  zoneRow: { gap: 6, paddingBottom: 4 },
  zoneBtn: { borderWidth: 1, borderColor: "#e8dfd0", backgroundColor: "#fff", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  zoneBtnOn: { backgroundColor: RED, borderColor: RED },
  zoneBtnText: { fontSize: 12, fontWeight: "600", color: "#2a1d1a" },
  zoneBtnTextOn: { color: "#fff" },
  webMapBoard: { backgroundColor: "#f7f2df", borderRadius: 14, padding: 8, borderWidth: 1, borderColor: "#d8c9a8" },
  webMapBoardHeading: { marginBottom: 6, paddingHorizontal: 4 },
  webMapKicker: { fontSize: 10, fontWeight: "800", color: RED, letterSpacing: 0.8 },
  webMapBoardTitle: { fontSize: 15, fontWeight: "800", color: "#1e3a2b" },
  svgContainerGrounds: { width: "100%", aspectRatio: 1000 / 670, borderRadius: 10, overflow: "hidden" },
  svgContainerFloor: { width: "100%", aspectRatio: 1000 / 620, borderRadius: 10, overflow: "hidden" },
  floorMapNote: { color: "#82775f", fontSize: 11, fontStyle: "italic", lineHeight: 15, marginTop: 2 },
  nearbyMapNote: { marginTop: 20, padding: 14, backgroundColor: "#f7f0df", borderRadius: 12, borderWidth: 1, borderColor: "#ded2b8" },
  nearbyMapNoteTitle: { color: "#28523d", fontSize: 13, fontWeight: "800" },
  nearbyMapNoteText: { color: "#5f5949", fontSize: 12, lineHeight: 18, marginTop: 6 },
  spotPopup: { backgroundColor: "#fdfaf3", borderWidth: 1, borderColor: "#e2d5c1", borderLeftWidth: 4, borderLeftColor: RED, borderRadius: 12, padding: 12 },
  spotPopupBadge: { fontSize: 11, fontWeight: "700", color: RED, marginBottom: 2 },
  spotPopupTitle: { fontSize: 16, fontWeight: "800", color: "#2a1d1a" },
  spotPopupSummary: { fontSize: 12, color: "#7d6e66", marginVertical: 4 },
  spotActionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 6 },
  spotPopupPlayBtn: { backgroundColor: RED, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  spotPopupPlayText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  spotSecondaryBtn: { backgroundColor: "#e9e1ce", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  spotSecondaryBtnText: { color: "#2b3a30", fontSize: 12, fontWeight: "700" },
  spotPopupTranscript: { fontSize: 14, lineHeight: 21, color: "#2a1d1a", marginTop: 4 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 10 },
  tab: { flex: 1, borderWidth: 1, borderColor: "#e8dfd0", backgroundColor: "#fff", borderRadius: 10, paddingVertical: 9, alignItems: "center" },
  tabOn: { backgroundColor: RED, borderColor: RED },
  tabText: { fontSize: 12, fontWeight: "700", color: "#2a1d1a" },
  tabTextOn: { color: "#fff" },
  summary: { fontSize: 14, color: "#7d6e66", marginBottom: 14 },
  search: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e8dfd0", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 10 },
  empty: { color: "#7d6e66", marginVertical: 12 },
  stop: { backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#e8dfd0", padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 },
  num: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#e8dfd0", alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 12, fontWeight: "800", color: "#2a1d1a" },
  stopTitle: { fontSize: 15, fontWeight: "700", color: "#2a1d1a" },
  stopSub: { fontSize: 12, color: "#7d6e66", marginTop: 2 },
  footer: { textAlign: "center", color: "#a89a90", fontSize: 11, marginTop: 14 },
  back: { color: RED, fontWeight: "700", marginBottom: 10 },
  eyebrow: { color: RED, fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  title: { fontSize: 25, fontWeight: "800", color: "#2a1d1a", marginTop: 4 },
  meta: { color: "#7d6e66", fontSize: 12, marginTop: 4, marginBottom: 14 },
  h3: { color: "#7d6e66", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 6 },
  transcript: { fontSize: 17, lineHeight: 28, color: "#2a1d1a" },
  player: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#e8dfd0", paddingVertical: 10, paddingHorizontal: 16, gap: 8 },
  controls: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  ctl: { borderWidth: 1, borderColor: "#e8dfd0", borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14 },
  dis: { opacity: 0.4 },
  mainBtn: { backgroundColor: RED, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 28, minWidth: 110, alignItems: "center" },
  mainText: { color: "#fff", fontWeight: "800" },
  speedRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  speedLabel: { color: "#7d6e66", fontSize: 12 },
  speedVal: { minWidth: 40, textAlign: "center", fontWeight: "700" }
});