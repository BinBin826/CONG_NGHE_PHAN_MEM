import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Image, Linking
} from "react-native";
import * as Speech from "expo-speech";
import MapView, { Marker } from "react-native-maps";
import { imageFor } from "./images";
import {
  LANGUAGES, stops, t, localized, detectLang, speechLang, estimateSeconds, formatMinutes, getNextStop, searchStops, stopsByCategory,
  PALACE_COORDS, getCoords, mapPoints, mapsUrl, walkingUrl
} from "@palaceguide/shared";

const RED = "#7a1f1f";
const GOLD = "#c9a24a";
const CREAM = "#faf6ee";

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
          <Text style={[s.h3, { marginTop: 22 }]}>{t(lang, "map")}</Text>
          <StopMap lang={lang} active={active} onSelect={(id) => { const st = stops.find((x) => x.id === id); if (st) { stop(); setTab(st.category); setActiveId(id); } }} />
          <View style={s.mapActions}>
            <TouchableOpacity style={s.mapBtn} onPress={() => Linking.openURL(mapsUrl(active))}><Text style={s.mapBtnText}>📍 {t(lang, "openMaps")}</Text></TouchableOpacity>
            {active.category === "nearby" && <TouchableOpacity style={s.mapBtn} onPress={() => Linking.openURL(walkingUrl(active))}><Text style={s.mapBtnText}>🚶 {t(lang, "walkFromPalace")}</Text></TouchableOpacity>}
          </View>
          <Text style={s.mapNote}>{t(lang, "mapNote")}</Text>
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

function StopMap({ lang, active, onSelect }) {
  const c = getCoords(active);
  const nearby = active.category === "nearby";
  const region = { latitude: c.lat, longitude: c.lng, latitudeDelta: nearby ? 0.012 : 0.008, longitudeDelta: nearby ? 0.012 : 0.008 };
  return (
    <MapView key={active.id} style={s.map} initialRegion={region}>
      <Marker coordinate={{ latitude: PALACE_COORDS.lat, longitude: PALACE_COORDS.lng }} title={t(lang, "palaceName")} description={t(lang, "palaceAddress")}
        pinColor={nearby ? "#7a1f1f" : "#c9a24a"} onPress={() => onSelect("gate")} />
      {stops.filter((x) => x.category === "nearby").map((x) => {
        const p = getCoords(x);
        return <Marker key={x.id} coordinate={{ latitude: p.lat, longitude: p.lng }} title={localized(x, "title", lang)}
          pinColor={x.id === active.id ? "#c9a24a" : "#7a1f1f"} onPress={() => onSelect(x.id)} />;
      })}
    </MapView>
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
  map: { height: 240, borderRadius: 14, overflow: "hidden" },
  mapActions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  mapBtn: { borderWidth: 1, borderColor: "#e6c9c4", backgroundColor: "#f9efed", borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12 },
  mapBtnText: { color: RED, fontSize: 12, fontWeight: "700" },
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
  icon: { fontSize: 24 },
  stopTitle: { fontSize: 15, fontWeight: "700", color: "#2a1d1a" },
  stopSub: { fontSize: 12, color: "#7d6e66", marginTop: 2 },
  footer: { textAlign: "center", color: "#a89a90", fontSize: 11, marginTop: 14 },
  back: { color: RED, fontWeight: "700", marginBottom: 10 },
  cover: { height: 140, borderRadius: 14, backgroundColor: "#f1e2c4", alignItems: "center", justifyContent: "center", marginBottom: 14 },
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
