import { useCallback, useEffect, useRef, useState } from "react";
import { pickVoice, speechLang } from "@palaceguide/shared";

const hasSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

// Hook đọc thuyết minh bằng Web Speech API (không cần backend).
export function useSpeech() {
  const supported = hasSpeech();
  const [status, setStatus] = useState("idle"); // idle | playing | paused
  const [voices, setVoices] = useState([]);
  const token = useRef(0);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener?.("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    token.current += 1;
    window.speechSynthesis.cancel();
    setStatus("idle");
  }, [supported]);

  const speak = useCallback((text, lang, rate = 1, onEnd) => {
    if (!supported) return;
    token.current += 1;
    const mine = token.current;
    window.speechSynthesis.cancel();
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = speechLang(lang);
    u.rate = rate;
    const voice = pickVoice(window.speechSynthesis.getVoices(), lang);
    if (voice) u.voice = voice;
    u.onend = () => { if (token.current === mine) { setStatus("idle"); onEnd?.(); } };
    u.onerror = () => { if (token.current === mine) setStatus("idle"); };
    window.speechSynthesis.speak(u);
    setStatus("playing");
  }, [supported]);

  const pause = useCallback(() => { if (supported) { window.speechSynthesis.pause(); setStatus("paused"); } }, [supported]);
  const resume = useCallback(() => { if (supported) { window.speechSynthesis.resume(); setStatus("playing"); } }, [supported]);

  const hasVoiceFor = useCallback((lang) => !supported || voices.length === 0 || !!pickVoice(voices, lang), [supported, voices]);

  return { supported, status, speak, pause, resume, stop, hasVoiceFor };
}
