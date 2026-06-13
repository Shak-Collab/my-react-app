import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const MOCK_STREAMS = [
  { id: 1, title: "Walking through Shibuya at night", category: "Walking", location: "Tokyo, Japan", country: "🇯🇵", viewers: 3241, color: "#FF3B5C", emoji: "🚶", lat: 35.68, lon: 139.69 },
  { id: 2, title: "Live from Carnival — Rio streets", category: "Events", location: "Rio de Janeiro, Brazil", country: "🇧🇷", viewers: 8702, color: "#6C63FF", emoji: "🎉", lat: -22.9, lon: -43.17 },
  { id: 3, title: "Sunset hike in the Alps", category: "Nature", location: "Zermatt, Switzerland", country: "🇨🇭", viewers: 1540, color: "#00C9A7", emoji: "🌿", lat: 46.0, lon: 7.75 },
  { id: 4, title: "Jazz session in New Orleans", category: "Music", location: "New Orleans, USA", country: "🇺🇸", viewers: 2890, color: "#FFB347", emoji: "🎵", lat: 29.95, lon: -90.07 },
  { id: 5, title: "Morning market in Marrakech", category: "City Life", location: "Marrakech, Morocco", country: "🇲🇦", viewers: 977, color: "#FF6B9D", emoji: "🏙️", lat: 31.63, lon: -7.99 },
  { id: 6, title: "Formula E race — live pit lane", category: "Sports", location: "Monaco", country: "🇲🇨", viewers: 12430, color: "#4ECDC4", emoji: "⚽", lat: 43.74, lon: 7.43 },
  { id: 7, title: "Cherry blossom walk — Kyoto", category: "Travel", location: "Kyoto, Japan", country: "🇯🇵", viewers: 5612, color: "#FF3B5C", emoji: "🌸", lat: 35.01, lon: 135.77 },
  { id: 8, title: "Street food tour — Bangkok", category: "Travel", location: "Bangkok, Thailand", country: "🇹🇭", viewers: 4201, color: "#A78BFA", emoji: "🍜", lat: 13.75, lon: 100.5 },
];

