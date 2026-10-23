import React, { useEffect, useMemo, useState } from "react";
import {
  LANGUAGES, DEFAULT_LANG, stops, t, localized, detectLang, normalizeLang,
  estimateSeconds, formatMinutes, getNextStop, searchStops, stopsByCategory
} from "@palaceguide/shared";
import { useSpeech } from "./useSpeech.js";
import { imageFor } from "./images.js";
import MapView from "./MapView.jsx";

const LANG_KEY = "palaceguide_lang";
const readLang = () => {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) return normalizeLang(saved);
  } catch { /* bỏ qua */ }
  return detectLang(typeof navigator !== "undefined" ? navigator.language : DEFAULT_LANG);
};

export default function App() {
  const [lang, setLang] = useState(readLang);
  const [activeId, setActiveId] = useState(stops[0].id);
  const [tab, setTab] = useState("palace");
  const [query, setQuery] = useState("");
  const [rate, setRate] = useState(1);
  const [autoNext, setAutoNext] = useState(false);
  const speech = useSpeech();

  const active = stops.find((s) => s.id === activeId);
  const list = useMemo(() => searchStops(query, lang, tab), [query, lang, tab]);
  const group = stopsByCategory(active.category);
  const posOf = (s) => stopsByCategory(s.category).findIndex((x) => x.id === s.id) + 1;
  const text = localized(active, "text", lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* bỏ qua */ }
  }, [lang]);

  const play = (stop = active, opts = {}) => {
    const body = localized(stop, "text", lang);
    speech.speak(body, lang, rate, () => {
      if (opts.chain) {
        const next = getNextStop(stop.id, 1);
        if (next) { setActiveId(next.id); play(next, { chain: true }); }
      }
    });
  };

  const changeLang = (code) => { speech.stop(); setLang(code); };
  const select = (id, fromMap = false) => {
    speech.stop();
    setActiveId(id);
    if (fromMap) { const s = stops.find((x) => x.id === id); if (s) { setTab(s.category); setQuery(""); } }
  };
  const go = (dir) => {
    const n = getNextStop(activeId, dir);
    if (!n) return;
    const wasPlaying = speech.status === "playing";
    setActiveId(n.id);
    if (wasPlaying) play(n, { chain: autoNext }); else speech.stop();
  };
  const switchTab = (c) => { speech.stop(); setTab(c); setQuery(""); setActiveId(stopsByCategory(c)[0].id); };
  const startTour = () => { setTab("palace"); setActiveId(stops[0].id); setAutoNext(true); play(stops[0], { chain: true }); };

  const mainAction = () => {
    if (speech.status === "playing") speech.pause();
    else if (speech.status === "paused") speech.resume();
    else play(active, { chain: autoNext });
  };
  const mainLabel = speech.status === "playing" ? t(lang, "pause") : speech.status === "paused" ? t(lang, "resume") : t(lang, "play");
  const seconds = estimateSeconds(text, lang, rate);

  return (
    <div className="shell">
      <header className="top">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">★</span>
          <div><strong>{t(lang, "appName")}</strong><small>{t(lang, "tagline")}</small></div>
        </div>
        <div className="langs" role="group" aria-label={t(lang, "language")}>
          {LANGUAGES.map((l) => (
            <button key={l.code} className={`lang ${l.code === lang ? "on" : ""}`} aria-pressed={l.code === lang}
              onClick={() => changeLang(l.code)} title={l.native}>
              <span aria-hidden="true">{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      </header>

      <section className="hero">
        <h1>{t(lang, "heroTitle")}</h1>
        <p>{t(lang, "heroText")}</p>
        {speech.supported && <button className="cta" onClick={startTour}>{t(lang, "startTour")} →</button>}
      </section>

      {!speech.supported && <div className="warn" role="alert">{t(lang, "unsupported")}</div>}
      {speech.supported && !speech.hasVoiceFor(lang) && <div className="warn" role="alert">{t(lang, "noVoice")}</div>}

      <main className="grid">
        <aside className="stops" aria-label={t(lang, "stops")}>
          <div className="stops-head">
            <h2>{t(lang, "stops")}</h2>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(lang, "search")} aria-label={t(lang, "search")} />
          </div>
          <div className="tabs" role="tablist">
            {["palace", "nearby"].map((c) => (
              <button key={c} role="tab" aria-selected={tab === c} className={`tab ${tab === c ? "on" : ""}`} onClick={() => switchTab(c)}>
                {t(lang, c === "palace" ? "tabPalace" : "tabNearby")}
              </button>
            ))}
          </div>
          <ol>
            {list.map((s) => (
              <li key={s.id}>
                <button className={`stop ${s.id === activeId ? "on" : ""}`} onClick={() => select(s.id)}>
                  <span className="num">{posOf(s)}</span>
                  <span className="ico" aria-hidden="true">{s.icon}</span>
                  <span className="txt"><b>{localized(s, "title", lang)}</b><small>{localized(s, "summary", lang)}</small></span>
                </button>
              </li>
            ))}
          </ol>
          {list.length === 0 && <p className="empty">{t(lang, "empty")}</p>}
          {tab === "nearby" && <p className="empty">{t(lang, "nearbyNote")}</p>}
        </aside>

        <article className="detail">
          <figure className="detail-cover">
            {imageFor(active.id)
              ? <img src={imageFor(active.id)} alt={localized(active, "title", lang)} loading="lazy" />
              : <span aria-hidden="true">{active.icon}</span>}
          </figure>
          <p className="eyebrow">{t(lang, "floor")}: {localized(active, "floor", lang)}</p>
          <h2>{localized(active, "title", lang)}</h2>
          <p className="meta">{posOf(active)} {t(lang, "of")} {group.length} · ~{formatMinutes(seconds)} {t(lang, "min")}</p>
          <p className="summary">{localized(active, "summary", lang)}</p>
          <h3>{t(lang, "transcript")}</h3>
          <p className="transcript" lang={lang}>{text}</p>
          {active.category === "palace" ? (
            <>
              <h3 className="map-h">{t(lang, "map")}</h3>
              <MapView lang={lang} activeId={activeId} onSelect={(id) => select(id, true)} onPlay={(st) => play(st, { chain: autoNext })} />
            </>
          ) : (
            <div className="nearby-map-note" role="note">
              <strong>📍 {t(lang, "tabNearby")}</strong>
              <p>{lang === "en" ? "The interactive floor and grounds maps are limited to Independence Palace. Nearby landmarks are intentionally kept separate so they do not appear inside the Palace map." : lang === "zh" ? "交互地图仅显示独立宫的庭院和楼层。附近地标单独显示，不会混入宫殿地图。" : lang === "ja" ? "インタラクティブマップは統一会堂の敷地と各階のみを表示します。周辺スポットは宮殿の地図に混在しないよう分けています。" : lang === "ko" ? "대화형 지도는 통일궁 경내와 각 층만 표시합니다. 주변 명소는 궁전 지도에 섞이지 않도록 별도로 구분했습니다." : "Bản đồ tương tác chỉ hiển thị khuôn viên và từng tầng bên trong Dinh Độc Lập. Các địa điểm lân cận được tách riêng, không trộn vào sơ đồ Dinh."}</p>
            </div>
          )}
        </article>
      </main>

      <footer className="player" aria-label={t(lang, "nowPlaying")}>
        <div className="now"><small>{speech.status === "idle" ? t(lang, "stops") : t(lang, "nowPlaying")}</small><b>{localized(active, "title", lang)}</b></div>
        <div className="controls">
          <button onClick={() => go(-1)} disabled={!getNextStop(activeId, -1)} aria-label={t(lang, "prev")}>⏮</button>
          <button className="main" onClick={mainAction} disabled={!speech.supported}>{mainLabel}</button>
          <button onClick={speech.stop} disabled={speech.status === "idle"} aria-label={t(lang, "stop")}>⏹</button>
          <button onClick={() => go(1)} disabled={!getNextStop(activeId, 1)} aria-label={t(lang, "next")}>⏭</button>
        </div>
        <label className="speed">{t(lang, "speed")} {rate.toFixed(1)}×
          <input type="range" min="0.6" max="1.4" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
        </label>
      </footer>
      <p className="foot">{t(lang, "footer")}</p>
    </div>
  );
}
