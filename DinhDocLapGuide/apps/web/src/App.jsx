import React, { useEffect, useMemo, useState } from "react";
import {
  LANGUAGES, DEFAULT_LANG, stops, t, localized, detectLang, normalizeLang,
  estimateSeconds, formatMinutes, getNextStop, searchStops, stopsByCategory
} from "@palaceguide/shared";
import { useSpeech } from "./useSpeech.js";
import { imageFor } from "./images.js";
import MapView from "./MapView.jsx";
import QrButton from "./QrButton.jsx";
const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || (import.meta.env.DEV ? "http://localhost:5174" : "");
import { syncContent, logListen, logQrScan } from "./remote.js";

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
  const [query, setQuery] = useState("");
  const [rate, setRate] = useState(1);
  const [autoNext, setAutoNext] = useState(false);
  const [version, setVersion] = useState(0);
  const speech = useSpeech();

  const active = stops.find((s) => s.id === activeId) || stops[0];
  const list = useMemo(() => searchStops(query, lang), [query, lang, version]);
  const group = stopsByCategory(active.category);
  const posOf = (s) => stopsByCategory(s.category).findIndex((x) => x.id === s.id) + 1;
  const text = localized(active, "text", lang);

    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get("place");
    if (params.get("src") === "qr") {
      let first = true;
      try { first = !sessionStorage.getItem("palaceguide_qr"); sessionStorage.setItem("palaceguide_qr", "1"); } catch { /* bỏ qua */ }
      if (first) logQrScan(target, lang);
    }
    syncContent().then((ok) => {
      if (ok) setVersion((v) => v + 1);
      if (target && stops.some((x) => x.id === target)) setActiveId(target);
    });
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* bỏ qua */ }
  }, [lang]);

    const play = (stop = active, opts = {}) => {
    const body = localized(stop, "text", lang);
    logListen(stop.id, lang, false);
    speech.speak(body, lang, rate, () => {
      logListen(stop.id, lang, true);
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
  };
  const go = (dir) => {
    const n = getNextStop(activeId, dir);
    if (!n) return;
    const wasPlaying = speech.status === "playing";
    setActiveId(n.id);
    if (wasPlaying) play(n, { chain: autoNext }); else speech.stop();
  };
  const startTour = () => { setActiveId(stops[0].id); setAutoNext(true); play(stops[0], { chain: true }); };

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
         <QrButton />
         {DASHBOARD_URL && (
          <a className="lang staff-link" href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer">
             Quản lý
          </a>
        )}
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
         <h3 className="map-h">{t(lang, "map")}</h3>
         <MapView key={version} lang={lang} activeId={activeId} onSelect={(id) => select(id)} onPlay={(st) => play(st, { chain: autoNext })} />
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
