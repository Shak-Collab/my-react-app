import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_STREAMS = [
{ id: 1, title: "Walking through Shibuya at night", category: "Walking", location: "Tokyo, Japan", country: "🇯🇵", viewers: 3241, lat: 35.6595, lng: 139.7004, color: "#FF3B5C" },
{ id: 2, title: "Live from Carnival — Rio streets", category: "Events", location: "Rio de Janeiro, Brazil", country: "🇧🇷", viewers: 8702, lat: -22.9068, lng: -43.1729, color: "#6C63FF" },
{ id: 3, title: "Sunset hike in the Alps", category: "Nature", location: "Zermatt, Switzerland", country: "🇨🇭", viewers: 1540, lat: 46.0207, lng: 7.7491, color: "#00C9A7" },
{ id: 4, title: "Jazz session in New Orleans", category: "Music", location: "New Orleans, USA", country: "🇺🇸", viewers: 2890, lat: 29.9511, lng: -90.0715, color: "#FFB347" },
{ id: 5, title: "Morning market in Marrakech", category: "City Life", location: "Marrakech, Morocco", country: "🇲🇦", viewers: 977, lat: 31.6295, lng: -7.9811, color: "#FF6B9D" },
{ id: 6, title: "Formula E race — live pit lane", category: "Sports", location: "Monaco", country: "🇲🇨", viewers: 12430, lat: 43.7384, lng: 7.4246, color: "#4ECDC4" },
{ id: 7, title: "Cherry blossom walk — Kyoto", category: "Travel", location: "Kyoto, Japan", country: "🇯🇵", viewers: 5612, lat: 35.0116, lng: 135.7681, color: "#FF3B5C" },
{ id: 8, title: "Street food tour — Bangkok", category: "Travel", location: "Bangkok, Thailand", country: "🇹🇭", viewers: 4201, lat: 13.7563, lng: 100.5018, color: "#6C63FF" },
];

const CATEGORIES = ["All", "Travel", "Walking", "Nature", "Music", "Sports", "Events", "City Life", "Random"];

const CHAT_MESSAGES = [
{ user: "alex_w", text: "this is incredible!", time: "2s" },
{ user: "sofia_m", text: "где это?? 😍", time: "5s" },
{ user: "james_k", text: "I want to be there right now", time: "8s" },
{ user: "yuki_t", text: "beautiful 🌸", time: "12s" },
{ user: "marco_r", text: "how is it so crowded already", time: "15s" },
];

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
--void: #0A0A0F;
--surface: #12121A;
--card: #1A1A26;
--card2: #1E1E2E;
--border: #2A2A3C;
--red: #FF3B5C;
--violet: #6C63FF;
--teal: #00C9A7;
--text: #F0F0F8;
--sub: #888899;
--muted: #444455;
}

body { background: var(--void); color: var(--text); font-family: 'Inter', sans-serif; overflow: hidden; height: 100vh; }

.app { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

/* SIDEBAR NAV */
.sidebar {
width: 64px;
background: var(--surface);
border-right: 1px solid var(--border);
display: flex;
flex-direction: column;
align-items: center;
padding: 20px 0;
gap: 4px;
flex-shrink: 0;
z-index: 10;
}
.sidebar-logo {
font-family: 'Space Grotesk', sans-serif;
font-size: 18px;
font-weight: 700;
color: var(--red);
margin-bottom: 24px;
letter-spacing: -0.5px;
}
.nav-btn {
width: 44px; height: 44px;
border-radius: 12px;
border: none;
background: transparent;
color: var(--sub);
font-size: 20px;
cursor: pointer;
display: flex; align-items: center; justify-content: center;
transition: all 0.18s ease;
position: relative;
}
.nav-btn:hover { background: var(--card2); color: var(--text); }
.nav-btn.active { background: rgba(255,59,92,0.15); color: var(--red); }
.nav-btn.go-live {
background: var(--red);
color: white;
margin-top: 8px;
font-size: 22px;
box-shadow: 0 4px 20px rgba(255,59,92,0.4);
}
.nav-btn.go-live:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(255,59,92,0.5); }
.nav-spacer { flex: 1; }
.nav-tooltip {
position: absolute;
left: 54px;
background: var(--card2);
color: var(--text);
font-size: 12px;
font-family: 'Inter', sans-serif;
padding: 5px 10px;
border-radius: 6px;
white-space: nowrap;
pointer-events: none;
opacity: 0;
transition: opacity 0.15s;
border: 1px solid var(--border);
z-index: 100;
}
.nav-btn:hover .nav-tooltip { opacity: 1; }

/* MAIN CONTENT */
.main { flex: 1; display: flex; overflow: hidden; }