const CATEGORIES = ["All", "Travel", "Walking", "Nature", "Music", "Sports", "Events", "City Life"];
const STREAM_CATEGORIES = ["Walking", "Travel", "Nature", "Music", "Sports", "Events", "City Life", "Gaming", "Food", "Talk"];
const CHAT_MESSAGES = [
  { user: "alex_w", text: "this is incredible!" },
  { user: "sofia_m", text: "where is this place? 😍" },
  { user: "james_k", text: "I want to be there right now" },
  { user: "yuki_t", text: "beautiful 🌸" },
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --void: #F5F5F7;
  --surface: #FFFFFF;
  --card: #F0F0F5;
  --card2: #EAEAF0;
  --border: #DCDCE8;
  --violet: #E00707;
  --live-red: #CC0000;
  --text: #111122;
  --sub: #666688;
}
body { background: var(--void); color: var(--text); font-family: 'Inter', sans-serif; overflow: hidden; height: 100vh; }
.app { display: flex; height: 100vh; width: 100vw; overflow: hidden; }
.sidebar { width: 72px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; padding: 20px 0; gap: 4px; flex-shrink: 0; z-index: 10; }
.sidebar-logo { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: var(--violet); margin-bottom: 20px; }
.nav-btn { width: 52px; border-radius: 12px; border: none; background: transparent; color: var(--sub); font-size: 20px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.15s ease; padding: 8px 4px 6px; gap: 3px; }
.nav-btn:hover { background: var(--card2); color: var(--text); }
.nav-btn.active { background: rgba(220,0,0,0.08); color: var(--violet); }
.nav-btn-label { font-size: 9px; font-weight: 600; letter-spacing: 0.03em; color: inherit; line-height: 1; }
.nav-btn.go-live { color: var(--live-red); margin-top: 8px; }
.nav-btn.go-live:hover { background: rgba(204,0,0,0.08); }
.go-live-dot { width: 22px; height: 22px; background: var(--live-red); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(204,0,0,0.35); }
.nav-spacer { flex: 1; }
.main { flex: 1; display: flex; overflow: hidden; background: var(--void); }
.home { flex: 1; display: flex; flex-direction: column; overflow: hidden; height: 100%; }
.home-header { padding: 20px 28px 0; display: flex; align-items: center; justify-content: space-between; }
.home-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: var(--text); }
.home-title span { color: var(--violet); }
.categories { display: flex; gap: 8px; padding: 16px 28px 0; overflow-x: auto; scrollbar-width: none; flex-shrink: 0; }
.categories::-webkit-scrollbar { display: none; }
.cat-pill { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); color: var(--sub); font-size: 13px; cursor: pointer; white-space: nowrap; }
.cat-pill.active { background: var(--live-red); border-color: var(--live-red); color: white; }
.stream-scroll { flex: 1; overflow-y: auto; padding: 16px 28px 28px; }
.section-label { font-size: 11px; font-weight: 600; color: var(--sub); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
.stream-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stream-card { border-radius: 16px; overflow: hidden; background: var(--surface); cursor: pointer; border: 1px solid var(--border); position: relative; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
.stream-card:hover { transform: translateY(-2px); border-color: var(--violet); box-shadow: 0 4px 16px rgba(220,0,0,0.1); }
.stream-thumb { width: 100%; height: 148px; display: flex; align-items: center; justify-content: center; font-size: 42px; position: relative; }
.live-badge { position: absolute; top: 10px; left: 10px; background: var(--live-red); color: white; font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 4px; display: flex; align-items: center; gap: 4px; }
.live-dot { width: 6px; height: 6px; background: white; border-radius: 50%; animation: blink 1s infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
.viewer-count { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.55); color: white; font-size: 11px; padding: 3px 8px; border-radius: 20px; }
.stream-info { padding: 12px; background: var(--surface); }
.stream-title { font-size: 13px; font-weight: 600; line-height: 1.4; margin-bottom: 5px; color: var(--text); }
.stream-location { font-size: 12px; color: var(--sub); }

/* MAP */
.map-screen { flex: 1; position: relative; overflow: hidden; background: var(--void); display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
.globe-canvas { display: block; border-radius: 50%; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
.globe-tooltip { position: absolute; pointer-events: none; z-index: 20; background: rgba(255,255,255,0.97); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; min-width: 190px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.globe-pills { display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; padding: 10px 20px 0; max-width: 700px; }
.globe-pill { background: var(--surface); border-radius: 20px; padding: 5px 12px; color: var(--text); font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; border: 1px solid var(--border); }
.globe-pill:hover { background: var(--card2); }
.globe-stream-count { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 7px 14px; font-size: 13px; color: var(--sub); position: absolute; top: 18px; right: 22px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.globe-stream-count span { color: var(--violet); font-weight: 700; }

/* VIEWER */
.viewer-screen { flex: 1; background: #000; display: flex; position: relative; overflow: hidden; height: 100%; }
.viewer-video { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 80px; background: radial-gradient(ellipse at center, #1a1a2e 0%, #050512 100%); position: relative; }
.viewer-video-label { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); font-size: 13px; color: rgba(255,255,255,0.25); letter-spacing: 0.05em; }
.viewer-top { position: absolute; top: 0; left: 0; right: 320px; padding: 20px 24px; background: linear-gradient(to bottom, rgba(5,5,18,0.8) 0%, transparent 100%); display: flex; align-items: flex-start; justify-content: space-between; }
.viewer-back { width: 36px; height: 36px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.viewer-title { font-size: 16px; font-weight: 600; color: white; }
.viewer-viewers { background: rgba(0,0,0,0.5); border-radius: 20px; padding: 5px 12px; font-size: 13px; color: white; }
.viewer-bottom { position: absolute; bottom: 0; left: 0; right: 320px; padding: 24px; background: linear-gradient(to top, rgba(5,5,18,0.9) 0%, transparent 100%); display: flex; justify-content: space-between; align-items: flex-end; }
.reaction-btn { width: 44px; height: 44px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.floating-hearts { position: absolute; bottom: 80px; right: 340px; pointer-events: none; }
.heart { position: absolute; font-size: 22px; animation: float-heart 1.2s ease-out forwards; }
@keyframes float-heart { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-120px) scale(0.5); } }
.chat-panel { width: 320px; background: var(--surface); border-left: 1px solid var(--border); display: flex; flex-direction: column; }
.chat-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.chat-title { font-size: 14px; font-weight: 600; color: var(--text); }
.chat-messages { flex: 1; overflow-y: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.chat-msg { display: flex; flex-direction: column; }
.chat-username { font-size: 11px; font-weight: 600; color: var(--violet); margin-bottom: 2px; }
.chat-text { font-size: 13px; color: var(--text); }
.chat-input-area { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
.chat-input { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; color: var(--text); outline: none; font-size: 13px; }
.chat-send { width: 36px; height: 36px; background: var(--live-red); border: none; border-radius: 10px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }

/* GO LIVE */
.golive-screen { flex: 1; display: flex; height: 100%; overflow: hidden; }
.golive-preview { flex: 1; background: #000; position: relative; display: flex; align-items: center; justify-content: center; }
.golive-video { width: 100%; height: 100%; object-fit: cover; }
.golive-no-cam { display: flex; flex-direction: column; align-items: center; gap: 12px; color: rgba(255,255,255,0.5); font-size: 14px; }
.golive-no-cam-icon { font-size: 48px; }
.golive-overlay-top { position: absolute; top: 0; left: 0; right: 0; padding: 20px 24px; background: linear-gradient(to bottom, rgba(5,5,18,0.9), transparent); display: flex; justify-content: space-between; align-items: center; }
.golive-overlay-bottom { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 24px; background: linear-gradient(to top, rgba(5,5,18,0.9), transparent); display: flex; justify-content: center; gap: 16px; }
.golive-ctrl-btn { width: 52px; height: 52px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.5); color: white; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.golive-ctrl-btn:hover { background: rgba(255,255,255,0.1); }
.golive-ctrl-btn.off { background: rgba(220,50,50,0.6); border-color: rgba(220,50,50,0.8); }
.golive-panel { width: 340px; background: var(--surface); border-left: 1px solid var(--border); display: flex; flex-direction: column; padding: 24px; gap: 20px; overflow-y: auto; }
.golive-panel-title { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: var(--text); }
.golive-label { font-size: 12px; color: var(--sub); margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
.golive-input { width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; color: var(--text); outline: none; font-size: 14px; font-family: 'Inter', sans-serif; }
.golive-input:focus { border-color: var(--violet); }
.golive-select { width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; color: var(--text); outline: none; font-size: 14px; font-family: 'Inter', sans-serif; cursor: pointer; }
.golive-start-btn { width: 100%; padding: 14px; background: var(--live-red); border: none; border-radius: 12px; color: white; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Space Grotesk', sans-serif; box-shadow: 0 4px 20px rgba(204,0,0,0.3); transition: opacity 0.15s; }
.golive-start-btn:hover { opacity: 0.9; }
.golive-start-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.golive-stop-btn { width: 100%; padding: 14px; background: rgba(220,50,50,0.9); border: none; border-radius: 12px; color: white; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: opacity 0.15s; }
.golive-stop-btn:hover { opacity: 0.9; }
.golive-live-stats { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; justify-content: space-around; }
.golive-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.golive-stat-num { font-size: 22px; font-weight: 700; color: var(--text); font-family: 'Space Grotesk', sans-serif; }
.golive-stat-label { font-size: 11px; color: var(--sub); }
.golive-live-badge { background: #CC0000; color: white; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; display: flex; align-items: center; gap: 6px; }
.screen-enter { animation: screen-in 0.2s ease-out; }
@keyframes screen-in { from { opacity: 0; transform: scale(0.99); } to { opacity: 1; transform: scale(1); } }

/* REGISTRATION */
.auth-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 100; display: flex; align-items: center; justify-content: center; animation: fade-in 0.2s ease; }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.auth-modal { background: var(--surface); border-radius: 20px; padding: 36px 32px; width: 380px; max-width: 90vw; border: 1px solid var(--border); box-shadow: 0 20px 60px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 18px; }
.auth-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: var(--text); }
.auth-subtitle { font-size: 13px; color: var(--sub); margin-top: -10px; }
.auth-tabs { display: flex; background: var(--card); border-radius: 10px; padding: 3px; gap: 3px; }
.auth-tab { flex: 1; padding: 8px; border: none; background: transparent; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; color: var(--sub); transition: all 0.15s; }
.auth-tab.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.auth-field { display: flex; flex-direction: column; gap: 6px; }
.auth-field label { font-size: 12px; font-weight: 600; color: var(--sub); text-transform: uppercase; letter-spacing: 0.06em; }
.auth-field input { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; color: var(--text); outline: none; font-size: 14px; font-family: 'Inter', sans-serif; width: 100%; }
.auth-field input:focus { border-color: var(--violet); }
.auth-submit { width: 100%; padding: 13px; background: var(--live-red); border: none; border-radius: 12px; color: white; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Space Grotesk', sans-serif; box-shadow: 0 4px 20px rgba(204,0,0,0.25); transition: opacity 0.15s; }
.auth-submit:hover { opacity: 0.9; }
.auth-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; background: var(--card); border: 1px solid var(--border); border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--sub); font-size: 16px; }
.auth-modal-wrap { position: relative; }
`;

function StreamCard({ stream, onClick }) {
  return (
    <div className="stream-card" onClick={() => onClick(stream)}>
      <div className="stream-thumb" style={{ background: `radial-gradient(ellipse at center, ${stream.color}18, #F0F0F5)` }}>
        <span>{stream.emoji}</span>
        <div className="live-badge"><div className="live-dot" />LIVE</div>
        <div className="viewer-count">👁 {stream.viewers.toLocaleString()}</div>
      </div>
      <div className="stream-info">
        <div className="stream-title">{stream.title}</div>
        <div className="stream-location">{stream.country} {stream.location}</div>
      </div>
    </div>
  );
}

function HomeScreen({ onStreamClick }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered = activeCategory === "All" ? MOCK_STREAMS : MOCK_STREAMS.filter(s => s.category === activeCategory);
  return (
    <div className="home screen-enter">
      <div className="home-header"><div className="home-title"><span style={{filter: "grayscale(1) sepia(1) saturate(5) hue-rotate(300deg)"}}>🌐</span> <span>Momentra</span></div></div>
      <div className="categories">
        {CATEGORIES.map(c => (
          <button key={c} className={`cat-pill ${activeCategory === c ? "active" : ""}`} onClick={() => setActiveCategory(c)}>{c}</button>
        ))}
      </div>
      <div className="stream-scroll">
        <div style={{ marginBottom: 16 }}>
          <div className="section-label">🔥 Trending Now</div>
          <div className="stream-grid">{MOCK_STREAMS.slice(0, 3).map(s => <StreamCard key={s.id} stream={s} onClick={onStreamClick} />)}</div>
        </div>
        <div>
          <div className="section-label">All Live Streams</div>
          <div className="stream-grid">{filtered.map(s => <StreamCard key={s.id} stream={s} onClick={onStreamClick} />)}</div>
        </div>
      </div>
    </div>
  );
}

function MapScreen({ onStreamClick }) {
  const canvasRef = useRef(null);
  const st = useRef({ rotation: [20, -20], dragging: false, autoRotate: true, hoveredStream: null, lastX: 0, lastY: 0 });
  const [tooltip, setTooltip] = useState(null);
  const proj = useRef(null);
  const pathFn = useRef(null);
  const land = useRef(null);
  const animId = useRef(null);

  function rotateToStream(s) {
    st.current.autoRotate = false;
    const target = [-s.lon, -s.lat];
    const start = [...st.current.rotation];
    const t0 = performance.now();
    function tween(t) {
      const p = Math.min((t - t0) / 700, 1);
      const e = 1 - Math.pow(1 - p, 3);
      st.current.rotation[0] = start[0] + (target[0] - start[0]) * e;
      st.current.rotation[1] = start[1] + (target[1] - start[1]) * e;
      if (p < 1) requestAnimationFrame(tween);
      else setTimeout(() => { st.current.autoRotate = true; }, 1500);
    }
    requestAnimationFrame(tween);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = 500, H = 500;
    const R = 220;
    const s = st.current;

    async function init() {
      const world = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(r => r.json());
      land.current = topojson.feature(world, world.objects.land);
      proj.current = d3.geoOrthographic().scale(R).translate([W / 2, H / 2]).clipAngle(90).rotate(s.rotation);
      pathFn.current = d3.geoPath(proj.current, ctx);
      loop();
    }

    function draw() {
      if (!proj.current || !pathFn.current || !land.current) return;
      proj.current.rotate(s.rotation);
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath(); pathFn.current({ type: "Sphere" });
      ctx.fillStyle = "#D8E8F5"; ctx.fill();
      ctx.beginPath(); pathFn.current(d3.geoGraticule()());
      ctx.strokeStyle = "#C0D4E8"; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.beginPath(); pathFn.current(land.current);
      ctx.fillStyle = "#9BB8A0"; ctx.fill();
      ctx.strokeStyle = "#7AA085"; ctx.lineWidth = 0.6; ctx.stroke();
      ctx.beginPath(); pathFn.current({ type: "Sphere" });
      ctx.strokeStyle = "#AABCCC"; ctx.lineWidth = 1.5; ctx.stroke();
      MOCK_STREAMS.forEach(stream => {
        const c = proj.current([stream.lon, stream.lat]);
        if (!c) return;
        const angle = d3.geoDistance([stream.lon, stream.lat], [-s.rotation[0], -s.rotation[1]]);
        if (angle > Math.PI / 2) return;
        const [px, py] = c;
        const isHov = s.hoveredStream?.id === stream.id;
        const size = isHov ? 9 : 6;
        const phase = (Date.now() % 2000) / 2000;
        ctx.beginPath();
        ctx.arc(px, py, size + phase * 18, 0, Math.PI * 2);
        ctx.strokeStyle = stream.color + Math.floor((1 - phase) * 160).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fillStyle = stream.color; ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.font = `${isHov ? 16 : 13}px serif`;
        ctx.textAlign = "center";
        ctx.fillText(stream.emoji, px, py - size - 5);
      });
    }

    function loop() {
      if (s.autoRotate) s.rotation[0] += 0.1;
      draw();
      animId.current = requestAnimationFrame(loop);
    }

    function getHovered(mx, my) {
      if (!proj.current) return null;
      return MOCK_STREAMS.find(stream => {
        const c = proj.current([stream.lon, stream.lat]);
        if (!c) return false;
        if (d3.geoDistance([stream.lon, stream.lat], [-s.rotation[0], -s.rotation[1]]) > Math.PI / 2) return false;
        return Math.hypot(mx - c[0], my - c[1]) < 18;
      }) || null;
    }

    function toCanvas(e) {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)];
    }

    const onMove = e => {
      const [mx, my] = toCanvas(e);
      if (s.dragging) {
        s.autoRotate = false;
        s.rotation[0] += (e.clientX - s.lastX) * 0.4;
        s.rotation[1] = Math.max(-70, Math.min(70, s.rotation[1] - (e.clientY - s.lastY) * 0.3));
        s.lastX = e.clientX; s.lastY = e.clientY;
        setTooltip(null); return;
      }
      const found = getHovered(mx, my);
      s.hoveredStream = found;
      canvas.style.cursor = found ? "pointer" : "grab";
      if (found) {
        const r = canvas.getBoundingClientRect();
        const [px, py] = proj.current([found.lon, found.lat]);
        setTooltip({ s: found, x: px * (r.width / W), y: py * (r.height / H) });
      } else setTooltip(null);
    };
    const onDown = e => { s.dragging = true; s.lastX = e.clientX; s.lastY = e.clientY; s.autoRotate = false; canvas.style.cursor = "grabbing"; };
    const onUp = () => { s.dragging = false; canvas.style.cursor = "grab"; setTimeout(() => { s.autoRotate = true; }, 2000); };
    const onLeave = () => { s.dragging = false; s.hoveredStream = null; setTooltip(null); setTimeout(() => { s.autoRotate = true; }, 1000); };
    const onClick = () => { if (s.hoveredStream) onStreamClick(s.hoveredStream); };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("click", onClick);
    init();
    return () => {
      cancelAnimationFrame(animId.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="map-screen screen-enter">
      <canvas ref={canvasRef} width={500} height={500} className="globe-canvas" />
      {tooltip && (
        <div className="globe-tooltip" style={{ left: tooltip.x + 20, top: tooltip.y - 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{tooltip.s.emoji} {tooltip.s.title}</div>
          <div style={{ fontSize: 12, color: "var(--sub)" }}>📍 {tooltip.s.location}</div>
          <div style={{ fontSize: 12, color: "var(--violet)", marginTop: 3 }}>👁 {tooltip.s.viewers.toLocaleString()} viewers</div>
        </div>
      )}
      <div className="globe-pills">
        {MOCK_STREAMS.map(s => (
          <button key={s.id} className="globe-pill" style={{ borderColor: s.color + "55" }} onClick={() => rotateToStream(s)}>
            <span style={{ width: 7, height: 7, background: s.color, borderRadius: "50%", display: "inline-block" }} />
            {s.emoji} {s.location}
          </button>
        ))}
      </div>
      <div className="globe-stream-count"><span>{MOCK_STREAMS.length}</span> streams active</div>
    </div>
  );
}

function GoLiveScreen({ onBack }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Travel");
  const [viewers, setViewers] = useState(0);
  const [duration, setDuration] = useState(0);
  const [camError, setCamError] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
      setCamError(false);
    } catch {
      setCamError(true);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }

  function toggleCam() {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) { videoTrack.enabled = !videoTrack.enabled; setCamOn(videoTrack.enabled); }
  }

  function toggleMic() {
    if (!streamRef.current) return;
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; setMicOn(audioTrack.enabled); }
  }

  function startLive() {
    if (!title.trim()) return;
    setIsLive(true); setViewers(1); setDuration(0);
    intervalRef.current = setInterval(() => {
      setDuration(d => d + 1);
      setViewers(v => Math.max(1, v + Math.floor(Math.random() * 5) - 1));
    }, 1000);
  }

  function stopLive() {
    setIsLive(false);
    clearInterval(intervalRef.current);
    setViewers(0); setDuration(0);
  }

  function formatDuration(s) {
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  }

  return (
    <div className="golive-screen screen-enter">
      <div className="golive-preview">
        {!camError ? (
          <video ref={videoRef} className="golive-video" autoPlay muted playsInline />
        ) : (
          <div className="golive-no-cam">
            <div className="golive-no-cam-icon">📷</div>
            <div>Camera unavailable</div>
            <div style={{ fontSize: 12 }}>Check your browser permissions</div>
          </div>
        )}
        <div className="golive-overlay-top">
          <button className="viewer-back" onClick={() => { stopCamera(); stopLive(); onBack(); }}>←</button>
          {isLive && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="golive-live-badge"><div className="live-dot" />LIVE</div>
              <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 20, padding: "4px 12px", fontSize: 13, color: "white" }}>👁 {viewers}</div>
              <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 20, padding: "4px 12px", fontSize: 13, color: "white" }}>⏱ {formatDuration(duration)}</div>
            </div>
          )}
        </div>
        <div className="golive-overlay-bottom">
          <button className={`golive-ctrl-btn ${!micOn ? "off" : ""}`} onClick={toggleMic}>{micOn ? "🎙️" : "🔇"}</button>
          <button className={`golive-ctrl-btn ${!camOn ? "off" : ""}`} onClick={toggleCam}>{camOn ? "📹" : "🚫"}</button>
        </div>
      </div>
      <div className="golive-panel">
        <div className="golive-panel-title">🔴 Go Live</div>
        {!isLive ? (
          <>
            <div>
              <div className="golive-label">Stream Title</div>
              <input className="golive-input" placeholder="What are you showing today?" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <div className="golive-label">Category</div>
              <select className="golive-select" value={category} onChange={e => setCategory(e.target.value)}>
                {STREAM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginTop: "auto" }}>
              <button className="golive-start-btn" onClick={startLive} disabled={!title.trim()}>🔴 Start Stream</button>
            </div>
          </>
        ) : (
          <>
            <div className="golive-live-stats">
              <div className="golive-stat">
                <div className="golive-stat-num">{viewers}</div>
                <div className="golive-stat-label">Viewers</div>
              </div>
              <div className="golive-stat">
                <div className="golive-stat-num">{formatDuration(duration)}</div>
                <div className="golive-stat-label">Duration</div>
              </div>
            </div>
            <div style={{ background: "var(--card)", borderRadius: 12, padding: 14, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, color: "var(--sub)", marginBottom: 6 }}>Stream Title</div>
              <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--violet)", marginTop: 4 }}>{category}</div>
            </div>
            <div style={{ marginTop: "auto" }}>
              <button className="golive-stop-btn" onClick={stopLive}>⏹ End Stream</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ViewerScreen({ stream, onBack }) {
  const [hearts, setHearts] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);

  const addHeart = () => {
    const id = Date.now();
    setHearts(h => [...h, { id, x: Math.random() * 30 }]);
    setTimeout(() => setHearts(h => h.filter(i => i.id !== id)), 1200);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(m => [...m, { user: "you", text: chatInput }]);
    setChatInput("");
  };

  return (
    <div className="viewer-screen screen-enter">
      <div className="viewer-video">
        <span>{stream.emoji}</span>
        <div className="viewer-video-label">LIVE DATA STREAM</div>
        <div className="viewer-top">
          <button className="viewer-back" onClick={onBack}>←</button>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div className="viewer-title">{stream.title}</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>📍 {stream.location}</div>
          </div>
          <div className="viewer-viewers">👁 {stream.viewers.toLocaleString()}</div>
        </div>
        <div className="viewer-bottom">
          <button className="reaction-btn" onClick={addHeart}>❤️</button>
        </div>
        <div className="floating-hearts">
          {hearts.map(h => <div key={h.id} className="heart" style={{ right: h.x }}>❤️</div>)}
        </div>
      </div>
      <div className="chat-panel">
        <div className="chat-header">
          <div className="chat-title">💬 Chat</div>
          <div style={{ fontSize: 12, color: "var(--sub)" }}>{stream.country}</div>
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className="chat-msg">
              <span className="chat-username">@{m.user}</span>
              <div className="chat-text">{m.text}</div>
            </div>
          ))}
        </div>
        <div className="chat-input-area">
          <input className="chat-input" placeholder="Send a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
          <button className="chat-send" onClick={sendMessage}>→</button>
        </div>
      </div>
    </div>
  );
}

function AuthModal({ onClose }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    try {
      if (tab === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal-wrap" style={{ position: "relative" }}>
        <div className="auth-modal">
          <div>
            <div className="auth-title"><span style={{filter: "grayscale(1) sepia(1) saturate(5) hue-rotate(300deg)"}}>🌐</span> Momentra</div>
            <div className="auth-subtitle">{tab === "login" ? "Welcome back — sign in to continue." : "Create your account to go live."}</div>
          </div>
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Sign In</button>
            <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Register</button>
          </div>
          {tab === "register" && (
            <div className="auth-field">
              <label>Full Name</label>
              <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>
          <button className="auth-submit" onClick={handleSubmit}>
            {tab === "login" ? "Sign In" : "Create Account"}
          </button>
          <div style={{ fontSize: 12, color: "var(--sub)", textAlign: "center" }}>
            {tab === "login" ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color: "var(--violet)", cursor: "pointer", fontWeight: 600 }} onClick={() => setTab(tab === "login" ? "register" : "login")}>
              {tab === "login" ? "Register" : "Sign In"}
            </span>
          </div>
        </div>
        <button className="auth-close" onClick={onClose}>✕</button>
      </div>
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedStream, setSelectedStream] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const tag = document.createElement("style");
    tag.innerHTML = styles;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  const openStream = (stream) => {
    setSelectedStream(stream);
    setCurrentScreen("viewer");
  };

  return (
    <div className="app">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <nav className="sidebar">
        <div className="sidebar-logo">M</div>
        <button className={`nav-btn ${currentScreen === "home" ? "active" : ""}`} onClick={() => setCurrentScreen("home")}>
          🏠<span className="nav-btn-label">Home</span>
        </button>
        <button className={`nav-btn ${currentScreen === "map" ? "active" : ""}`} onClick={() => setCurrentScreen("map")}>
          🗺️<span className="nav-btn-label">Map</span>
        </button>
        <button className="nav-btn go-live" onClick={() => setCurrentScreen("golive")}>
          <div className="go-live-dot" />
          <span className="nav-btn-label" style={{ color: "var(--live-red)" }}>Go live</span>
        </button>
        <div className="nav-spacer" />
        <button className="nav-btn" onClick={() => setShowAuth(true)}>
          👤<span className="nav-btn-label">Account</span>
        </button>
      </nav>
      <main className="main">
        {currentScreen === "home" && <HomeScreen onStreamClick={openStream} />}
        {currentScreen === "map" && <MapScreen onStreamClick={openStream} />}
        {currentScreen === "golive" && <GoLiveScreen onBack={() => setCurrentScreen("home")} />}
        {currentScreen === "viewer" && selectedStream && <ViewerScreen stream={selectedStream} onBack={() => setCurrentScreen("map")} />}
      </main>
    </div>
  );
}
