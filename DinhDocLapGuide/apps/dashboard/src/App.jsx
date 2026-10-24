import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LANGUAGES,
  stops as seedStops,
  localized,
  estimateSeconds,
  speechLang,
  PALACE_MAP_POSITIONS
} from "../../../packages/shared/index.js";
import { supabase, configured } from "./supabase.js";

const WEB_URL =
  import.meta.env.VITE_WEB_URL || (import.meta.env.DEV ? "http://localhost:5173" : "/");
const LOCAL_STORAGE_KEY = "palaceguide_dashboard_places_v2";

// Ánh xạ bộ hình ảnh minh họa từ packages/shared/images/
const SHARED_IMAGES = {
  architecture: new URL("../../../packages/shared/images/architecture.svg", import.meta.url).href,
  bunker: new URL("../../../packages/shared/images/bunker.svg", import.meta.url).href,
  cabinet: new URL("../../../packages/shared/images/cabinet.svg", import.meta.url).href,
  credentials: new URL("../../../packages/shared/images/credentials.svg", import.meta.url).href,
  exhibition: new URL("../../../packages/shared/images/exhibition.svg", import.meta.url).href,
  family: new URL("../../../packages/shared/images/family.svg", import.meta.url).href,
  garden: new URL("../../../packages/shared/images/garden.svg", import.meta.url).href,
  gate: new URL("../../../packages/shared/images/gate.svg", import.meta.url).href,
  history: new URL("../../../packages/shared/images/history.svg", import.meta.url).href,
  office: new URL("../../../packages/shared/images/office.svg", import.meta.url).href,
  presidentRoom: new URL("../../../packages/shared/images/presidentRoom.svg", import.meta.url).href,
  reception: new URL("../../../packages/shared/images/reception.svg", import.meta.url).href,
  reunification: new URL("../../../packages/shared/images/reunification.svg", import.meta.url).href,
  rooftop: new URL("../../../packages/shared/images/rooftop.svg", import.meta.url).href,
  vehicles: new URL("../../../packages/shared/images/vehicles.svg", import.meta.url).href
};

const imageFor = (id) => SHARED_IMAGES[id] || null;
const blankLocalized = () => Object.fromEntries(LANGUAGES.map((l) => [l.code, ""]));
const clone = (v) => JSON.parse(JSON.stringify(v));

const buildInitialStops = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return seedStops.map((s, idx) => {
    const pos = PALACE_MAP_POSITIONS?.[s.id] || {};
    return {
      ...clone(s),
      order: s.order || idx + 1,
      published: true,
      status: "Hoạt động",
      image_url: null,
      audio_file_name: `${s.id}_audio_guide.mp3`,
      mapPin: { x: pos.x ?? 50, y: pos.y ?? 50 }
    };
  });
};

const createEmptyPoi = (nextOrder = 16) => ({
  id: `poi-${Date.now().toString().slice(-4)}`,
  icon: "🏛️",
  category: "palace",
  order: nextOrder,
  published: true,
  status: "Hoạt động",
  floor: {
    vi: "Tầng Trệt",
    en: "Ground floor",
    zh: "底层",
    ja: "地上階",
    ko: "지상층"
  },
  title: blankLocalized(),
  summary: blankLocalized(),
  text: blankLocalized(),
  image_url: null,
  audio_file_name: "",
  mapPin: { x: 50, y: 50 }
});

const INITIAL_LOGS = [
  {
    id: "log-1",
    icon: "fa-pen",
    badgeClass: "bg-[#f3e7cf] text-[#7b1f20]",
    title: "Cập nhật Audio Đa Ngôn Ngữ",
    desc: "Phòng Trình Quốc Thư (Khu tiếp tân & nghi lễ)",
    meta: "10 phút trước • bởi Admin"
  },
  {
    id: "log-2",
    icon: "fa-photo-film",
    badgeClass: "bg-[#e5f3eb] text-[#2f7657]",
    title: "Đồng bộ Kho Audio & Hình ảnh Minh họa",
    desc: "Khu vực Hầm Chỉ Huy & Phòng Khánh Tiết",
    meta: "45 phút trước • bởi KyThuat01"
  },
  {
    id: "log-3",
    icon: "fa-triangle-exclamation",
    badgeClass: "bg-[#fbf2db] text-[#98701c]",
    title: "Kiểm duyệt kịch bản thuyết minh",
    desc: "Rà soát bản dịch 5 ngôn ngữ VI · EN · ZH · JA · KO",
    meta: "2 giờ trước • bởi Biên tập viên"
  },
  {
    id: "log-4",
    icon: "fa-chart-line",
    badgeClass: "bg-[#f3e7cf] text-[#561212]",
    title: "Tổng hợp báo cáo lưu lượng ngày",
    desc: "Phòng Khánh Tiết dẫn đầu lượt nghe thuyết minh",
    meta: "4 giờ trước • bởi Ban Quản Lý"
  }
];

const HOURLY_PRESETS = {
  today: {
    label: "Hôm nay",
    labels: ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
    data: [120, 340, 680, 890, 450, 520, 810, 950, 620, 210]
  },
  week: {
    label: "7 ngày qua",
    labels: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"],
    data: [2850, 3120, 3640, 3980, 4420, 5890, 5410]
  },
  month: {
    label: "30 ngày",
    labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
    data: [17200, 21400, 24900, 27650]
  }
};

function getFloorText(item, lang = "vi") {
  if (!item?.floor) return "Tầng Trệt";
  if (typeof item.floor === "string") return item.floor || "Tầng Trệt";
  return item.floor[lang] || item.floor.vi || "Tầng Trệt";
}

function isStopActive(item) {
  if (item?.published === false || item?.status === "Bảo trì") return false;
  return Boolean(item?.title?.vi?.trim() && item?.text?.vi?.trim());
}

function countFilledLanguages(item) {
  return LANGUAGES.filter((l) => item?.title?.[l.code]?.trim() && item?.text?.[l.code]?.trim()).length;
}