/* HOME SCREEN */
.home { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.home-header {
padding: 20px 28px 0;
display: flex; align-items: center; justify-content: space-between;
flex-shrink: 0;
}
.home-title {
font-family: 'Space Grotesk', sans-serif;
font-size: 22px; font-weight: 700;
color: var(--text);
}
.home-title span { color: var(--red); }
.search-btn {
width: 36px; height: 36px;
background: var(--card);
border: 1px solid var(--border);
border-radius: 10px;
color: var(--sub);
font-size: 16px;
cursor: pointer;
display: flex; align-items: center; justify-content: center;
transition: all 0.15s;
}
.search-btn:hover { border-color: var(--violet); color: var(--text); }

/* CATEGORIES */
.categories {
display: flex; gap: 8px;
padding: 16px 28px 0;
overflow-x: auto;
flex-shrink: 0;
scrollbar-width: none;
}
.categories::-webkit-scrollbar { display: none; }
.cat-pill {
padding: 6px 14px;
border-radius: 20px;
border: 1px solid var(--border);
background: var(--card);
color: var(--sub);
font-size: 13px;
font-weight: 500;
cursor: pointer;
white-space: nowrap;
transition: all 0.15s;
flex-shrink: 0;
}
.cat-pill:hover { border-color: var(--violet); color: var(--text); }
.cat-pill.active { background: var(--red); border-color: var(--red); color: white; }

/* STREAM GRID */
.stream-scroll { flex: 1; overflow-y: auto; padding: 16px 28px 28px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.section-label {
font-size: 11px;
font-weight: 600;
color: var(--sub);
text-transform: uppercase;
letter-spacing: 0.08em;
margin-bottom: 12px;
}
.stream-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
gap: 14px;
margin-bottom: 28px;
}
.stream-card {
border-radius: 16px;
overflow: hidden;
background: var(--card2);
cursor: pointer;
transition: transform 0.18s ease, box-shadow 0.18s ease;
border: 1px solid var(--border);
position: relative;
}
.stream-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.5); border-color: var(--muted); }
.stream-thumb {
width: 100%; height: 148px;
display: flex; align-items: center; justify-content: center;
font-size: 42px;
position: relative;
overflow: hidden;
}
.stream-thumb-overlay {
position: absolute; inset: 0;
background: linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%);
}
.live-badge {
position: absolute; top: 10px; left: 10px;
background: var(--red);
color: white;
font-size: 10px;
font-weight: 700;
letter-spacing: 0.08em;
padding: 3px 7px;
border-radius: 4px;
display: flex; align-items: center; gap: 4px;
}
.live-dot {
width: 6px; height: 6px;
background: white;
border-radius: 50%;
animation: pulse-dot 1.2s ease-in-out infinite;
}
@keyframes pulse-dot {
0%, 100% { opacity: 1; transform: scale(1); }
50% { opacity: 0.4; transform: scale(1.4); }
}
.viewer-count {
position: absolute; top: 10px; right: 10px;
background: rgba(0,0,0,0.65);
color: white;
font-size: 11px;
font-weight: 600;
padding: 3px 8px;
border-radius: 20px;
backdrop-filter: blur(4px);
}
.stream-info { padding: 10px 12px 12px; }
.stream-title {
font-size: 13px; font-weight: 600;
color: var(--text);
line-height: 1.3;
margin-bottom: 5px;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
}
.stream-location { font-size: 12px; color: var(--sub); display: flex; align-items: center; gap: 4px; }

