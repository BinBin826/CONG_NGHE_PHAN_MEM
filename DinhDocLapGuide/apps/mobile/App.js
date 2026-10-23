import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Image
} from "react-native";
import * as Speech from "expo-speech";
import { imageFor } from "./images";
import {
  LANGUAGES, stops, t, localized, detectLang, speechLang, estimateSeconds, formatMinutes, getNextStop, searchStops, stopsByCategory,
  PALACE_MAP_POSITIONS
} from "@palaceguide/shared";

const RED = "#7a1f1f";
const GOLD = "#c9a24a";
const CREAM = "#faf6ee";

const ZONE_FILTERS = [
  { id: "grounds", label: { vi: "🌳 Khuôn viên", en: "🌳 Grounds", zh: "🌳 庭院", ja: "🌳 敷地内", ko: "🌳 정원/외부" } },
  { id: "bunker",  label: { vi: "📡 Tầng hầm", en: "📡 Bunker", zh: "📡 地下层", ja: "📡 地下", ko: "📡 지하" } },
  { id: "ground",  label: { vi: "🚙 Tầng trệt", en: "🚙 Ground", zh: "🚙 底层", ja: "🚙 地上階", ko: "🚙 지상층" } },
  { id: "floor1",  label: { vi: "🥂 Tầng 1", en: "🥂 1st Floor", zh: "🥂 一楼", ja: "🥂 1階", ko: "🥂 1층" } },
  { id: "floor2",  label: { vi: "📜 Tầng 2", en: "📜 2nd Floor", zh: "📜 二楼", ja: "📜 2階", ko: "📜 2층" } },
  { id: "floor3",  label: { vi: "🎬 Tầng 3", en: "🎬 3rd Floor", zh: "🎬 三楼", ja: "🎬 3階", ko: "🎬 3층" } },
  { id: "floor4",  label: { vi: "🪟 Tầng 4", en: "🪟 Floor 4", zh: "🪟 四层", ja: "🪟 4階", ko: "🪟 4층" } },
  { id: "rooftop", label: { vi: "🚁 Sân thượng", en: "🚁 Rooftop", zh: "🚁 屋顶", ja: "🚁 屋上", ko: "🚁 옥상" } }
];

const ZONE_BY_STOP = {
  gate: "grounds", exhibition: "grounds", garden: "grounds", architecture: "grounds", history: "grounds", reunification: "grounds",
  bunker: "bunker", vehicles: "ground", cabinet: "floor1", reception: "floor1", office: "floor2", presidentRoom: "floor2", credentials: "floor2", family: "floor3", rooftop: "rooftop"
};
const MOBILE_GROUNDS_PINS = { gate: [50, 88], exhibition: [18, 65], garden: [80, 22], architecture: [50, 43], history: [39, 47], reunification: [61, 47] };
const MOBILE_ZONE_PINS = {
  bunker: { bunker: [48, 50] }, ground: { vehicles: [64, 64] },
  floor1: { cabinet: [67, 42], reception: [31, 44] },
  floor2: { office: [52, 38], presidentRoom: [32, 67], credentials: [72, 68] },
  floor3: { family: [62, 62] }, floor4: { rooftop: [52, 48] }, rooftop: { rooftop: [52, 48] }
};
const MOBILE_FLOOR_ROOMS = {
  bunker: { title: "TẦNG HẦM · KHU CHỈ HUY", rooms: [["19", "Tham mưu tác chiến", "#b6ca9a"], ["21", "Thông tin liên lạc", "#8acbd0"], ["20", "Phát thanh dự phòng", "#e4c16e"], ["24", "An ninh", "#e7a179"], ["23", "Trực chiến", "#9cafa8"], ["22", "Lưu trú", "#c98e96"]] },
  ground: { title: "TẦNG TRỆT · DỊCH VỤ & TRƯNG BÀY", rooms: [["25", "Khu bếp", "#cba47a"], ["30", "Phòng tập bắn", "#c98282"], ["31", "Chiếu phim tư liệu", "#b2a7ce"], ["26", "Xe Jeep M151A2", "#8faabd"], ["27", "Khu dịch vụ", "#a8c79a"], ["28", "Xe Mercedes", "#9daaa8"]] },
  floor1: { title: "TẦNG 1 · NGHI LỄ & TIẾP KHÁCH", rooms: [["4", "Phòng Khánh tiết", "#c28f93"], ["2", "Phòng Đại yến", "#e8c66f"], ["3", "Sảnh và cầu thang", "#aab7b3"], ["1", "Phòng Nội các", "#9bbda4"], ["5", "Hành lang", "#ded5bc"]] },
  floor2: { title: "TẦNG 2 · KHU LÀM VIỆC", rooms: [["5", "Hội đồng An ninh", "#b5a7d0"], ["6", "Phòng làm việc Tổng thống", "#8fb6d2"], ["7", "Phòng tiếp khách Tổng thống", "#dbb99b"], ["11", "Phòng Quốc thư", "#c88e93"], ["8", "Khu tiếp khách phụ", "#a9c89c"]] },
  floor3: { title: "TẦNG 3 · SINH HOẠT & GIẢI TRÍ", rooms: [["13", "Thư viện", "#ccb99a"], ["14", "Tiếp khách Phu nhân", "#d3a6b8"], ["15", "Phòng chiếu phim", "#bb9197"], ["16", "Phòng giải trí", "#e7c678"], ["12", "Khu gia đình", "#a6c49a"]] },
  floor4: { title: "TẦNG 4 · TỨ PHƯƠNG VÔ SỰ LẦU", rooms: [["17", "Tứ phương vô sự lầu", "#c98e91"], ["18", "Hành lang và mái", "#dcd4bd"]] },
  rooftop: { title: "SÂN THƯỢNG · SÂN ĐỖ TRỰC THĂNG", rooms: [["A", "Sân đỗ UH-1", "#d9d7ca"], ["B", "Khu kỹ thuật", "#a8b0a9"]] }
};

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
          <Image source={imageFor(active.id)} style={s.coverImg} resizeMode="cover" accessibilityLabel={localized(active, "title", lang)} />
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

