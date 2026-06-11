import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

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
  --void: #050512; --surface: #0B0B1E; --card: #12122B; --card2: #161636;
  --border: #23234E; --violet: #6C63FF; --live-purple: #4D13D1;
  --text: #F0F0F8; --sub: #8888AA;
}
body { background: var(--void); color: var(--text); font-family: 'Inter', sans-serif; overflow: hidden; height: 100vh; }
.app { display: flex; height: 100vh; width: 100vw; overflow: hidden; }
.sidebar { width: 64px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; padding: 20px 0; gap: 8px; flex-shrink: 0; z-index: 10; }
.sidebar-logo { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: var(--violet); margin-bottom: 24px; }
.nav-btn { width: 44px; height: 44px; border-radius: 12px; border: none; background: transparent; color: var(--sub); font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease; }
.nav-btn:hover { background: var(--card2); color: var(--text); }
.nav-btn.active { background: rgba(108,99,255,0.15); color: var(--violet); }
.nav-btn.go-live { background: var(--live-purple); color: white; margin-top: 8px; font-size: 22px; box-shadow: 0 4px 20px rgba(77,19,209,0.4); }
.nav-spacer { flex: 1; }
.main { flex: 1; display: flex; overflow: hidden; background: var(--void); }
.home { flex: 1; display: flex; flex-direction: column; overflow: hidden; height: 100%; }
.home-header { padding: 20px 28px 0; display: flex; align-items: center; justify-content: space-between; }
.home-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; }
.home-title span { color: var(--violet); }
.categories { display: flex; gap: 8px; padding: 16px 28px 0; overflow-x: auto; scrollbar-width: none; flex-shrink: 0; }
.categories::-webkit-scrollbar { display: none; }
.cat-pill { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--card); color: var(--sub); font-size: 13px; cursor: pointer; white-space: nowrap; }
.cat-pill.active { background: var(--live-purple); border-color: var(--live-purple); color: white; }
.stream-scroll { flex: 1; overflow-y: auto; padding: 16px 28px 28px; }
.section-label { font-size: 11px; font-weight: 600; color: var(--sub); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
.stream-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stream-card { border-radius: 16px; overflow: hidden; background: var(--card2); cursor: pointer; border: 1px solid var(--border); position: relative; transition: transform 0.2s; }
.stream-card:hover { transform: translateY(-2px); border-color: var(--violet); }
.stream-thumb { width: 100%; height: 148px; display: flex; align-items: center; justify-content: center; font-size: 42px; position: relative; }
.live-badge { position: absolute; top: 10px; left: 10px; background: var(--live-purple); color: white; font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 4px; display: flex; align-items: center; gap: 4px; }
.live-dot { width: 6px; height: 6px; background: white; border-radius: 50%; }
.viewer-count { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.65); color: white; font-size: 11px; padding: 3px 8px; border-radius: 20px; }
.stream-info { padding: 12px; }
.stream-title { font-size: 13px; font-weight: 600; line-height: 1.4; margin-bottom: 5px; color: var(--text); }
.stream-location { font-size: 12px; color: var(--sub); }
.map-screen { flex: 1; position: relative; overflow: hidden; background: var(--void); display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
.globe-canvas { display: block; border-radius: 50%; }
.globe-tooltip { position: absolute; pointer-events: none; z-index: 20; background: rgba(12,12,35,0.97); border: 1px solid #6C63FF; border-radius: 12px; padding: 10px 14px; min-width: 190px; }
.globe-pills { display: flex; gap: 7px; flex-wrap: wrap; justify-content: center; padding: 10px 20px 0; max-width: 700px; }
.globe-pill { background: rgba(18,18,43,0.9); border-radius: 20px; padding: 5px 12px; color: #F0F0F8; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; border: 1px solid #23234E; }
.globe-pill:hover { background: rgba(108,99,255,0.2); }
.globe-stream-count { background: rgba(18,18,43,0.9); border: 1px solid var(--border); border-radius: 10px; padding: 7px 14px; font-size: 13px; color: var(--sub); position: absolute; top: 18px; right: 22px; }
.globe-stream-count span { color: var(--violet); font-weight: 700; }
.viewer-screen { flex: 1; background: #000; display: flex; position: relative; overflow: hidden; height: 100%; }
.viewer-video { flex: 1; display: flex; align-items: center; justify-content: center; font-size: 80px; background: radial-gradient(ellipse at center, #12122b 0%, #050512 100%); position: relative; }
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
.chat-panel { width: 320px; background: rgba(11,11,30,0.95); border-left: 1px solid var(--border); display: flex; flex-direction: column; }
.chat-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.chat-title { font-size: 14px; font-weight: 600; color: var(--text); }
.chat-messages { flex: 1; overflow-y: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.chat-msg { display: flex; flex-direction: column; }
.chat-username { font-size: 11px; font-weight: 600; color: var(--violet); margin-bottom: 2px; }
.chat-text { font-size: 13px; color: rgba(240,240,248,0.85); }
.chat-input-area { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
.chat-input { flex: 1; background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 8px 12px; color: var(--text); outline: none; font-size: 13px; }
.chat-send { width: 36px; height: 36px; background: var(--live-purple); border: none; border-radius: 10px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.screen-enter { animation: screen-in 0.2s ease-out; }
@keyframes screen-in { from { opacity: 0; transform: scale(0.99); } to { opacity: 1; transform: scale(1); } }
`;

function StreamCard({ stream, onClick }) {
  return (
    <div className="stream-card" onClick={() => onClick(stream)}>
      <div className="stream-thumb" style={{ background: `radial-gradient(ellipse at center, ${stream.color}22, #050512)` }}>
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
      <div className="home-header"><div className="home-title">🌍 <span>Momentra</span></div></div>
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
      ctx.fillStyle = "#080820"; ctx.fill();

      ctx.beginPath(); pathFn.current(d3.geoGraticule()());
      ctx.strokeStyle = "#16163A"; ctx.lineWidth = 0.5; ctx.stroke();

      ctx.beginPath(); pathFn.current(land.current);
      ctx.fillStyle = "#1C1C4A"; ctx.fill();
      ctx.strokeStyle = "#2D2D6E"; ctx.lineWidth = 0.6; ctx.stroke();

      ctx.beginPath(); pathFn.current({ type: "Sphere" });
      ctx.strokeStyle = "#23234E"; ctx.lineWidth = 1.5; ctx.stroke();

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
        ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 1.5; ctx.stroke();
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
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F0F8", marginBottom: 3 }}>{tooltip.s.emoji} {tooltip.s.title}</div>
          <div style={{ fontSize: 12, color: "#8888AA" }}>📍 {tooltip.s.location}</div>
          <div style={{ fontSize: 12, color: "#6C63FF", marginTop: 3 }}>👁 {tooltip.s.viewers.toLocaleString()} viewers</div>
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
            <div style={{ color: "var(--sub)", fontSize: 13 }}>📍 {stream.location}</div>
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
          <div className="chat-title">💬 Chat Session</div>
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
          <input className="chat-input" placeholder="Send text..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} />
          <button className="chat-send" onClick={sendMessage}>→</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedStream, setSelectedStream] = useState(null);

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
      <nav className="sidebar">
        <div className="sidebar-logo">M</div>
        <button className={`nav-btn ${currentScreen === "home" ? "active" : ""}`} onClick={() => setCurrentScreen("home")}>🏠</button>
        <button className={`nav-btn ${currentScreen === "map" ? "active" : ""}`} onClick={() => setCurrentScreen("map")}>🗺️</button>
        <button className="nav-btn go-live">➕</button>
        <div className="nav-spacer" />
        <button className="nav-btn">👤</button>
      </nav>
      <main className="main">
        {currentScreen === "home" && <HomeScreen onStreamClick={openStream} />}
        {currentScreen === "map" && <MapScreen onStreamClick={openStream} />}
        {currentScreen === "viewer" && selectedStream && <ViewerScreen stream={selectedStream} onBack={() => setCurrentScreen("map")} />}
      </main>
    </div>
  );
}