export default function App() {
  // Chỉ giữ đúng 4 chức năng: 'dashboard' | 'poi' | 'media' | 'analytics'
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminLang, setAdminLang] = useState("vi");

  // Dữ liệu các điểm POI & Thống kê Supabase
  const [items, setItems] = useState(buildInitialStops);
  const [listenCount, setListenCount] = useState(4285);
  const [globalSearch, setGlobalSearch] = useState("");
  const [poiSearch, setPoiSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Kho Audio & Media
  const [mediaLang, setMediaLang] = useState("vi");
  const [mediaSearch, setMediaSearch] = useState("");
  const [speechRate, setSpeechRate] = useState(1.0);
  const [playingKey, setPlayingKey] = useState(null);

  // Biểu đồ & Nhật ký hoạt động
  const [chartRange, setChartRange] = useState("today");
  const [logs, setLogs] = useState(INITIAL_LOGS);

  // Modal Chỉnh sửa / Thêm mới POI
  const [poiModalOpen, setPoiModalOpen] = useState(false);
  const [editingPoi, setEditingPoi] = useState(null);
  const [modalLang, setModalLang] = useState("vi");
  const [busy, setBusy] = useState(false);

  // Phiên đăng nhập Supabase (Tùy chọn)
  const [session, setSession] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr] = useState("");

  // Toast thông báo
  const [toast, setToast] = useState({ visible: false, message: "" });
  const toastTimerRef = useRef(null);

  // Tham chiếu Canvas Chart.js
  const hourlyCanvasRef = useRef(null);
  const hourlyChartRef = useRef(null);
  const langCanvasRef = useRef(null);
  const langChartRef = useRef(null);
  const floorCanvasRef = useRef(null);
  const floorChartRef = useRef(null);

  const showToast = (message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const pushActivityLog = (title, desc, icon = "fa-pen", badgeClass = "bg-[#f3e7cf] text-[#7b1f20]") => {
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        icon,
        badgeClass,
        title,
        desc,
        meta: "Vừa xong • bởi Admin"
      },
      ...prev.slice(0, 9)
    ]);
  };

  // Lưu vào localStorage để giữ trạng thái khi reload
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  // Theo dõi phiên Supabase Auth & đồng bộ bảng stops / stop_translations / listen_events
  useEffect(() => {
    if (!configured || !supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data?.session || null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data?.subscription?.unsubscribe();
  }, []);

  const syncWithSupabase = async (silent = false) => {
    if (!configured || !supabase) {
      if (!silent) showToast("Đã làm mới dữ liệu!");
      return;
    }
    try {
      const [stopsRes, trRes, eventsRes] = await Promise.all([
        supabase.from("stops").select("*").order("sort_order"),
        supabase.from("stop_translations").select("*"),
        supabase.from("listen_events").select("stop_id,lang,completed").limit(5000)
      ]);

      if (!eventsRes.error && Array.isArray(eventsRes.data) && eventsRes.data.length > 0) {
        setListenCount(4285 + eventsRes.data.length);
      }

      if (!stopsRes.error && !trRes.error && Array.isArray(stopsRes.data) && stopsRes.data.length > 0) {
        const trMap = {};
        (trRes.data || []).forEach((r) => {
          trMap[`${r.stop_id}:${r.lang}`] = r;
        });

        const merged = stopsRes.data.map((s, idx) => {
          const seed = seedStops.find((x) => x.id === s.id) || {};
          const pos = PALACE_MAP_POSITIONS?.[s.id] || {};
          const title = { ...(seed.title || blankLocalized()) };
          const floor = { ...(seed.floor || blankLocalized()) };
          const summary = { ...(seed.summary || blankLocalized()) };
          const text = { ...(seed.text || blankLocalized()) };

          LANGUAGES.forEach((l) => {
            const row = trMap[`${s.id}:${l.code}`];
            if (row) {
              if (row.title) title[l.code] = row.title;
              if (row.floor) floor[l.code] = row.floor;
              if (row.summary) summary[l.code] = row.summary;
              if (row.body) text[l.code] = row.body;
            }
          });

          return {
            ...seed,
            id: s.id,
            icon: s.icon || seed.icon || "🏛️",
            category: s.category || seed.category || "palace",
            order: s.sort_order ?? seed.order ?? idx + 1,
            published: s.published !== false,
            status: s.published === false ? "Bảo trì" : "Hoạt động",
            title,
            floor,
            summary,
            text,
            image_url: s.image_url || null,
            audio_file_name: `${s.id}_audio_guide.mp3`,
            mapPin: { x: pos.x ?? 50, y: pos.y ?? 50 }
          };
        });

        setItems(merged);
        if (!silent) showToast(`Đã đồng bộ ${merged.length} điểm từ Supabase!`);
        return;
      }
      if (!silent) showToast("Đã làm mới dữ liệu!");
    } catch {
      if (!silent) showToast("Đã làm mới dữ liệu!");
    }
  };

  useEffect(() => {
    syncWithSupabase(true);
  }, []);

  // Dừng đọc khi đóng trang
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Khởi tạo Biểu đồ Lượt Nghe Theo Giờ ở tab Tổng quan (Dashboard)
  useEffect(() => {
    if (activeTab !== "dashboard") return undefined;
    const canvas = hourlyCanvasRef.current;
    if (!canvas || typeof window === "undefined" || !window.Chart) return undefined;

    if (hourlyChartRef.current) hourlyChartRef.current.destroy();

    const preset = HOURLY_PRESETS[chartRange] || HOURLY_PRESETS.today;
    hourlyChartRef.current = new window.Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: preset.labels,
        datasets: [
          {
            label: "Lượt nghe",
            data: preset.data,
            borderColor: "#7b1f20",
            backgroundColor: "rgba(123, 31, 32, 0.09)",
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: "#c9a24a",
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: "#efe6d5" } },
          x: { grid: { display: false } }
        }
      }
    });

    return () => {
      if (hourlyChartRef.current) {
        hourlyChartRef.current.destroy();
        hourlyChartRef.current = null;
      }
    };
  }, [activeTab, chartRange]);

  // Khởi tạo 2 Biểu đồ ở tab Báo cáo & Thống kê
  useEffect(() => {
    if (activeTab !== "analytics") return undefined;
    if (typeof window === "undefined" || !window.Chart) return undefined;

    if (langCanvasRef.current) {
      if (langChartRef.current) langChartRef.current.destroy();
      const langData = LANGUAGES.map((l) =>
        items.filter((x) => x.title?.[l.code]?.trim() && x.text?.[l.code]?.trim()).length
      );
      langChartRef.current = new window.Chart(langCanvasRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: ["🇻🇳 Tiếng Việt (38%)", "🇬🇧 English (42%)", "🇨🇳 中文 (9%)", "🇯🇵 日本語 (6%)", "🇰🇷 한국어 (5%)"],
          datasets: [
            {
              label: "Số điểm đã hoàn thiện thuyết minh",
              data: langData,
              backgroundColor: ["#7b1f20", "#c9a24a", "#2f7657", "#8d5b4c", "#561212"],
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: "#efe6d5" } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    if (floorCanvasRef.current) {
      if (floorChartRef.current) floorChartRef.current.destroy();
      const floorCounts = new Map();
      items.forEach((item) => {
        const fl = getFloorText(item, "vi");
        floorCounts.set(fl, (floorCounts.get(fl) || 0) + 1);
      });
      const entries = Array.from(floorCounts.entries());
      floorChartRef.current = new window.Chart(floorCanvasRef.current.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: entries.map((e) => e[0]),
          datasets: [
            {
              data: entries.map((e) => e[1]),
              backgroundColor: [
                "#7b1f20",
                "#c9a24a",
                "#2f7657",
                "#561212",
                "#a67c52",
                "#bf8d91",
                "#6d8c7a",
                "#d9b69b"
              ],
              borderColor: "#ffffff",
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "right", labels: { boxWidth: 12, font: { size: 11 } } }
          }
        }
      });
    }

    return () => {
      if (langChartRef.current) langChartRef.current.destroy();
      if (floorChartRef.current) floorChartRef.current.destroy();
    };
  }, [activeTab, items]);

  // Các số liệu tính toán tự động
  const activeCount = useMemo(() => items.filter(isStopActive).length, [items]);
  const maintenanceCount = items.length - activeCount;

  const totalTranslatedScripts = useMemo(
    () => items.reduce((sum, item) => sum + countFilledLanguages(item), 0),
    [items]
  );
  const maxScripts = Math.max(1, items.length * LANGUAGES.length);
  const coveragePercent = Math.round((totalTranslatedScripts / maxScripts) * 100);

  const totalMinutes = useMemo(() => {
    const secs = items.reduce(
      (sum, item) => sum + estimateSeconds(localized(item, "text", "vi") || "", "vi", 1),
      0
    );
    return Math.max(1, Math.round(secs / 60));
  }, [items]);

  const floorOptions = useMemo(() => {
    const set = new Set();
    items.forEach((x) => set.add(getFloorText(x, "vi")));
    return Array.from(set);
  }, [items]);

  const filteredPois = useMemo(() => {
    const q = (poiSearch || globalSearch).trim().toLowerCase();
    return items.filter((item) => {
      const floorVi = getFloorText(item, "vi");
      const active = isStopActive(item);
      const matchesFloor =
        floorFilter === "all" || floorVi.toLowerCase().includes(floorFilter.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "Hoạt động" && active) ||
        (statusFilter === "Bảo trì" && !active);
      const text = `${item.id} ${localized(item, "title", "vi")} ${localized(item, "title", "en")} ${floorVi} ${localized(item, "summary", "vi")}`.toLowerCase();
      return matchesFloor && matchesStatus && (!q || text.includes(q));
    });
  }, [items, poiSearch, globalSearch, floorFilter, statusFilter]);

  const filteredMedia = useMemo(() => {
    const q = (mediaSearch || globalSearch).trim().toLowerCase();
    return items.filter((item) => {
      const text = `${item.id} ${localized(item, "title", mediaLang)} ${localized(item, "title", "vi")} ${getFloorText(item, "vi")}`.toLowerCase();
      return !q || text.includes(q);
    });
  }, [items, mediaSearch, globalSearch, mediaLang]);

  const floorStatsRows = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const floorName = getFloorText(item, "vi");
      const row = map.get(floorName) || {
        floor: floorName,
        count: 0,
        active: 0,
        seconds: 0,
        names: []
      };
      row.count += 1;
      if (isStopActive(item)) row.active += 1;
      row.seconds += estimateSeconds(localized(item, "text", "vi") || "", "vi", 1);
      row.names.push(localized(item, "title", "vi") || item.id);
      map.set(floorName, row);
    });
    return Array.from(map.values());
  }, [items]);

  // Phát nghe thử thuyết minh trực tiếp bằng giọng đọc
  const playAudioSample = (item, langCode = adminLang) => {
    const poiTitle = localized(item, "title", "vi") || item.id;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      showToast("Đang phát bản nghe thử: " + poiTitle);
      return;
    }
    const key = `${item.id}-${langCode}`;
    if (playingKey === key) {
      window.speechSynthesis.cancel();
      setPlayingKey(null);
      showToast("Đã dừng bản nghe thử: " + poiTitle);
      return;
    }
    window.speechSynthesis.cancel();
    const body = localized(item, "text", langCode) || localized(item, "text", "vi");
    const u = new window.SpeechSynthesisUtterance(body);
    u.lang = speechLang(langCode);
    u.rate = speechRate;
    u.onend = () => setPlayingKey(null);
    u.onerror = () => setPlayingKey(null);
    setPlayingKey(key);
    window.speechSynthesis.speak(u);
    showToast(`Đang phát bản nghe thử (${langCode.toUpperCase()}): ${poiTitle}`);
  };

  // Mở Modal Chỉnh sửa / Thêm mới POI
  const openPoiModal = (item = null) => {
    if (item) {
      setEditingPoi({
        ...clone(item),
        status: isStopActive(item) ? "Hoạt động" : "Bảo trì Audio",
        mapPin: item.mapPin || { x: 50, y: 50 }
      });
    } else {
      setEditingPoi(createEmptyPoi(items.length + 1));
    }
    setModalLang("vi");
    setPoiModalOpen(true);
  };

  const closePoiModal = () => {
    setPoiModalOpen(false);
    setEditingPoi(null);
  };

  const updateEditingField = (field, value) => {
    setEditingPoi((prev) => ({ ...prev, [field]: value }));
  };

  const updateEditingTranslation = (field, value) => {
    setEditingPoi((prev) => ({
      ...prev,
      [field]: {
        ...(typeof prev[field] === "object" && prev[field] !== null ? prev[field] : blankLocalized()),
        [modalLang]: value
      }
    }));
  };

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(6, Math.min(94, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(6, Math.min(94, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setEditingPoi((prev) => ({ ...prev, mapPin: { x, y } }));
    showToast(`Đã gán vị trí POI trên sơ đồ 2D: X=${x}%, Y=${y}%`);
  };

  const handleUploadMediaFile = (file) => {
    if (!file) return;
    if (file.type?.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setEditingPoi((prev) => (prev ? { ...prev, image_url: reader.result } : prev));
          showToast(`Đã tải ảnh minh họa: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setEditingPoi((prev) => (prev ? { ...prev, audio_file_name: file.name } : prev));
      showToast(`Đã đính kèm tệp audio: ${file.name}`);
    }
  };

  const handleQuickCardImageUpload = (item, file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, image_url: reader.result } : x)));
        pushActivityLog("Cập nhật hình ảnh Kho Media", localized(item, "title", "vi"), "fa-image", "bg-[#e5f3eb] text-[#2f7657]");
        showToast(`Đã đổi ảnh minh họa cho "${localized(item, "title", "vi")}"!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const savePoiChanges = async (e) => {
    if (e) e.preventDefault();
    if (!editingPoi) return;
    if (!editingPoi.title?.vi?.trim() || !editingPoi.text?.vi?.trim()) {
      showToast("Vui lòng nhập Tên điểm và Nội dung thuyết minh Tiếng Việt!");
      return;
    }

    setBusy(true);
    const isPub = editingPoi.status !== "Bảo trì Audio" && editingPoi.status !== "Bảo trì";
    const normalizedPoi = {
      ...editingPoi,
      published: isPub,
      status: isPub ? "Hoạt động" : "Bảo trì"
    };

    try {
      if (configured && supabase && session) {
        await supabase.from("stops").upsert({
          id: normalizedPoi.id,
          icon: normalizedPoi.icon || "🏛️",
          sort_order: normalizedPoi.order || 1,
          published: isPub
        });
        const translationRows = LANGUAGES.map((l) => ({
          stop_id: normalizedPoi.id,
          lang: l.code,
          title: normalizedPoi.title?.[l.code] || "",
          floor: getFloorText(normalizedPoi, l.code),
          summary: normalizedPoi.summary?.[l.code] || "",
          body: normalizedPoi.text?.[l.code] || ""
        }));
        await supabase.from("stop_translations").upsert(translationRows);
      }
    } catch {
      /* fallback to local state */
    }

    const exists = items.some((x) => x.id === normalizedPoi.id);
    setItems((prev) => {
      const next = exists
        ? prev.map((x) => (x.id === normalizedPoi.id ? normalizedPoi : x))
        : [...prev, normalizedPoi];
      return next.sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    pushActivityLog(
      exists ? "Cập nhật Điểm Thuyết Minh (POI)" : "Thêm Điểm Thuyết Minh Mới",
      `${localized(normalizedPoi, "title", "vi")} (${getFloorText(normalizedPoi, "vi")})`
    );

    setBusy(false);
    closePoiModal();
    showToast("Đã lưu thay đổi POI thành công!");
  };

  const deletePoiItem = (id) => {
    const target = items.find((x) => x.id === id);
    if (!target) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
    pushActivityLog("Xóa Điểm Thuyết Minh", localized(target, "title", "vi"), "fa-trash-can");
    closePoiModal();
    showToast(`Đã xóa điểm "${localized(target, "title", "vi")}"!`);
  };

  const exportCsvStats = () => {
    const headers = ["Ma_POI", "Ten_Diem_VI", "Vi_Tri_Tang", "So_Ngon_Ngu", "Thoi_Luong_Giay", "Trang_Thai"];
    const rows = items.map((item, idx) => [
      `"POI-${String(item.order || idx + 1).padStart(3, "0")}"`,
      `"${(localized(item, "title", "vi") || "").replace(/"/g, '""')}"`,
      `"${getFloorText(item, "vi").replace(/"/g, '""')}"`,
      countFilledLanguages(item),
      estimateSeconds(localized(item, "text", "vi") || "", "vi", 1),
      `"${isStopActive(item) ? "Hoat dong" : "Bao tri"}"`
    ]);
    const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bao-cao-thong-ke-dinh-doc-lap.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Đã xuất báo cáo thống kê CSV!");
  };

  const exportJsonData = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dinh-doc-lap-poi-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Đã xuất tệp sao lưu JSON!");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthErr("");
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setAuthErr("Email hoặc mật khẩu không đúng.");
    } else {
      setSession(data.session);
      setAuthModalOpen(false);
      showToast("Đã đăng nhập tài khoản Quản trị!");
      syncWithSupabase(true);
    }
  };

  const hotStop = items.find((x) => x.id === "reception") || items[0];

  return (
    <div className="h-full font-sans text-[#2a1d1a] flex overflow-hidden bg-[#faf6ee]">
      {/* SIDEBAR NAVIGATION - Cấu trúc từ file HTML + Bảng màu từ file ZIP */}
      <aside
        id="sidebar"
        className="w-64 bg-[#2a1d1a] text-[#e4d9c6] flex flex-col transition-all duration-300 z-30 shrink-0 border-r border-[#3e2b27]"
      >
        {/* Brand / Logo Header */}
        <div className="h-20 flex items-center px-6 bg-[#561212] border-b border-[#7b1f20]/60">
          <div className="w-10 h-10 rounded-lg bg-[#c9a24a]/20 border border-[#c9a24a]/40 flex items-center justify-center text-[#c9a24a] font-bold text-xl mr-3 shadow-inner">
            <i className="fa-solid me-0 fa-landmark"></i>
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-wide uppercase leading-tight">
              DINH ĐỘC LẬP
            </h1>
            <p className="text-xs text-[#c9a24a] font-medium">Hệ Thống Thuyết Minh</p>
          </div>
        </div>

        {/* Navigation Links - CHỈ LÀM 4 CHỨC NĂNG THEO YÊU CẦU */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 text-[11px] font-semibold text-[#a89a90] uppercase tracking-wider mb-2">
            Chức năng chính
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            id="nav-dashboard"
            className={`nav-item w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-[#7b1f20] text-white shadow-sm"
                : "hover:bg-[#3b2824] text-[#e4d9c6] hover:text-white"
            }`}
          >
            <i
              className={`fa-solid fa-chart-pie w-6 text-lg ${
                activeTab === "dashboard" ? "text-[#c9a24a]" : "text-[#a89a90]"
              }`}
            ></i>
            <span className="ml-2">Tổng quan (Dashboard)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("poi")}
            id="nav-poi"
            className={`nav-item w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "poi"
                ? "bg-[#7b1f20] text-white shadow-sm"
                : "hover:bg-[#3b2824] text-[#e4d9c6] hover:text-white"
            }`}
          >
            <i
              className={`fa-solid fa-map-location-dot w-6 text-lg ${
                activeTab === "poi" ? "text-[#c9a24a]" : "text-[#a89a90]"
              }`}
            ></i>
            <span className="ml-2">Quản lý Điểm (POI)</span>
          </button>

          <div className="px-3 text-[11px] font-semibold text-[#a89a90] uppercase tracking-wider mt-6 mb-2">
            Dữ liệu &amp; Cấu hình
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("media")}
            id="nav-media"
            className={`nav-item w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "media"
                ? "bg-[#7b1f20] text-white shadow-sm"
                : "hover:bg-[#3b2824] text-[#e4d9c6] hover:text-white"
            }`}
          >
            <i
              className={`fa-solid fa-photo-film w-6 text-lg ${
                activeTab === "media" ? "text-[#c9a24a]" : "text-[#a89a90]"
              }`}
            ></i>
            <span className="ml-2">Audio &amp; Media Kho</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            id="nav-analytics"
            className={`nav-item w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "analytics"
                ? "bg-[#7b1f20] text-white shadow-sm"
                : "hover:bg-[#3b2824] text-[#e4d9c6] hover:text-white"
            }`}
          >
            <i
              className={`fa-solid fa-chart-line w-6 text-lg ${
                activeTab === "analytics" ? "text-[#c9a24a]" : "text-[#a89a90]"
              }`}
            ></i>
            <span className="ml-2">Báo cáo &amp; Thống kê</span>
          </button>

          {WEB_URL && (
            <div className="pt-6 px-3">
              <a
                href={WEB_URL}
                className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold border border-[#c9a24a]/40 text-[#c9a24a] hover:bg-[#c9a24a]/15 transition-colors"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i> Về trang web tham quan
              </a>
            </div>
          )}
        </nav>

        {/* System Version Footer */}
        <div className="p-4 border-t border-[#3e2b27] text-xs text-[#a89a90] flex items-center justify-between">
          <span>Phiên bản 2.4.0</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#2f7657]/30 text-[#75d0a6] border border-[#2f7657]/60">
            Online
          </span>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#faf6ee]">
        {/* HEADER BAR */}
        <header className="h-20 bg-white border-b border-[#e4d9c6] px-6 flex items-center justify-between shadow-sm z-20 shrink-0">
          {/* Search Bar */}
          <div className="flex items-center w-80">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#7d6e66]">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (activeTab === "dashboard" && e.target.value.trim()) {
                    setActiveTab("poi");
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-[#faf6ee] border border-[#e4d9c6] rounded-lg text-sm text-[#2a1d1a] placeholder-[#7d6e66] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7b1f20] focus:border-transparent transition-all"
                placeholder="Tìm kiếm phòng, điểm POI, media..."
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Admin Language Selector */}
            <div className="relative inline-block text-left">
              <select
                value={adminLang}
                onChange={(e) => {
                  setAdminLang(e.target.value);
                  setMediaLang(e.target.value);
                  showToast(`Đã chuyển ngôn ngữ quản trị sang ${e.target.value.toUpperCase()}`);
                }}
                className="bg-[#faf6ee] border border-[#e4d9c6] text-[#2a1d1a] text-xs rounded-lg font-medium px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7b1f20]"
              >
                <option value="vi">🇻🇳 Tiếng Việt (Admin)</option>
                <option value="en">🇬🇧 English (Admin)</option>
                <option value="zh">🇨🇳 中文 (Admin)</option>
                <option value="ja">🇯🇵 日本語 (Admin)</option>
                <option value="ko">🇰🇷 한국어 (Admin)</option>
              </select>
            </div>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => showToast(`Hệ thống có ${activeCount}/${items.length} điểm đang hoạt động.`)}
              className="relative p-2 text-[#7d6e66] hover:text-[#7b1f20] rounded-full hover:bg-[#faf6ee] transition-colors"
            >
              <i className="fa-regular fa-bell text-xl"></i>
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#7b1f20] rounded-full ring-2 ring-white"></span>
            </button>

            <div className="h-6 w-px bg-[#e4d9c6]"></div>

            {/* User Profile Dropdown */}
            <div
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center space-x-3 cursor-pointer group"
              title="Nhấn để quản lý phiên đăng nhập Supabase"
            >
              <div className="w-10 h-10 rounded-full bg-[#f3e7cf] border-2 border-[#c9a24a] flex items-center justify-center text-[#7b1f20] font-extrabold text-xs">
                BQL
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-[#2a1d1a] group-hover:text-[#7b1f20] transition-colors">
                  Ban Quản Lý Dinh
                </p>
                <p className="text-[11px] text-[#7d6e66] font-medium">
                  {session?.user?.email || "Super Administrator"}
                </p>
              </div>
              <i className="fa-solid fa-chevron-down text-xs text-[#7d6e66] group-hover:text-[#2a1d1a]"></i>
            </div>
          </div>
        </header>

        {/* DYNAMIC CONTENT VIEW CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6" id="main-content">
          {/* SECTION 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <section id="tab-dashboard" className="space-y-6">
              {/* Page Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#2a1d1a]">Tổng quan Hệ thống</h2>
                  <p className="text-sm text-[#7d6e66]">
                    Thống kê lưu lượng du khách &amp; hoạt động nghe thuyết minh hôm nay.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => syncWithSupabase(false)}
                    className="bg-white border border-[#e4d9c6] text-[#2a1d1a] hover:bg-[#f3e7cf]/40 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center"
                  >
                    <i className="fa-solid fa-arrows-rotate mr-2 text-[#7d6e66]"></i> Làm mới
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("poi");
                      openPoiModal(null);
                    }}
                    className="bg-[#7b1f20] hover:bg-[#561212] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center"
                  >
                    <i className="fa-solid fa-plus mr-2 text-[#c9a24a]"></i> Thêm POI mới
                  </button>
                </div>
              </div>

              {/* KPI Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1 */}
                <div className="bg-white p-5 rounded-xl border border-[#e4d9c6] shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#7d6e66]">
                        Tổng Lượt Nghe
                      </p>
                      <h3 className="text-3xl font-extrabold text-[#2a1d1a] mt-1">
                        {listenCount.toLocaleString("en-US")}
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-[#f3e7cf] text-[#7b1f20] flex items-center justify-center text-xl">
                      <i className="fa-solid fa-headphones"></i>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-medium text-[#2f7657]">
                    <i className="fa-solid fa-arrow-trend-up mr-1"></i>
                    <span>+18.4% so với hôm qua</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white p-5 rounded-xl border border-[#e4d9c6] shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#7d6e66]">
                        Điểm Thuyết Minh Active
                      </p>
                      <h3 className="text-3xl font-extrabold text-[#2a1d1a] mt-1">
                        {activeCount} / {items.length}
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-[#fbf2db] text-[#98701c] flex items-center justify-center text-xl">
                      <i className="fa-solid fa-location-dot"></i>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-medium text-[#7d6e66]">
                    <i className="fa-solid fa-circle-info mr-1 text-[#c9a24a]"></i>
                    <span>
                      {maintenanceCount > 0
                        ? `${maintenanceCount} điểm đang bảo trì audio`
                        : "100% điểm thuyết minh hoạt động tốt"}
                    </span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white p-5 rounded-xl border border-[#e4d9c6] shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#7d6e66]">
                        Ngôn Ngữ Phổ Biến
                      </p>
                      <h3 className="text-3xl font-extrabold text-[#2a1d1a] mt-1">Tiếng Anh</h3>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-[#faf6ee] border border-[#e4d9c6] text-[#7b1f20] flex items-center justify-center text-xl">
                      <i className="fa-solid fa-language"></i>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-medium text-[#7d6e66]">
                    <span>Chiếm 42% tổng lượng du khách</span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white p-5 rounded-xl border border-[#e4d9c6] shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#7d6e66]">
                        Điểm Dừng Hot Nhất
                      </p>
                      <h3 className="text-xl font-extrabold text-[#2a1d1a] mt-1 truncate max-w-[140px]">
                        {hotStop ? localized(hotStop, "title", "vi") : "Phòng Khánh Tiết"}
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-[#e5f3eb] text-[#2f7657] flex items-center justify-center text-xl">
                      <i className="fa-solid fa-fire"></i>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-medium text-[#2f7657]">
                    <i className="fa-solid fa-play mr-1"></i>
                    <span>1,120 lượt nghe thuyết minh</span>
                  </div>
                </div>
              </div>

              {/* Charts & Activity Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Column (2 cols) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#e4d9c6] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-[#2a1d1a] text-base">
                        Thống kê Lượt Nghe Theo Giờ
                      </h3>
                      <p className="text-xs text-[#7d6e66]">
                        Biểu đồ thể hiện lưu lượng truy cập audio guide trong ngày
                      </p>
                    </div>
                    <div className="flex space-x-1 bg-[#faf6ee] p-1 rounded-full border border-[#e4d9c6]">
                      {Object.entries(HOURLY_PRESETS).map(([key, item]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setChartRange(key)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                            chartRange === key
                              ? "bg-[#7b1f20] text-white"
                              : "text-[#7d6e66] hover:text-[#2a1d1a]"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-72">
                    <canvas ref={hourlyCanvasRef} id="hourlyChart"></canvas>
                  </div>
                </div>

                {/* Recent Activity / Logs (1 col) */}
                <div className="bg-white p-6 rounded-xl border border-[#e4d9c6] shadow-sm flex flex-col">
                  <h3 className="font-bold text-[#2a1d1a] text-base mb-4">Hoạt động Gần đây</h3>
                  <div className="space-y-4 flex-1 overflow-y-auto pr-1 max-h-72">
                    {logs.map((log, i) => (
                      <div
                        key={log.id}
                        className={`flex items-start space-x-3 text-xs ${
                          i < logs.length - 1 ? "border-b border-[#f1ede7] pb-3" : ""
                        }`}
                      >
                        <span className={`p-2 rounded-full mt-0.5 ${log.badgeClass}`}>
                          <i className={`fa-solid ${log.icon}`}></i>
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-[#2a1d1a]">{log.title}</p>
                          <p className="text-[#7d6e66]">{log.desc}</p>
                          <span className="text-[10px] text-[#a89a90] mt-1 block">{log.meta}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 2: QUẢN LÝ POI (POINTS OF INTEREST) */}
          {activeTab === "poi" && (
            <section id="tab-poi" className="space-y-6">
              {/* Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#2a1d1a]">
                    Quản lý Điểm Thuyết Minh (POI)
                  </h2>
                  <p className="text-sm text-[#7d6e66]">
                    Danh sách các phòng, hiện vật &amp; nội dung audio trong Dinh.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openPoiModal(null)}
                  className="bg-[#7b1f20] hover:bg-[#561212] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center justify-center"
                >
                  <i className="fa-solid fa-plus mr-2 text-[#c9a24a]"></i> Thêm Điểm Thuyết Minh
                </button>
              </div>

              {/* Filters & Search */}
              <div className="bg-white p-4 rounded-xl border border-[#e4d9c6] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Floor Filter */}
                  <select
                    id="filter-floor"
                    value={floorFilter}
                    onChange={(e) => setFloorFilter(e.target.value)}
                    className="bg-[#faf6ee] border border-[#e4d9c6] text-[#2a1d1a] text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7b1f20]"
                  >
                    <option value="all">Tất cả Tầng ({items.length})</option>
                    {floorOptions.map((fl) => (
                      <option key={fl} value={fl}>
                        {fl}
                      </option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    id="filter-status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#faf6ee] border border-[#e4d9c6] text-[#2a1d1a] text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7b1f20]"
                  >
                    <option value="all">Tất cả Trạng thái</option>
                    <option value="Hoạt động">Hoạt động ({activeCount})</option>
                    <option value="Bảo trì">Bảo trì Audio ({maintenanceCount})</option>
                  </select>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7d6e66]">
                    <i className="fa-solid fa-magnifying-glass text-xs"></i>
                  </span>
                  <input
                    type="text"
                    id="poi-search"
                    value={poiSearch}
                    onChange={(e) => setPoiSearch(e.target.value)}
                    placeholder="Lọc theo tên phòng..."
                    className="w-full pl-9 pr-3 py-2 bg-[#faf6ee] border border-[#e4d9c6] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7b1f20]"
                  />
                </div>
              </div>

              {/* POI Data Table */}
              <div className="bg-white rounded-xl border border-[#e4d9c6] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#faf6ee] border-b border-[#e4d9c6] text-[11px] font-bold uppercase tracking-wider text-[#7d6e66]">
                        <th className="py-3.5 px-4">Mã POI</th>
                        <th className="py-3.5 px-4">Tên Điểm Thuyết Minh</th>
                        <th className="py-3.5 px-4">Vị trí Tầng</th>
                        <th className="py-3.5 px-4">Ngôn ngữ Khả dụng</th>
                        <th className="py-3.5 px-4">Audio Trực tuyến</th>
                        <th className="py-3.5 px-4">Trạng thái</th>
                        <th className="py-3.5 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody id="poi-table-body" className="divide-y divide-[#f1ede7] text-sm">
                      {filteredPois.map((item, idx) => {
                        const poiCode = `POI-${String(item.order || idx + 1).padStart(3, "0")}`;
                        const imgSrc = item.image_url || imageFor(item.id);
                        const active = isStopActive(item);
                        const isPlaying = playingKey === `${item.id}-${adminLang}`;
                        return (
                          <tr key={item.id} className="hover:bg-[#faf6ee]/70 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-semibold text-xs text-[#7b1f20]">
                              {poiCode}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                {imgSrc ? (
                                  <img
                                    src={imgSrc}
                                    className="w-10 h-10 rounded-lg object-cover border border-[#e4d9c6] bg-[#faf6ee]"
                                    alt={localized(item, "title", "vi")}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-[#f3e7cf] border border-[#e4d9c6] flex items-center justify-center text-base">
                                    {item.icon || "🏛️"}
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-[#2a1d1a]">
                                    {localized(item, "title", adminLang) || localized(item, "title", "vi")}
                                  </p>
                                  <p className="text-xs text-[#7d6e66] max-w-xs truncate">
                                    {localized(item, "summary", adminLang) || localized(item, "summary", "vi")}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="bg-[#f3e7cf]/60 border border-[#e4d9c6] text-[#2a1d1a] px-2.5 py-1 rounded-md text-xs font-medium">
                                {getFloorText(item, adminLang)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex space-x-1 text-xs">
                                {LANGUAGES.map((l) => (
                                  <span
                                    key={l.code}
                                    title={l.label}
                                    className={
                                      item.title?.[l.code]?.trim() && item.text?.[l.code]?.trim()
                                        ? "opacity-100"
                                        : "opacity-30"
                                    }
                                  >
                                    {l.flag}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => playAudioSample(item, adminLang)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors inline-flex items-center ${
                                  isPlaying
                                    ? "bg-[#7b1f20] text-white"
                                    : "bg-[#faf6ee] border border-[#e4d9c6] hover:bg-[#7b1f20] hover:text-white text-[#2a1d1a]"
                                }`}
                              >
                                <i className={`fa-solid ${isPlaying ? "fa-stop" : "fa-play"} mr-1.5`}></i>
                                {isPlaying ? "Dừng" : "Nghe thử"}
                              </button>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  active
                                    ? "bg-[#e5f3eb] text-[#2f7657]"
                                    : "bg-[#fbf2db] text-[#98701c]"
                                }`}
                              >
                                ● {active ? "Hoạt động" : "Bảo trì"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => openPoiModal(item)}
                                className="p-1.5 text-[#7d6e66] hover:text-[#7b1f20] transition-colors"
                                title="Chỉnh sửa"
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button
                                type="button"
                                onClick={() => deletePoiItem(item.id)}
                                className="p-1.5 text-[#7d6e66] hover:text-[#a4161a] transition-colors"
                                title="Xóa điểm"
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3: AUDIO & MEDIA KHO */}
          {activeTab === "media" && (
            <section id="tab-media" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#2a1d1a]">
                    Audio &amp; Media Kho
                  </h2>
                  <p className="text-sm text-[#7d6e66]">
                    Quản lý tệp âm thanh thuyết minh 5 ngôn ngữ &amp; hình ảnh minh họa các điểm tham quan.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="bg-white border border-[#e4d9c6] text-[#2a1d1a] text-xs font-semibold rounded-lg px-3 py-2"
                  >
                    <option value={0.8}>Tốc độ đọc: 0.8×</option>
                    <option value={1.0}>Tốc độ đọc: 1.0×</option>
                    <option value={1.2}>Tốc độ đọc: 1.2×</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => openPoiModal(null)}
                    className="bg-[#7b1f20] hover:bg-[#561212] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center"
                  >
                    <i className="fa-solid fa-cloud-arrow-up mr-2 text-[#c9a24a]"></i> Tải Media mới
                  </button>
                </div>
              </div>

              {/* Media Toolbar */}
              <div className="bg-white p-4 rounded-xl border border-[#e4d9c6] shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setMediaLang(l.code)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                        mediaLang === l.code
                          ? "bg-[#7b1f20] text-white border-[#7b1f20]"
                          : "bg-[#faf6ee] text-[#2a1d1a] border-[#e4d9c6] hover:bg-[#f3e7cf]"
                      }`}
                    >
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7d6e66]">
                    <i className="fa-solid fa-magnifying-glass text-xs"></i>
                  </span>
                  <input
                    type="text"
                    value={mediaSearch}
                    onChange={(e) => setMediaSearch(e.target.value)}
                    placeholder="Tìm kiếm file audio, hình ảnh..."
                    className="w-full pl-9 pr-3 py-2 bg-[#faf6ee] border border-[#e4d9c6] rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7b1f20]"
                  />
                </div>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMedia.map((item) => {
                  const imgSrc = item.image_url || imageFor(item.id);
                  const scriptText = localized(item, "text", mediaLang) || "";
                  const durationSec = estimateSeconds(scriptText || " ", mediaLang, speechRate);
                  const isPlaying = playingKey === `${item.id}-${mediaLang}`;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-[#e4d9c6] shadow-sm overflow-hidden flex flex-col"
                    >
                      <div className="relative h-44 bg-[#faf6ee] border-b border-[#e4d9c6] overflow-hidden flex items-center justify-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={localized(item, "title", "vi")}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-5xl">{item.icon || "🏛️"}</span>
                        )}
                        <span className="absolute top-3 left-3 bg-[#2a1d1a]/85 text-[#faf6ee] text-[10px] font-bold px-2.5 py-1 rounded">
                          {getFloorText(item, "vi")}
                        </span>
                        <label className="absolute bottom-3 right-3 bg-white/95 hover:bg-[#7b1f20] hover:text-white text-[#2a1d1a] text-xs font-bold px-3 py-1.5 rounded-lg shadow cursor-pointer transition-colors">
                          <i className="fa-solid fa-camera mr-1"></i> Đổi ảnh
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleQuickCardImageUpload(item, e.target.files?.[0])}
                          />
                        </label>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-xs text-[#7d6e66] mb-1">
                            <span className="font-mono font-semibold text-[#7b1f20]">
                              {item.audio_file_name || `${item.id}.mp3`}
                            </span>
                            <span>⏱ ~{durationSec}s</span>
                          </div>
                          <h4 className="font-bold text-[#2a1d1a] text-base">
                            {item.icon} {localized(item, "title", mediaLang) || localized(item, "title", "vi")}
                          </h4>
                          <p className="text-xs text-[#7d6e66] line-clamp-2 mt-1">
                            {scriptText || "Chưa có kịch bản cho ngôn ngữ này."}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#f1ede7] flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => playAudioSample(item, mediaLang)}
                            className="flex-1 py-2 px-3 rounded-lg bg-[#7b1f20] hover:bg-[#561212] text-white text-xs font-bold flex items-center justify-center"
                          >
                            <i className={`fa-solid ${isPlaying ? "fa-stop" : "fa-volume-high"} mr-1.5 text-[#c9a24a]`}></i>
                            {isPlaying ? "Dừng phát" : `Nghe thử (${mediaLang.toUpperCase()})`}
                          </button>
                          <button
                            type="button"
                            onClick={() => openPoiModal(item)}
                            className="py-2 px-3 rounded-lg bg-[#faf6ee] border border-[#e4d9c6] text-[#2a1d1a] text-xs font-bold hover:border-[#7b1f20]"
                          >
                            Biên tập
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SECTION 4: BÁO CÁO & THỐNG KÊ */}
          {activeTab === "analytics" && (
            <section id="tab-analytics" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#2a1d1a]">
                    Báo cáo &amp; Thống kê Chi tiết
                  </h2>
                  <p className="text-sm text-[#7d6e66]">
                    Báo cáo chi tiết lượt nghe theo quốc tịch, độ phủ ngôn ngữ và phân bố điểm theo tầng.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={exportCsvStats}
                    className="bg-white border border-[#e4d9c6] hover:bg-[#f3e7cf]/40 text-[#2a1d1a] px-4 py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center"
                  >
                    <i className="fa-solid fa-file-csv mr-2 text-[#2f7657]"></i> Xuất CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportJsonData}
                    className="bg-[#7b1f20] hover:bg-[#561212] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center"
                  >
                    <i className="fa-solid fa-download mr-2 text-[#c9a24a]"></i> Xuất JSON
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-xl border border-[#e4d9c6] shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7d6e66]">
                    Tổng Điểm Tham Quan
                  </p>
                  <h3 className="text-3xl font-extrabold text-[#7b1f20] mt-1">{items.length}</h3>
                  <p className="text-xs text-[#7d6e66] mt-2">Khuôn viên &amp; các tầng Dinh</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#e4d9c6] shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7d6e66]">
                    Tỷ Lệ Nghe Hết Bài
                  </p>
                  <h3 className="text-3xl font-extrabold text-[#98701c] mt-1">86%</h3>
                  <p className="text-xs text-[#7d6e66] mt-2">Trung bình trong 30 ngày qua</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#e4d9c6] shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7d6e66]">
                    Độ Phủ Đa Ngôn Ngữ
                  </p>
                  <h3 className="text-3xl font-extrabold text-[#2f7657] mt-1">
                    {coveragePercent}%
                  </h3>
                  <p className="text-xs text-[#7d6e66] mt-2">
                    {totalTranslatedScripts}/{maxScripts} bản thuyết minh
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#e4d9c6] shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7d6e66]">
                    Tổng Thời Lượng Audio
                  </p>
                  <h3 className="text-3xl font-extrabold text-[#2a1d1a] mt-1">
                    ~{totalMinutes} phút
                  </h3>
                  <p className="text-xs text-[#7d6e66] mt-2">Tính theo tốc độ đọc 1.0×</p>
                </div>
              </div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#e4d9c6] shadow-sm">
                  <h3 className="font-bold text-[#2a1d1a] text-base mb-1">
                    Báo Cáo Chi Tiết Theo Ngôn Ngữ &amp; Quốc Tịch
                  </h3>
                  <p className="text-xs text-[#7d6e66] mb-4">
                    Số điểm hoàn thiện thuyết minh và tỷ trọng ngôn ngữ sử dụng
                  </p>
                  <div className="h-64">
                    <canvas ref={langCanvasRef}></canvas>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#e4d9c6] shadow-sm">
                  <h3 className="font-bold text-[#2a1d1a] text-base mb-1">
                    Phân Bố Điểm Thuyết Minh Theo Tầng / Khu Vực
                  </h3>
                  <p className="text-xs text-[#7d6e66] mb-4">
                    Cơ cấu các điểm tham quan tại khuôn viên, tầng hầm và các lầu
                  </p>
                  <div className="h-64">
                    <canvas ref={floorCanvasRef}></canvas>
                  </div>
                </div>
              </div>

              {/* Floor Breakdown Table */}
              <div className="bg-white rounded-xl border border-[#e4d9c6] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#e4d9c6]">
                  <h3 className="font-bold text-[#2a1d1a] text-base">
                    Bảng Thống Kê Chi Tiết Theo Tầng &amp; Khu Vực
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#faf6ee] border-b border-[#e4d9c6] text-[11px] font-bold uppercase tracking-wider text-[#7d6e66]">
                        <th className="py-3.5 px-4">Vị trí Tầng / Khu vực</th>
                        <th className="py-3.5 px-4">Số lượng POI</th>
                        <th className="py-3.5 px-4">Các điểm thuyết minh</th>
                        <th className="py-3.5 px-4">Thời lượng đọc</th>
                        <th className="py-3.5 px-4">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1ede7] text-sm">
                      {floorStatsRows.map((row) => (
                        <tr key={row.floor} className="hover:bg-[#faf6ee]/70">
                          <td className="py-3.5 px-4 font-bold text-[#2a1d1a]">{row.floor}</td>
                          <td className="py-3.5 px-4 font-extrabold text-[#7b1f20]">
                            {row.count} điểm
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#7d6e66] max-w-md truncate">
                            {row.names.join(", ")}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-[#2a1d1a]">
                            ~{Math.max(1, Math.round(row.seconds / 60))} phút ({row.seconds}s)
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e5f3eb] text-[#2f7657]">
                              {row.active}/{row.count} Hoạt động
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* MODAL EDIT / CREATE POI (Cấu trúc HTML mẫu + Màu sắc file ZIP) */}
      {poiModalOpen && editingPoi && (
        <div
          id="poi-modal"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePoiModal();
          }}
          className="fixed inset-0 bg-[#2a1d1a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <form
            onSubmit={savePoiChanges}
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-[#e4d9c6] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="bg-[#561212] px-6 py-4 flex items-center justify-between border-b border-[#7b1f20]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#c9a24a]/20 border border-[#c9a24a]/40 flex items-center justify-center text-[#c9a24a]">
                  <i className="fa-solid fa-pen-to-square"></i>
                </div>
                <h3 id="modal-title" className="font-bold text-white text-lg">
                  {items.some((x) => x.id === editingPoi.id)
                    ? `Chỉnh Sửa: ${localized(editingPoi, "title", "vi") || editingPoi.id}`
                    : "Thêm Điểm Thuyết Minh Mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePoiModal}
                className="text-[#e4d9c6] hover:text-white p-1"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Multilingual Tabs Header */}
              <div>
                <label className="block text-xs font-bold text-[#7d6e66] uppercase tracking-wider mb-2">
                  Soạn Thảo Ngôn Ngữ Thuyết Minh
                </label>
                <div className="flex flex-wrap space-x-2 border-b border-[#e4d9c6]">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setModalLang(l.code)}
                      className={`px-4 py-2 text-sm flex items-center border-b-2 ${
                        modalLang === l.code
                          ? "font-bold border-[#7b1f20] text-[#7b1f20]"
                          : "font-medium border-transparent text-[#7d6e66] hover:text-[#2a1d1a]"
                      }`}
                    >
                      <span className="mr-2">{l.flag}</span> {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Form Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2a1d1a] uppercase mb-1">
                      Tên Điểm Thuyết Minh ({LANGUAGES.find((l) => l.code === modalLang)?.label})
                    </label>
                    <input
                      type="text"
                      id="modal-input-name"
                      value={editingPoi.title?.[modalLang] || ""}
                      onChange={(e) => updateEditingTranslation("title", e.target.value)}
                      className="w-full bg-[#faf6ee] border border-[#e4d9c6] rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#7b1f20]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2a1d1a] uppercase mb-1">
                        Vị Trí Tầng
                      </label>
                      <input
                        type="text"
                        value={
                          typeof editingPoi.floor === "object"
                            ? editingPoi.floor?.[modalLang] || ""
                            : editingPoi.floor || ""
                        }
                        onChange={(e) => updateEditingTranslation("floor", e.target.value)}
                        className="w-full bg-[#faf6ee] border border-[#e4d9c6] rounded-lg p-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2a1d1a] uppercase mb-1">
                        Trạng thái
                      </label>
                      <select
                        value={editingPoi.status || "Hoạt động"}
                        onChange={(e) => updateEditingField("status", e.target.value)}
                        className="w-full bg-[#faf6ee] border border-[#e4d9c6] rounded-lg p-2.5 text-sm"
                      >
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Bảo trì Audio">Bảo trì Audio</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2a1d1a] uppercase mb-1">
                      Nội dung Thuyết minh Văn bản (Script)
                    </label>
                    <textarea
                      rows="5"
                      value={editingPoi.text?.[modalLang] || ""}
                      onChange={(e) => updateEditingTranslation("text", e.target.value)}
                      className="w-full bg-[#faf6ee] border border-[#e4d9c6] rounded-lg p-2.5 text-sm text-[#2a1d1a] focus:ring-2 focus:ring-[#7b1f20]"
                    ></textarea>
                  </div>
                </div>

                {/* Right Form Column: Media & Interactive Map Coordinate Picker */}
                <div className="space-y-4">
                  {/* Upload Audio / Image Section */}
                  <div>
                    <label className="block text-xs font-bold text-[#2a1d1a] uppercase mb-1">
                      Tệp Audio Thuyết Minh (.MP3) &amp; Hình Ảnh
                    </label>
                    <label className="border-2 border-dashed border-[#e4d9c6] bg-[#faf6ee] rounded-lg p-4 text-center hover:bg-white transition-colors cursor-pointer block">
                      <i className="fa-solid fa-cloud-arrow-up text-2xl text-[#7b1f20] mb-1"></i>
                      <p className="text-xs font-semibold text-[#2a1d1a]">
                        Kéo thả file MP3/Ảnh hoặc <span className="text-[#7b1f20] underline">Tải lên</span>
                      </p>
                      <p className="text-[10px] text-[#7d6e66]">
                        Dung lượng tối đa 15MB (Khuyến nghị 320kbps)
                      </p>
                      <input
                        type="file"
                        accept="audio/*,image/*"
                        className="hidden"
                        onChange={(e) => handleUploadMediaFile(e.target.files?.[0])}
                      />
                    </label>
                  </div>

                  {/* Map Coordinate Picker View */}
                  <div>
                    <label className="block text-xs font-bold text-[#2a1d1a] uppercase mb-1">
                      Định Vị Tọa Độ Trên Sơ Đồ 2D (X: {editingPoi.mapPin?.x ?? 50}%, Y: {editingPoi.mapPin?.y ?? 50}%)
                    </label>
                    <div
                      onClick={handleMapClick}
                      className="relative w-full h-44 bg-[#2a1d1a] rounded-lg overflow-hidden border border-[#e4d9c6] group cursor-crosshair"
                    >
                      <svg viewBox="0 0 400 200" className="w-full h-full opacity-45">
                        <rect width="400" height="200" fill="#2e4736" />
                        <rect x="30" y="20" width="340" height="160" rx="8" fill="#4f7754" stroke="#c9a24a" strokeWidth="2" />
                        <rect x="110" y="45" width="180" height="95" rx="4" fill="#faf6ee" stroke="#7b1f20" strokeWidth="3" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xs text-[#faf6ee] font-mono bg-[#2a1d1a]/80 px-2 py-1 rounded">
                          Click sơ đồ để gán vị trí POI
                        </span>
                      </div>
                      {/* Interactive Pin Point */}
                      <div
                        style={{
                          left: `${editingPoi.mapPin?.x ?? 50}%`,
                          top: `${editingPoi.mapPin?.y ?? 50}%`
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      >
                        <span className="w-4 h-4 bg-[#c9a24a] rounded-full block border-2 border-white shadow-lg marker-pulse"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#faf6ee] px-6 py-4 flex items-center justify-end space-x-3 border-t border-[#e4d9c6]">
              <button
                type="button"
                onClick={closePoiModal}
                className="px-4 py-2 border border-[#e4d9c6] bg-white rounded-lg text-sm font-semibold text-[#2a1d1a] hover:bg-[#f3e7cf]/40"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2 bg-[#7b1f20] hover:bg-[#561212] text-white rounded-lg text-sm font-bold shadow-sm"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL ĐĂNG NHẬP SUPABASE (KHI BẤM VÀO AVATAR ADMIN) */}
      {authModalOpen && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAuthModalOpen(false);
          }}
          className="fixed inset-0 bg-[#2a1d1a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#e4d9c6] overflow-hidden">
            <div className="bg-[#561212] px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Tài khoản Quản trị Dinh Độc Lập</h3>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-[#e4d9c6] hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6">
              {session ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#2a1d1a]">
                    Đang đăng nhập: <b>{session.user?.email}</b>
                  </p>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(false)}
                      className="px-4 py-2 border border-[#e4d9c6] rounded-lg text-sm font-semibold"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setSession(null);
                        setAuthModalOpen(false);
                        showToast("Đã đăng xuất!");
                      }}
                      className="px-4 py-2 bg-[#7b1f20] text-white rounded-lg text-sm font-bold"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#faf6ee] border border-[#e4d9c6] rounded-lg p-2.5 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Mật khẩu</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#faf6ee] border border-[#e4d9c6] rounded-lg p-2.5 text-sm"
                      required
                    />
                  </div>
                  {authErr && <p className="text-xs text-[#a4161a] font-semibold">{authErr}</p>}
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setAuthModalOpen(false)}
                      className="px-4 py-2 border border-[#e4d9c6] rounded-lg text-sm font-semibold"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="px-4 py-2 bg-[#7b1f20] text-white rounded-lg text-sm font-bold"
                    >
                      {busy ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION CONTAINER */}
      <div
        id="toast"
        className={`fixed bottom-6 right-6 bg-[#2a1d1a] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 z-50 ${
          toast.visible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        <i className="fa-solid fa-circle-check text-[#c9a24a] text-lg"></i>
        <span id="toast-message" className="text-sm font-medium">
          {toast.message}
        </span>
      </div>
    </div>
  );
}