// Sơ đồ riêng từng khu vực trong Dinh Độc Lập — không dùng Google Maps.
function StopMap({ lang, active, onSelect, onPlay }) {
  const initialZone = ZONE_BY_STOP[active.id] || "grounds";
  const [zone, setZone] = useState(initialZone);
  const skipNextActiveRef = useRef(false);

  const palaceStops = stops.filter((st) => st.category === "palace").map((st, idx) => {
    const pos = PALACE_MAP_POSITIONS[st.id] || {};
    return { ...st, ...pos, zone: ZONE_BY_STOP[st.id] || pos.zone || "grounds", badge: pos.badge || String(idx + 1) };
  });
  const visibleStops = palaceStops.filter((st) => st.zone === zone || (st.id === "rooftop" && zone === "floor4"));
  const selectedStop = visibleStops.find((st) => st.id === active.id) || visibleStops[0];
  const floorMeta = MOBILE_FLOOR_ROOMS[zone];

  useEffect(() => {
    if (skipNextActiveRef.current) { skipNextActiveRef.current = false; return; }
    setZone(ZONE_BY_STOP[active.id] || "grounds");
  }, [active.id]);

  const chooseStop = (st) => {
    if (!st) return;
    if (st.id !== active.id) skipNextActiveRef.current = true;
    onSelect(st.id);
  };
  const chooseZone = (nextZone) => {
    setZone(nextZone);
    const available = palaceStops.filter((st) => st.zone === nextZone || (st.id === "rooftop" && nextZone === "floor4"));
    if (available.length && !available.some((st) => st.id === active.id)) chooseStop(available[0]);
  };

  return (
    <View style={s.customMapWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.zoneRow}>
        {ZONE_FILTERS.map((zf) => (
          <TouchableOpacity key={zf.id} style={[s.zoneBtn, zone === zf.id && s.zoneBtnOn]} onPress={() => chooseZone(zf.id)}>
            <Text style={[s.zoneBtnText, zone === zf.id && s.zoneBtnTextOn]}>{zf.label[lang] || zf.label.vi}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {zone === "grounds" ? (
        <View style={s.mapCanvas}>
          <View style={s.mapRearGarden}><Text style={s.mapAreaLabel}>VƯỜN SAU & MÁY BAY F-5E</Text></View>
          <View style={s.mapTankArea}><Text style={s.mapSmallLabel}>KHU TRƯNG BÀY XE TĂNG</Text></View>
          <View style={s.mapMainBuilding}><Text style={s.mapBuildingLabel}>DINH ĐỘC LẬP</Text></View>
          <View style={s.mapExhibitionBox}><Text style={s.mapSmallLabel}>NHÀ TRƯNG BÀY</Text></View>
          <View style={s.mapFrontLawn}><Text style={s.mapAreaLabel}>ĐÀI PHUN NƯỚC</Text></View>
          <View style={s.mapMainGate}><Text style={s.mapGateLabel}>CỔNG CHÍNH · 135 NAM KỲ KHỞI NGHĨA</Text></View>
          {visibleStops.map((st) => (
            <TouchableOpacity key={st.id} style={[s.hotspotPin, { left: `${MOBILE_GROUNDS_PINS[st.id]?.[0] ?? st.x ?? 50}%`, top: `${MOBILE_GROUNDS_PINS[st.id]?.[1] ?? st.y ?? 50}%` }, selectedStop?.id === st.id && s.hotspotPinOn]} onPress={() => chooseStop(st)}>
              <Text style={[s.hotspotPinText, selectedStop?.id === st.id && s.hotspotPinTextOn]}>{st.order}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={s.floorMapCanvas}>
          <View style={s.floorMapHeading}><Text style={s.floorMapOverline}>SƠ ĐỒ MẶT BẰNG</Text><Text style={s.floorMapTitle}>{floorMeta?.title}</Text></View>
          <View style={s.floorRoomGrid}>
            {floorMeta?.rooms.map(([num, name, color]) => (
              <View key={num} style={[s.floorRoom, { backgroundColor: color }]}>
                <Text style={s.floorRoomNumber}>{num}</Text><Text style={s.floorRoomName}>{name}</Text>
              </View>
            ))}
          </View>
          {visibleStops.map((st) => {
            const [x, y] = MOBILE_ZONE_PINS[zone]?.[st.id] || [50, 50];
            return <TouchableOpacity key={st.id} style={[s.hotspotPin, s.floorHotspotPin, { left: `${x}%`, top: `${y}%` }, selectedStop?.id === st.id && s.hotspotPinOn]} onPress={() => chooseStop(st)}>
              <Text style={[s.hotspotPinText, selectedStop?.id === st.id && s.hotspotPinTextOn]}>{st.order}</Text>
            </TouchableOpacity>;
          })}
          <Text style={s.floorMapNote}>ⓘ Sơ đồ minh họa định hướng tham quan, không phải bản vẽ kỹ thuật.</Text>
        </View>
      )}

      {selectedStop && (
        <View style={s.spotPopup}>
          <Text style={s.spotPopupBadge}>#{selectedStop.order} · {localized(selectedStop, "floor", lang)}</Text>
          <Text style={s.spotPopupTitle}>{selectedStop.icon} {localized(selectedStop, "title", lang)}</Text>
          <Text style={s.spotPopupSummary}>{localized(selectedStop, "summary", lang)}</Text>
          <TouchableOpacity style={s.spotPopupPlayBtn} onPress={() => onPlay && onPlay(selectedStop)}><Text style={s.spotPopupPlayText}>🔊 {t(lang, "play")}</Text></TouchableOpacity>
          <Text style={s.spotPopupTranscript}>{localized(selectedStop, "text", lang)}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: { backgroundColor: RED, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12 },
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
  coverImg: { width: "100%", aspectRatio: 16 / 9, borderRadius: 14, marginBottom: 14, backgroundColor: "#f1e2c4" },
  customMapWrap: { marginTop: 6, gap: 10 },
  zoneRow: { gap: 6, paddingBottom: 4 },
  zoneBtn: { borderWidth: 1, borderColor: "#e8dfd0", backgroundColor: "#fff", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  zoneBtnOn: { backgroundColor: RED, borderColor: RED },
  zoneBtnText: { fontSize: 12, fontWeight: "600", color: "#2a1d1a" },
  zoneBtnTextOn: { color: "#fff" },
  mapCanvas: { height: 320, borderRadius: 14, backgroundColor: "#d9ead3", borderWidth: 2, borderColor: "#5a8a52", position: "relative", overflow: "hidden" },
  mapRearGarden: { position: "absolute", top: "5%", left: "22%", width: "56%", height: "12%", backgroundColor: "#c5e0b8", borderRadius: 8, borderWidth: 1, borderColor: "#78a668", alignItems: "center", justifyContent: "center" },
  mapTankArea: { position: "absolute", top: "7%", right: "4%", width: "18%", height: "13%", backgroundColor: "#d7e1c9", borderRadius: 8, borderWidth: 1, borderColor: "#69845a", alignItems: "center", justifyContent: "center", padding: 3 },
  floorMapCanvas: { minHeight: 370, borderRadius: 14, backgroundColor: "#f6f0df", borderWidth: 1, borderColor: "#d8c9a8", position: "relative", overflow: "hidden", padding: 12, paddingBottom: 28 },
  floorMapHeading: { backgroundColor: "#24513e", borderBottomWidth: 3, borderBottomColor: GOLD, borderRadius: 10, padding: 11, marginBottom: 12 },
  floorMapOverline: { color: "#e8c96e", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  floorMapTitle: { color: "#fffdf5", fontSize: 13, lineHeight: 18, fontWeight: "900", marginTop: 3 },
  floorRoomGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  floorRoom: { width: "48%", minHeight: 76, borderWidth: 2, borderColor: "#fffdf6", borderRadius: 9, padding: 9, justifyContent: "center", elevation: 1 },
  floorRoomNumber: { color: "#304837", fontSize: 12, fontWeight: "900" },
  floorRoomName: { color: "#354438", fontSize: 10, lineHeight: 14, fontWeight: "700", marginTop: 4 },
  floorHotspotPin: { zIndex: 5, borderColor: "#fff8e7" },
  floorMapNote: { color: "#82775f", fontSize: 9, lineHeight: 13, marginTop: 11 },
  nearbyMapNote: { marginTop: 20, padding: 14, backgroundColor: "#f7f0df", borderRadius: 12, borderWidth: 1, borderColor: "#ded2b8" },
  nearbyMapNoteTitle: { color: "#28523d", fontSize: 13, fontWeight: "800" },
  nearbyMapNoteText: { color: "#5f5949", fontSize: 12, lineHeight: 18, marginTop: 6 },
  mapMainBuilding: { position: "absolute", top: "21%", left: "24%", width: "52%", height: "42%", backgroundColor: "#fffdf8", borderRadius: 8, borderWidth: 2, borderColor: RED, alignItems: "center", justifyContent: "center" },
  mapBuildingLabel: { fontSize: 10, fontWeight: "800", color: RED, opacity: 0.45 },
  mapBunkerText: { fontSize: 9, fontWeight: "700", color: "#fff" },
  mapExhibitionBox: { position: "absolute", top: "60%", left: "8%", width: "20%", height: "12%", backgroundColor: "#f3e3c6", borderRadius: 6, borderWidth: 1, borderColor: "#8c6239", alignItems: "center", justifyContent: "center" },
  mapSmallLabel: { fontSize: 8, fontWeight: "700", color: "#3a2e28" },
  mapFrontLawn: { position: "absolute", top: "70%", left: "26%", width: "48%", height: "16%", backgroundColor: "#b5d9a8", borderRadius: 40, borderWidth: 3, borderColor: "#f4ebd9", alignItems: "center", justifyContent: "center" },
  mapAreaLabel: { fontSize: 9, fontWeight: "700", color: "#2e5624" },
  mapMainGate: { position: "absolute", bottom: 0, left: "25%", width: "50%", height: 22, backgroundColor: RED, borderTopLeftRadius: 6, borderTopRightRadius: 6, alignItems: "center", justifyContent: "center" },
  mapGateLabel: { fontSize: 8, fontWeight: "700", color: "#fff" },
  hotspotPin: { position: "absolute", width: 28, height: 28, marginLeft: -14, marginTop: -14, borderRadius: 14, backgroundColor: RED, borderWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 4 },
  hotspotPinOn: { backgroundColor: GOLD, borderColor: "#561212", transform: [{ scale: 1.2 }] },
  hotspotPinText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  hotspotPinTextOn: { color: "#561212" },
  spotPopup: { backgroundColor: "#fdfaf3", borderWidth: 1, borderColor: "#e2d5c1", borderLeftWidth: 4, borderLeftColor: RED, borderRadius: 12, padding: 12 },
  spotPopupBadge: { fontSize: 11, fontWeight: "700", color: RED, marginBottom: 2 },
  spotPopupTitle: { fontSize: 16, fontWeight: "800", color: "#2a1d1a" },
  spotPopupSummary: { fontSize: 12, color: "#7d6e66", marginVertical: 4 },
  spotPopupPlayBtn: { alignSelf: "flex-start", backgroundColor: RED, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, marginVertical: 6 },
  spotPopupPlayText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  spotPopupTranscript: { fontSize: 14, lineHeight: 21, color: "#2a1d1a", marginTop: 4 },
  mapNote: { color: "#7d6e66", fontSize: 11, marginTop: 8 },
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
