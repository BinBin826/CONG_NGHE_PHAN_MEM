import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { stops, localized, t, PALACE_COORDS, getCoords } from "@palaceguide/shared";

const pin = (emoji, on) =>
  L.divIcon({
    className: "pin-wrap",
    html: `<div class="pin ${on ? "pin-on" : ""}"><span>${emoji}</span></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38]
  });

// Bản đồ OpenStreetMap: Dinh + các địa danh lân cận, bấm marker để chọn điểm.
export default function MapView({ lang, activeId, onSelect }) {
  const el = useRef(null);
  const map = useRef(null);
  const markers = useRef({});
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    map.current = L.map(el.current, { scrollWheelZoom: false }).setView([PALACE_COORDS.lat, PALACE_COORDS.lng], 15);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map.current);

    const palace = L.marker([PALACE_COORDS.lat, PALACE_COORDS.lng], { icon: pin("🏛️", false) }).addTo(map.current);
    palace.on("click", () => onSelectRef.current("gate"));
    markers.current.__palace = palace;

    stops.filter((s) => s.category === "nearby").forEach((s) => {
      const c = getCoords(s);
      const m = L.marker([c.lat, c.lng], { icon: pin(s.icon, false) }).addTo(map.current);
      m.on("click", () => onSelectRef.current(s.id));
      markers.current[s.id] = m;
    });
    return () => { map.current.remove(); map.current = null; markers.current = {}; };
  }, []);

  // đổi nhãn khi đổi ngôn ngữ
  useEffect(() => {
    markers.current.__palace?.bindTooltip(t(lang, "palaceName"));
    stops.filter((s) => s.category === "nearby").forEach((s) => markers.current[s.id]?.bindTooltip(localized(s, "title", lang)));
  }, [lang]);

  // tô sáng marker đang chọn và dời bản đồ
  useEffect(() => {
    const active = stops.find((s) => s.id === activeId);
    if (!active || !map.current) return;
    const isNearby = active.category === "nearby";
    Object.entries(markers.current).forEach(([id, m]) => {
      const s = stops.find((x) => x.id === id);
      const on = id === "__palace" ? !isNearby : id === activeId;
      m.setIcon(pin(id === "__palace" ? "🏛️" : s.icon, on));
      m.setZIndexOffset(on ? 1000 : 0);
    });
    const c = getCoords(active);
    map.current.flyTo([c.lat, c.lng], isNearby ? 16 : 17, { duration: 0.6 });
  }, [activeId]);

  return <div ref={el} className="map" role="region" aria-label={t(lang, "map")} />;
}