/* MAP SCREEN */
.map-screen { flex: 1; position: relative; overflow: hidden; background: #0d1117; }
.map-bg {
position: absolute; inset: 0;
background:
radial-gradient(ellipse 80% 50% at 50% 60%, rgba(108,99,255,0.06) 0%, transparent 70%),
#0d1117;
}
.map-grid {
position: absolute; inset: 0;
background-image:
linear-gradient(rgba(42,42,60,0.4) 1px, transparent 1px),
linear-gradient(90deg, rgba(42,42,60,0.4) 1px, transparent 1px);
background-size: 60px 60px;
}
.map-continents {
position: absolute; inset: 0;
display: flex; align-items: center; justify-content: center;
font-size: 11px; color: rgba(255,255,255,0.04);
letter-spacing: 0.3em;
font-family: 'Space Grotesk', sans-serif;
font-weight: 700;
}
.map-marker {
position: absolute;
transform: translate(-50%, -50%);
cursor: pointer;
transition: transform 0.2s ease;
}
.map-marker:hover { transform: translate(-50%, -50%) scale(1.15); z-index: 10; }
.marker-ring {
position: absolute;
border-radius: 50%;
border: 2px solid currentColor;
opacity: 0;
animation: marker-ripple 2s ease-out infinite;
}
@keyframes marker-ripple {
0% { width: 100%; height: 100%; top: 0; left: 0; opacity: 0.6; }
100% { width: 200%; height: 200%; top: -50%; left: -50%; opacity: 0; }
}
.marker-inner {
width: 48px; height: 48px;
border-radius: 50%;
display: flex; align-items: center; justify-content: center;
font-size: 20px;
border: 2px solid rgba(255,255,255,0.2);
position: relative;
z-index: 1;
}
.marker-viewers {
position: absolute; bottom: -18px; left: 50%;
transform: translateX(-50%);
font-size: 10px; font-weight: 600;
color: rgba(255,255,255,0.7);
white-space: nowrap;
background: rgba(0,0,0,0.6);
padding: 2px 6px;
border-radius: 10px;
}
.map-controls {
position: absolute; top: 20px; left: 0; right: 0;
padding: 0 24px;
display: flex; gap: 12px; align-items: center;
}
.map-search {
flex: 1;
background: rgba(26,26,38,0.95);
border: 1px solid var(--border);
border-radius: 12px;
padding: 10px 16px;
color: var(--text);
font-size: 14px;
font-family: 'Inter', sans-serif;
backdrop-filter: blur(8px);
outline: none;
transition: border-color 0.15s;
}
.map-search:focus { border-color: var(--violet); }
.map-search::placeholder { color: var(--sub); }
.map-stream-count {
background: rgba(26,26,38,0.95);
border: 1px solid var(--border);
border-radius: 12px;
padding: 10px 14px;
font-size: 13px;
color: var(--sub);
backdrop-filter: blur(8px);
white-space: nowrap;
}
.map-stream-count span { color: var(--red); font-weight: 700; }

/* LIVE VIEWER */
.viewer-screen {
flex: 1;
background: #000;
display: flex;
position: relative;
overflow: hidden;
}
.viewer-video {
flex: 1;
display: flex; align-items: center; justify-content: center;
font-size: 80px;
background: radial-gradient(ellipse at center, #1a1a2e 0%, #000 100%);
position: relative;
}
.viewer-video-label {
position: absolute;
bottom: 40px; left: 50%;
transform: translateX(-50%);
font-size: 13px; color: rgba(255,255,255,0.3);
letter-spacing: 0.1em;
font-family: 'Space Grotesk', sans-serif;
}
.viewer-top {
position: absolute; top: 0; left: 0; right: 320px;
padding: 20px 24px;
background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
display: flex; align-items: flex-start; justify-content: space-between;
pointer-events: none;
}
.viewer-back {
width: 36px; height: 36px;
background: rgba(0,0,0,0.5);
border: 1px solid rgba(255,255,255,0.1);
border-radius: 10px;
color: white;
font-size: 18px;
cursor: pointer;
display: flex; align-items: center; justify-content: center;
pointer-events: all;
transition: background 0.15s;
}
.viewer-back:hover { background: rgba(255,255,255,0.1); }
.viewer-info { display: flex; flex-direction: column; gap: 4px; }
.viewer-title { font-size: 16px; font-weight: 600; color: white; font-family: 'Space Grotesk', sans-serif; }
.viewer-loc { font-size: 13px; color: rgba(255,255,255,0.6); display: flex; align-items: center; gap: 4px; }
.viewer-stats { display: flex; align-items: center; gap: 12px; }
.viewer-viewers {
background: rgba(0,0,0,0.5);
border-radius: 20px;
padding: 5px 12px;
font-size: 13px; font-weight: 600;
color: white;
display: flex; align-items: center; gap: 5px;
backdrop-filter: blur(4px);
}
.viewer-bottom {
position: absolute; bottom: 0; left: 0; right: 320px;
padding: 24px;
background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
display: flex; align-items: flex-end; justify-content: space-between;
}
.viewer-creator { display: flex; align-items: center; gap: 10px; }
.creator-avatar {
width: 40px; height: 40px;
border-radius: 50%;
background: linear-gradient(135deg, var(--red), var(--violet));
display: flex; align-items: center; justify-content: center;
font-size: 16px;
border: 2px solid rgba(255,255,255,0.2);
}
.creator-name { font-size: 14px; font-weight: 600; color: white; }
.cat-badge-sm {
display: inline-block;
padding: 2px 8px;
background: rgba(108,99,255,0.3);
border: 1px solid rgba(108,99,255,0.5);
border-radius: 10px;
font-size: 11px; color: #a8a3ff;
margin-top: 3px;
}
.reaction-btn {
width: 44px; height: 44px;
background: rgba(0,0,0,0.5);
border: 1px solid rgba(255,255,255,0.1);
border-radius: 50%;
color: white;
font-size: 20px;
cursor: pointer;
display: flex; align-items: center; justify-content: center;
transition: transform 0.15s;
backdrop-filter: blur(4px);
}
.reaction-btn:hover { transform: scale(1.1); }
.floating-hearts { position: absolute; bottom: 80px; right: 340px; pointer-events: none; }
.heart {
position: absolute;
font-size: 22px;
animation: float-heart 1.2s ease-out forwards;
}
@keyframes float-heart {
0% { opacity: 1; transform: translateY(0) scale(1); }
100% { opacity: 0; transform: translateY(-120px) scale(0.5) rotate(15deg); }
}

/* CHAT PANEL */
.chat-panel {
width: 320px;
background: rgba(10,10,15,0.95);
border-left: 1px solid var(--border);
display: flex; flex-direction: column;
flex-shrink: 0;
backdrop-filter: blur(8px);
}
.chat-header {
padding: 16px 20px;
border-bottom: 1px solid var(--border);
display: flex; align-items: center; justify-content: space-between;
}
.chat-title { font-size: 14px; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 6px; }
.chat-messages { flex: 1; overflow-y: auto; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.chat-msg { display: flex; flex-direction: column; gap: 2px; }
.chat-username { font-size: 11px; font-weight: 600; color: var(--violet); }
.chat-text { font-size: 13px; color: rgba(240,240,248,0.85); line-height: 1.4; }
.chat-time { font-size: 10px; color: var(--muted); }
.chat-input-area {
padding: 12px 16px;
border-top: 1px solid var(--border);
display: flex; gap: 8px;
}
.chat-input {
flex: 1;
background: var(--card);
border: 1px solid var(--border);
border-radius: 10px;
padding: 8px 12px;
color: var(--text);
font-size: 13px;
font-family: 'Inter', sans-serif;
outline: none;
transition: border-color 0.15s;
}
.chat-input:focus { border-color: var(--violet); }
.chat-input::placeholder { color: var(--muted); }
.chat-send {
width: 36px; height: 36px;
background: var(--violet);
border: none;
border-radius: 10px;
color: white;
font-size: 16px;
cursor: pointer;
display: flex; align-items: center; justify-content: center;
transition: opacity 0.15s;
}
.chat-send:hover { opacity: 0.85; }

/* CREATOR SCREEN */
.creator-screen {
flex: 1;
display: flex;
overflow: hidden;
}
.creator-preview {
flex: 1;
background: radial-gradient(ellipse at center, #1a1a2e 0%, #0A0A0F 100%);
display: flex; align-items: center; justify-content: center;
font-size: 100px;
position: relative;
}
.creator-controls-overlay {
position: absolute; top: 20px; right: 20px;
display: flex; flex-direction: column; gap: 10px;
}
.icon-btn {
width: 40px; height: 40px;
background: rgba(0,0,0,0.5);
border: 1px solid rgba(255,255,255,0.1);
border-radius: 10px;
color: white;
font-size: 18px;
cursor: pointer;
display: flex; align-items: center; justify-content: center;
backdrop-filter: blur(4px);
transition: background 0.15s;
}
.icon-btn:hover { background: rgba(255,255,255,0.1); }
.creator-panel {
width: 320px;
background: var(--surface);
border-left: 1px solid var(--border);
display: flex; flex-direction: column;
padding: 28px 24px;
gap: 20px;
overflow-y: auto;
flex-shrink: 0;
}
.creator-panel-title {
font-family: 'Space Grotesk', sans-serif;
font-size: 18px; font-weight: 700;
color: var(--text);
}
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 12px; font-weight: 600; color: var(--sub); text-transform: uppercase; letter-spacing: 0.06em; }
.form-input {
background: var(--card);
border: 1px solid var(--border);
border-radius: 10px;
padding: 10px 14px;
color: var(--text);
font-size: 14px;
font-family: 'Inter', sans-serif;
outline: none;
transition: border-color 0.15s;
resize: none;
}
.form-input:focus { border-color: var(--violet); }
.form-input::placeholder { color: var(--muted); }
.char-count { font-size: 11px; color: var(--muted); text-align: right; }
.cat-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.cat-chip {
padding: 5px 12px;
border-radius: 16px;
border: 1px solid var(--border);
background: var(--card);
color: var(--sub);
font-size: 12px;
font-weight: 500;
cursor: pointer;
transition: all 0.15s;
}
.cat-chip:hover { border-color: var(--violet); color: var(--text); }
.cat-chip.active { background: rgba(255,59,92,0.15); border-color: var(--red); color: var(--red); }
.location-row {
display: flex; align-items: center; gap: 10px;
background: var(--card);
border: 1px solid var(--border);
border-radius: 10px;
padding: 10px 14px;
}
.location-icon { font-size: 16px; }
.location-text { flex: 1; font-size: 14px; color: var(--text); }
.location-edit { font-size: 12px; color: var(--violet); cursor: pointer; }
.go-live-btn {
width: 100%;
padding: 14px;
background: var(--red);
border: none;
border-radius: 14px;
color: white;
font-size: 16px;
font-weight: 700;
font-family: 'Space Grotesk', sans-serif;
cursor: pointer;
transition: all 0.18s ease;
box-shadow: 0 4px 24px rgba(255,59,92,0.35);
margin-top: auto;
display: flex; align-items: center; justify-content: center; gap: 8px;
}
.go-live-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 30px rgba(255,59,92,0.5); }
.go-live-btn:active { transform: translateY(0); }

/* PROFILE */
.profile-screen {
flex: 1;
display: flex;
overflow: hidden;
}
.profile-main {
flex: 1;
overflow-y: auto;
padding: 32px 40px;
scrollbar-width: thin;
scrollbar-color: var(--border) transparent;
}
.profile-header { display: flex; align-items: center; gap: 24px; margin-bottom: 40px; }
.profile-avatar {
width: 80px; height: 80px;
border-radius: 50%;
background: linear-gradient(135deg, var(--red) 0%, var(--violet) 100%);
display: flex; align-items: center; justify-content: center;
font-size: 36px;
border: 3px solid var(--border);
flex-shrink: 0;
}
.profile-name { font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: var(--text); }
.profile-handle { font-size: 14px; color: var(--sub); margin-top: 4px; }
.profile-joined { font-size: 12px; color: var(--muted); margin-top: 6px; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 36px; }
.stat-card {
background: var(--card2);
border: 1px solid var(--border);
border-radius: 16px;
padding: 20px 22px;
display: flex; flex-direction: column; gap: 6px;
transition: border-color 0.15s;
}
.stat-card:hover { border-color: var(--muted); }
.stat-icon { font-size: 22px; }
.stat-value { font-family: 'Space Grotesk', sans-serif; font-size: 30px; font-weight: 700; color: var(--text); line-height: 1; }
.stat-label { font-size: 12px; color: var(--sub); font-weight: 500; }
.recent-section { margin-bottom: 28px; }
.recent-title { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 14px; }
.recent-list { display: flex; flex-direction: column; gap: 10px; }
.recent-item {
background: var(--card);
border: 1px solid var(--border);
border-radius: 12px;
padding: 12px 16px;
display: flex; align-items: center; gap: 14px;
}
.recent-emoji { font-size: 22px; }
.recent-info { flex: 1; }
.recent-name { font-size: 14px; font-weight: 500; color: var(--text); }
.recent-meta { font-size: 12px; color: var(--sub); margin-top: 2px; }
.recent-stat { font-size: 12px; color: var(--muted); text-align: right; }

/* AUTH */
.auth-screen {
flex: 1;
display: flex; align-items: center; justify-content: center;
background: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(108,99,255,0.07) 0%, var(--void) 70%);
}
.auth-card {
width: 380px;
background: var(--surface);
border: 1px solid var(--border);
border-radius: 24px;
padding: 40px 36px;
display: flex; flex-direction: column; gap: 28px;
}
.auth-logo {
text-align: center;
font-family: 'Space Grotesk', sans-serif;
font-size: 32px; font-weight: 700;
color: var(--red);
letter-spacing: -1px;
}
.auth-sub { text-align: center; font-size: 14px; color: var(--sub); margin-top: -16px; line-height: 1.5; }
.auth-btns { display: flex; flex-direction: column; gap: 10px; }
.auth-btn {
width: 100%;
padding: 12px 20px;
border-radius: 12px;
font-size: 14px;
font-weight: 600;
cursor: pointer;
display: flex; align-items: center; justify-content: center; gap: 10px;
transition: all 0.15s;
font-family: 'Inter', sans-serif;
}
.auth-btn-google { background: white; color: #1a1a2e; border: 1px solid #e0e0e0; }
.auth-btn-google:hover { background: #f5f5f5; }
.auth-btn-apple { background: #1a1a1a; color: white; border: 1px solid #333; }
.auth-btn-apple:hover { background: #2a2a2a; }
.auth-btn-email { background: var(--card); color: var(--text); border: 1px solid var(--border); }
.auth-btn-email:hover { border-color: var(--violet); }
.auth-divider { display: flex; align-items: center; gap: 12px; }
.auth-divider-line { flex: 1; height: 1px; background: var(--border); }
.auth-divider-text { font-size: 12px; color: var(--muted); }
.auth-terms { text-align: center; font-size: 11px; color: var(--muted); line-height: 1.6; }
.auth-terms span { color: var(--violet); cursor: pointer; }

/* SCROLLBAR */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

/* TRANSITIONS */
.screen-enter { animation: screen-in 0.22s ease-out; }
@keyframes screen-in { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function LiveBadge() {
return (
<div className="live-badge">
<div className="live-dot" />
LIVE
</div>
);
}

function StreamCard({ stream, onClick }) {
const emojis = { Travel: "✈️", Walking: "🚶", Nature: "🌿", Music: "🎵", Sports: "⚽", Events: "🎉", "City Life": "🏙️", Random: "🎲" };
return (
<div className="stream-card" onClick={() => onClick(stream)}>
<div className="stream-thumb" style={{ background: `radial-gradient(ellipse at center, ${stream.color}22, #0d0d15)` }}>
<span style={{ zIndex: 1 }}>{emojis[stream.category] || "📡"}</span>
<div className="stream-thumb-overlay" />
<LiveBadge />
<div className="viewer-count">👁 {stream.viewers.toLocaleString()}</div>
</div>
<div className="stream-info">
<div className="stream-title">{stream.title}</div>
<div className="stream-location">{stream.country} {stream.location}</div>
</div>
</div>
);
}

function HomeScreen({ onStreamClick, onGoLive }) {
const [activeCategory, setActiveCategory] = useState("All");
const filtered = activeCategory === "All" ? MOCK_STREAMS : MOCK_STREAMS.filter(s => s.category === activeCategory);

return (
<div className="home screen-enter">
<div className="home-header">
<div className="home-title">🌍 <span>Momentra</span></div>
<button className="search-btn">🔍</button>
</div>

<div className="categories">
{CATEGORIES.map(c => (
<button key={c} className={`cat-pill ${activeCategory === c ? "active" : ""}`} onClick={() => setActiveCategory(c)}>
{c}
</button>
))}
</div>

<div className="stream-scroll">
<div style={{ marginBottom: 16, marginTop: 4 }}>
<div className="section-label">🔥 Trending Now — {MOCK_STREAMS.length} live</div>
<div className="stream-grid">
{MOCK_STREAMS.slice(0, 4).map(s => <StreamCard key={s.id} stream={s} onClick={onStreamClick} />)}
</div>
</div>

<div>
<div className="section-label">{activeCategory === "All" ? "All Lives" : activeCategory}</div>
<div className="stream-grid">
{filtered.map(s => <StreamCard key={s.id} stream={s} onClick={onStreamClick} />)}
</div>
{filtered.length === 0 && (
<div style={{ textAlign: "center", padding: "40px 20px", color: "var(--sub)" }}>
<div style={{ fontSize: 36, marginBottom: 12 }}>📡</div>
<div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Nothing live in {activeCategory} right now</div>
<div style={{ fontSize: 13, marginBottom: 20 }}>Be the first to go live!</div>
<button onClick={onGoLive} style={{ padding: "10px 24px", background: "var(--red)", border: "none", borderRadius: 10, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Go Live</button>
</div>
)}
</div>
</div>
</div>
);
}

function MapScreen({ onStreamClick }) {
const markerPositions = [
{ stream: MOCK_STREAMS[0], x: "72%", y: "28%" },
{ stream: MOCK_STREAMS[1], x: "30%", y: "65%" },
{ stream: MOCK_STREAMS[2], x: "52%", y: "23%" },
{ stream: MOCK_STREAMS[3], x: "22%", y: "38%" },
{ stream: MOCK_STREAMS[4], x: "50%", y: "36%" },
{ stream: MOCK_STREAMS[5], x: "54%", y: "24%" },
{ stream: MOCK_STREAMS[6], x: "71%", y: "30%" },
{ stream: MOCK_STREAMS[7], x: "74%", y: "40%" },
];

return (
<div className="map-screen screen-enter">
<div className="map-bg" />
<div className="map-grid" />
<div className="map-continents">WORLD MAP</div>

{markerPositions.map(({ stream, x, y }, i) => (
<div
key={stream.id}
className="map-marker"
style={{ left: x, top: y }}
onClick={() => onStreamClick(stream)}
>
<div className="marker-ring" style={{ color: stream.color }} />
<div className="marker-inner" style={{ background: `${stream.color}22`, borderColor: `${stream.color}66` }}>
{["✈️","🎉","🌿","🎵","🏙️","⚽","🌸","🍜"][i]}
</div>
<div className="marker-viewers">👁 {(stream.viewers / 1000).toFixed(1)}k</div>
</div>
))}

<div className="map-controls">
<input className="map-search" placeholder="🔍 Search city or location..." />
<div className="map-stream-count"><span>{MOCK_STREAMS.length}</span> live now</div>
</div>
</div>
);
}

function ViewerScreen({ stream, onBack }) {
const [hearts, setHearts] = useState([]);
const [chatInput, setChatInput] = useState("");
const [messages, setMessages] = useState(CHAT_MESSAGES);
const [viewers, setViewers] = useState(stream.viewers);

useEffect(() => {
const t = setInterval(() => setViewers(v => v + Math.floor(Math.random() * 5) - 1), 4000);
return () => clearInterval(t);
}, []);

const addHeart = () => {
const id = Date.now();
setHearts(h => [...h, { id, x: Math.random() * 30 }]);
setTimeout(() => setHearts(h => h.filter(h => h.id !== id)), 1200);
};

const sendMessage = () => {
if (!chatInput.trim()) return;
setMessages(m => [...m, { user: "you", text: chatInput, time: "now" }]);
setChatInput("");
};

return (
<div className="viewer-screen screen-enter">
<div className="viewer-video">
<span>🎬</span>
<div className="viewer-video-label">LIVE STREAM</div>

<div className="viewer-top">
<button className="viewer-back" onClick={onBack}>←</button>
<div className="viewer-info">
<div className="live-badge" style={{ position: "static", display: "inline-flex", marginBottom: 4 }}>
<div className="live-dot" />LIVE
</div>
<div className="viewer-title">{stream.title}</div>
<div className="viewer-loc">📍 {stream.location}</div>
</div>
<div className="viewer-stats">
<div className="viewer-viewers">👁 {viewers.toLocaleString()}</div>
</div>
</div>

<div className="viewer-bottom">
<div className="viewer-creator">
<div className="creator-avatar">🎙</div>
<div>
<div className="creator-name">@momentra_live</div>
<div className="cat-badge-sm">{stream.category}</div>
</div>
</div>
<button className="reaction-btn" onClick={addHeart}>❤️</button>
</div>

<div className="floating-hearts">
{hearts.map(h => (
<div key={h.id} className="heart" style={{ right: h.x }}>❤️</div>
))}
</div>
</div>

<div className="chat-panel">
<div className="chat-header">
<div className="chat-title">💬 Live Chat</div>
<div style={{ fontSize: 12, color: "var(--sub)" }}>{stream.country}</div>
</div>
<div className="chat-messages">
{messages.map((m, i) => (
<div key={i} className="chat-msg">
<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
<span className="chat-username">{m.user}</span>
<span className="chat-time">{m.time}</span>
</div>
<div className="chat-text">{m.text}</div>
</div>
))}
</div>
<div className="chat-input-area">
<input
className="chat-input"
placeholder="Say something..."
value={chatInput}
onChange={e => setChatInput(e.target.value)}
onKeyDown={e => e.key === "Enter" && sendMessage()}
/>
<button className="chat-send" onClick={sendMessage}>→</button>
</div>
</div>
</div>
);
}

function CreatorScreen({ onGoLive }) {
const [title, setTitle] = useState("");
const [activeCategory, setActiveCategory] = useState("Travel");
const cats = CATEGORIES.filter(c => c !== "All");

return (
<div className="creator-screen screen-enter">
<div className="creator-preview">
<span>📷</span>
<div className="creator-controls-overlay">
<button className="icon-btn" title="Flip camera">🔄</button>
<button className="icon-btn" title="Flash">⚡</button>
</div>
<div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
CAMERA PREVIEW
</div>
</div>

<div className="creator-panel">
<div className="creator-panel-title">Go Live</div>

<div className="form-group">
<label className="form-label">Title</label>
<input
className="form-input"
placeholder="What's happening?"
value={title}
onChange={e => setTitle(e.target.value.slice(0, 60))}
/>
<div className="char-count">{title.length}/60</div>
</div>

<div className="form-group">
<label className="form-label">Category</label>
<div className="cat-grid">
{cats.map(c => (
<button key={c} className={`cat-chip ${activeCategory === c ? "active" : ""}`} onClick={() => setActiveCategory(c)}>{c}</button>
))}
</div>
</div>

<div className="form-group">
<label className="form-label">Location</label>
<div className="location-row">
<span className="location-icon">📍</span>
<span className="location-text">Tbilisi, Georgia</span>
<span className="location-edit">Edit</span>
</div>
</div>

<div style={{ flex: 1 }} />

<button
className="go-live-btn"
onClick={onGoLive}
disabled={!title.trim()}
style={{ opacity: title.trim() ? 1 : 0.5, cursor: title.trim() ? "pointer" : "not-allowed" }}
>
🔴 Go Live
</button>
</div>
</div>
);
}

function ProfileScreen() {
const recent = [
{ emoji: "🇯🇵", name: "Walking through Shibuya at night", meta: "Tokyo, Japan · Walking", stat: "3,241 viewers" },
{ emoji: "🌿", name: "Sunset hike in the Alps", meta: "Zermatt, Switzerland · Nature", stat: "1,540 viewers" },
{ emoji: "🎵", name: "Jazz session in New Orleans", meta: "New Orleans, USA · Music", stat: "2,890 viewers" },
];

return (
<div className="profile-screen screen-enter">
<div className="profile-main">
<div className="profile-header">
<div className="profile-avatar">🌍</div>
<div>
<div className="profile-name">World Explorer</div>
<div className="profile-handle">@world_explorer</div>
<div className="profile-joined">Member since June 2026</div>
</div>
<div style={{ marginLeft: "auto" }}>
<button style={{ padding: "8px 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, cursor: "pointer" }}>
⚙️ Settings
</button>
</div>
</div>

<div className="stats-grid">
<div className="stat-card">
<div className="stat-icon">📡</div>
<div className="stat-value">42</div>
<div className="stat-label">Lives Started</div>
</div>
<div className="stat-card">
<div className="stat-icon">👁</div>
<div className="stat-value">1,284</div>
<div className="stat-label">Lives Watched</div>
</div>
<div className="stat-card">
<div className="stat-icon">🌍</div>
<div className="stat-value">38</div>
<div className="stat-label">Countries Explored</div>
</div>
<div className="stat-card">
<div className="stat-icon">⏱</div>
<div className="stat-value">86h</div>
<div className="stat-label">Time on Momentra</div>
</div>
</div>

<div className="recent-section">
<div className="recent-title">Recent Streams</div>
<div className="recent-list">
{recent.map((r, i) => (
<div key={i} className="recent-item">
<div className="recent-emoji">{r.emoji}</div>
<div className="recent-info">
<div className="recent-name">{r.name}</div>
<div className="recent-meta">{r.meta}</div>
</div>
<div className="recent-stat">{r.stat}</div>
</div>
))}
</div>
</div>
</div>
</div>
);
}

function AuthScreen({ onLogin }) {
return (
<div className="auth-screen screen-enter">
<div className="auth-card">
<div>
<div className="auth-logo">🌍 MOMENTRA</div>
<div className="auth-sub">The world, live.<br />Join millions exploring real-time moments.</div>
</div>

<div className="auth-btns">
<button className="auth-btn auth-btn-google" onClick={onLogin}>
<span>G</span> Continue with Google
</button>
<button className="auth-btn auth-btn-apple" onClick={onLogin}>
<span>🍎</span> Continue with Apple
</button>
<div className="auth-divider">
<div className="auth-divider-line" />
<div className="auth-divider-text">or</div>
<div className="auth-divider-line" />
</div>
<button className="auth-btn auth-btn-email" onClick={onLogin}>
✉️ Continue with Email
</button>
</div>

<div className="auth-terms">
By continuing, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>
</div>
</div>
</div>
);
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function MomentraApp() {
const [screen, setScreen] = useState("auth");
const [activeNav, setActiveNav] = useState("home");
const [selectedStream, setSelectedStream] = useState(null);
const [isLive, setIsLive] = useState(false);

const handleLogin = () => {
setScreen("home");
setActiveNav("home");
};

const handleStreamClick = (stream) => {
setSelectedStream(stream);
setScreen("viewer");
};

const handleGoLiveClick = () => {
setScreen("creator");
setActiveNav("live");
};

const handleStartLive = () => {
setIsLive(true);
setScreen("viewer");
setSelectedStream(MOCK_STREAMS[0]);
};

const handleNavClick = (nav) => {
setActiveNav(nav);
if (nav === "home") setScreen("home");
else if (nav === "map") setScreen("map");
else if (nav === "live") setScreen("creator");
else if (nav === "profile") setScreen("profile");
};

const navItems = [
{ id: "home", icon: "🏠", label: "Home" },
{ id: "map", icon: "🌍", label: "Map" },
{ id: "profile", icon: "👤", label: "Profile" },
];

return (
<>
<style>{styles}</style>
<div className="app">
{screen !== "auth" && (
<nav className="sidebar">
<div className="sidebar-logo">M</div>
{navItems.map(item => (
<button
key={item.id}
className={`nav-btn ${activeNav === item.id ? "active" : ""}`}
onClick={() => handleNavClick(item.id)}
>
{item.icon}
<span className="nav-tooltip">{item.label}</span>
</button>
))}
<button
className="nav-btn go-live"
onClick={handleGoLiveClick}
>
🔴
<span className="nav-tooltip">Go Live</span>
</button>
<div className="nav-spacer" />
</nav>
)}

<div className="main">
{screen === "auth" && <AuthScreen onLogin={handleLogin} />}
{screen === "home" && (
<HomeScreen onStreamClick={handleStreamClick} onGoLive={handleGoLiveClick} />
)}
{screen === "map" && (
<MapScreen onStreamClick={handleStreamClick} />
)}
{screen === "viewer" && selectedStream && (
<ViewerScreen stream={selectedStream} onBack={() => { setScreen("home"); setActiveNav("home"); }} />
)}
{screen === "creator" && (
<CreatorScreen onGoLive={handleStartLive} />
)}
{screen === "profile" && <ProfileScreen />}
</div>
</div>
</>
);
}