"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  text: string;
  shloka?: string;
  type: "user" | "bot";
  isStreaming?: boolean;
  time: string; // HH:MM format
}

const DAY_CFG: Record<number, { name: string; deity: string; color: string; emoji: string; greeting: string }> = {
  0: { name: "Ravivar",   deity: "Surya Dev",  color: "#E8600A", emoji: "☀️", greeting: "Jai Surya Dev! Aaj Ravivar hai — safalta ka din. Mujhse kuch bhi poochhen 🙏" },
  1: { name: "Somvar",    deity: "Shiv Ji",    color: "#6366f1", emoji: "🔱", greeting: "Om Namah Shivaya! Aaj Somvar hai. Shiv ji ki kripa aap par ho. Kya jaanna chahte hain?" },
  2: { name: "Mangalvar", deity: "Hanuman Ji", color: "#dc2626", emoji: "🙏", greeting: "Jai Bajrang Bali! Aaj Mangalvar hai — shakti ka din. Koi bhi sawaal poochhen!" },
  3: { name: "Budhvar",   deity: "Ganesh Ji",  color: "#16a34a", emoji: "🐘", greeting: "Jai Shri Ganesh! Aaj Budhvar hai — buddhi ka din. Har sawaal ka uttar dunga!" },
  4: { name: "Guruvar",   deity: "Vishnu Ji",  color: "#ca8a04", emoji: "🪷", greeting: "Jai Shri Hari! Aaj Guruvar hai. Kundli, rashifal, upay — kuch bhi poochhen 🙏" },
  5: { name: "Shukravar", deity: "Lakshmi Ji", color: "#db2777", emoji: "🌸", greeting: "Jai Maa Lakshmi! Aaj Shukravar hai — dhan aur sukh ka din. Kya guidance chahiye?" },
  6: { name: "Shanivar",  deity: "Shani Dev",  color: "#64748b", emoji: "⚖️", greeting: "Jai Shani Dev! Aaj Shanivar hai. Karma ka din — apna prashn puchhen 🙏" },
};

const QUICK_QS = [
  "Aaj ka rashifal?", "Lucky color batao", "Kundli mein koi dosh?",
  "Shubh muhurat kab?", "Konsa gemstone pahnu?", "Shani dasha ka upay?",
];

export default function PanditFloatChat() {
  const [open, setOpen]       = useState(false);
  const [pulse, setPulse]     = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(1);
  const bottomRef             = useRef<HTMLDivElement>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  const day = new Date().getDay();
  const cfg = DAY_CFG[day];

  const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  // Welcome message on mount
  useEffect(() => {
    setMessages([{
      id: "welcome",
      text: cfg.greeting,
      shloka: "~ Om Gam Ganapataye Namaha",
      type: "bot",
      time: now(),
    }]);
  }, [cfg.greeting]);

  // Auto-scroll only when chat is open
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Stop pulse after open
  useEffect(() => {
    if (open) { setPulse(false); setUnread(0); inputRef.current?.focus(); }
  }, [open]);

  // ESC to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), text: text.trim(), type: "user", time: now() };
    const botId = (Date.now() + 1).toString();
    const botPlaceholder: Message = { id: botId, text: "", type: "bot", isStreaming: true, time: now() };

    setMessages(prev => [...prev, userMsg, botPlaceholder]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://poojapath-backend.onrender.com/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          topic: "general",
          day_name: cfg.name,
          deity: cfg.deity,
        }),
      });

      if (!res.ok || !res.body) throw new Error("stream failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") continue;
          try {
            const parsed = JSON.parse(raw);
            full += parsed.token || "";
            setMessages(prev => prev.map(m => m.id === botId ? { ...m, text: full } : m));
          } catch { /* skip */ }
        }
      }

      // parse shloka
      let finalText = full;
      let shloka: string | undefined;
      if (full.includes("~Shloka:")) {
        const parts = full.split("~Shloka:");
        finalText = parts[0].trim();
        shloka = "~ " + parts[1].trim();
      }

      setMessages(prev => prev.map(m =>
        m.id === botId ? { ...m, text: finalText, shloka, isStreaming: false } : m
      ));
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === botId
          ? { ...m, text: "Kshama karein, connection mein takleef hai 🙏", isStreaming: false }
          : m
      ));
    }
    setLoading(false);
  }, [loading, cfg]);

  return (
    <>
      <style>{`
        /* ── Floating bubble ── */
        .pfc-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${cfg.color}, #8B2500);
          border: 2px solid rgba(255,255,255,0.15);
          box-shadow: 0 8px 32px ${cfg.color}60, 0 2px 8px rgba(0,0,0,0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s;
          animation: pfcEntry 0.6s 0.5s cubic-bezier(.34,1.56,.64,1) both;
        }
        .pfc-btn:hover {
          transform: scale(1.12) rotate(-8deg);
          box-shadow: 0 12px 40px ${cfg.color}80, 0 4px 12px rgba(0,0,0,0.6);
        }
        .pfc-btn.open-state {
          transform: scale(0.9) rotate(15deg);
        }

        /* Pulse ring */
        .pfc-pulse {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 998;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${cfg.color}30;
          animation: pfcPulse 2s ease-out infinite;
          pointer-events: none;
        }

        /* Unread badge */
        .pfc-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid #060302;
          font-size: 10px;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pfcBadge 0.4s cubic-bezier(.34,1.56,.64,1);
        }

        /* ── Chat window ── */
        .pfc-window {
          position: fixed;
          bottom: 96px;
          right: 24px;
          z-index: 998;
          width: 360px;
          height: 520px;
          background: rgba(6,3,2,0.98);
          border: 1px solid rgba(200,145,60,0.2);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(200,145,60,0.08);
          backdrop-filter: blur(30px);
          transform-origin: bottom right;
          transform: scale(0.5) translateY(20px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.35s cubic-bezier(.34,1.56,.64,1), opacity 0.25s ease;
        }
        .pfc-window.open {
          transform: scale(1) translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        /* Window header */
        .pfc-hd {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: linear-gradient(135deg, ${cfg.color}22, rgba(0,0,0,0));
          border-bottom: 1px solid rgba(200,145,60,0.1);
          flex-shrink: 0;
        }
        .pfc-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${cfg.color}, rgba(200,145,60,0.3));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: 0 0 16px ${cfg.color}50;
          animation: pfcAvatarFloat 3s ease-in-out infinite;
        }
        .pfc-hd-name { font-size: 13px; font-weight: 700; color: #FDF0DC; }
        .pfc-hd-status {
          font-size: 10px;
          color: #4ade80;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }
        .pfc-hd-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          animation: pfcLive 1.5s ease-in-out infinite;
          display: inline-block;
        }
        .pfc-close {
          margin-left: auto;
          width: 30px; height: 30px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(253,240,220,0.6);
          font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, color 0.2s;
        }
        .pfc-close:hover { background: rgba(255,80,80,0.15); color: #f87171; }

        /* Full-page link */
        .pfc-fulllink {
          font-size: 10px;
          color: ${cfg.color};
          text-decoration: none;
          padding: 0 2px;
          border-bottom: 1px dashed ${cfg.color}60;
          transition: opacity 0.2s;
        }
        .pfc-fulllink:hover { opacity: 0.7; }

        /* Messages */
        .pfc-msgs {
          flex: 1;
          overflow-y: auto;
          padding: 14px 14px 6px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
          scrollbar-color: rgba(200,145,60,0.15) transparent;
        }
        .pfc-msg-wrap {
          display: flex;
          flex-direction: column;
          max-width: 85%;
        }
        .pfc-msg-wrap.user { align-self: flex-end; align-items: flex-end; }
        .pfc-msg-wrap.bot  { align-self: flex-start; align-items: flex-start; }
        .pfc-bubble {
          padding: 10px 13px;
          border-radius: 18px;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .pfc-bubble.user {
          background: linear-gradient(135deg, ${cfg.color}35, rgba(180,70,8,0.25));
          border: 1px solid ${cfg.color}40;
          color: rgba(253,240,220,0.92);
          border-bottom-right-radius: 5px;
        }
        .pfc-bubble.bot {
          background: rgba(255,248,235,0.05);
          border: 1px solid rgba(200,145,60,0.12);
          color: rgba(253,240,220,0.88);
          border-bottom-left-radius: 5px;
        }
        .pfc-cursor {
          display: inline-block;
          width: 7px; height: 14px;
          background: ${cfg.color};
          border-radius: 2px;
          margin-left: 2px;
          vertical-align: middle;
          animation: pfcBlink 0.75s step-end infinite;
        }
        .pfc-shloka {
          font-size: 10px;
          font-style: italic;
          color: rgba(242,201,110,0.5);
          margin-top: 4px;
          padding: 0 4px;
        }
        .pfc-time {
          font-size: 9.5px;
          color: rgba(200,175,140,0.35);
          margin-top: 3px;
          padding: 0 4px;
          letter-spacing: 0.2px;
        }

        /* Typing dots */
        .pfc-dots { display: flex; gap: 4px; padding: 10px 14px; }
        .pfc-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(200,175,140,0.5);
        }
        .pfc-dot:nth-child(1) { animation: pfcBounce 1.2s ease infinite 0s; }
        .pfc-dot:nth-child(2) { animation: pfcBounce 1.2s ease infinite 0.2s; }
        .pfc-dot:nth-child(3) { animation: pfcBounce 1.2s ease infinite 0.4s; }

        /* Quick questions */
        .pfc-quick {
          display: flex;
          gap: 6px;
          padding: 6px 12px;
          overflow-x: auto;
          scrollbar-width: none;
          border-top: 1px solid rgba(200,145,60,0.07);
          flex-shrink: 0;
        }
        .pfc-q {
          white-space: nowrap;
          font-size: 10px;
          padding: 5px 11px;
          border-radius: 20px;
          border: 1px solid rgba(200,145,60,0.2);
          background: rgba(255,248,235,0.03);
          color: rgba(200,175,140,0.7);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .pfc-q:hover:not(:disabled) {
          background: rgba(200,145,60,0.1);
          border-color: rgba(200,145,60,0.4);
          color: rgba(253,240,220,0.9);
        }

        /* Input area */
        .pfc-input-wrap {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 10px 12px;
          border-top: 1px solid rgba(200,145,60,0.1);
          flex-shrink: 0;
          background: rgba(0,0,0,0.3);
        }
        .pfc-input {
          flex: 1;
          background: rgba(255,248,235,0.06);
          border: 1px solid rgba(200,145,60,0.2);
          border-radius: 22px;
          padding: 9px 14px;
          color: rgba(253,240,220,0.9);
          font-size: 13px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .pfc-input:focus { border-color: rgba(200,145,60,0.45); }
        .pfc-input::placeholder { color: rgba(200,175,140,0.35); }
        .pfc-send {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, ${cfg.color}, #8B2500);
          border: none;
          color: white; font-size: 15px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px ${cfg.color}50;
        }
        .pfc-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 6px 20px ${cfg.color}70; }
        .pfc-send:disabled { opacity: 0.4; cursor: not-allowed; }

        /* Keyframes */
        @keyframes pfcEntry {
          from { opacity: 0; transform: scale(0.5) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pfcPulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes pfcBadge {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }
        @keyframes pfcLive {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(1.5); }
        }
        @keyframes pfcAvatarFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        @keyframes pfcBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        @keyframes pfcBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%           { transform: translateY(-7px); }
        }

        @media (max-width: 480px) {
          .pfc-window {
            right: 0; bottom: 0;
            width: 100vw;
            height: 88vh;
            border-radius: 24px 24px 0 0;
            border-bottom: none;
          }
          .pfc-btn { bottom: 16px; right: 16px; }
          .pfc-pulse { bottom: 16px; right: 16px; }
        }
      `}</style>

      {/* Pulse ring (shown before first open) */}
      {pulse && !open && <div className="pfc-pulse" />}

      {/* Floating button */}
      <button
        className={`pfc-btn${open ? " open-state" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Chat with Pandit Ji"
        id="pandit-chat-fab"
      >
        {open ? "✕" : "🧘"}
        {!open && unread > 0 && (
          <span className="pfc-badge">{unread}</span>
        )}
      </button>

      {/* Chat window */}
      <div className={`pfc-window${open ? " open" : ""}`} id="pandit-chat-window">

        {/* Header */}
        <div className="pfc-hd">
          <div className="pfc-avatar">{cfg.emoji}</div>
          <div>
            <div className="pfc-hd-name">Pandit Ji {cfg.emoji}</div>
            <div className="pfc-hd-status">
              <span className="pfc-hd-dot" />
              Online • {cfg.deity} ka din
            </div>
          </div>
          <a href="/pandit" className="pfc-fulllink" title="Open full chatbot">↗ Full Chat</a>
          <button className="pfc-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        {/* Messages */}
        <div className="pfc-msgs">
          {messages.map(msg => (
            <div key={msg.id} className={`pfc-msg-wrap ${msg.type}`}>
              <div className={`pfc-bubble ${msg.type}`}>
                {msg.text}
                {msg.isStreaming && msg.text && <span className="pfc-cursor" />}
              </div>
              {msg.shloka && <div className="pfc-shloka">{msg.shloka}</div>}
              <div className="pfc-time">{msg.time}</div>
            </div>
          ))}

          {/* Typing dots when stream hasn't started yet */}
          {loading && messages[messages.length - 1]?.text === "" && (
            <div className="pfc-msg-wrap bot">
              <div className="pfc-bubble bot pfc-dots">
                <div className="pfc-dot" />
                <div className="pfc-dot" />
                <div className="pfc-dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        <div className="pfc-quick">
          {QUICK_QS.map(q => (
            <button
              key={q}
              className="pfc-q"
              disabled={loading}
              onClick={() => sendMessage(q)}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="pfc-input-wrap">
          <input
            ref={inputRef}
            className="pfc-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendMessage(input); } }}
            placeholder="Apna prashn puchhen... 🙏"
            disabled={loading}
            id="pandit-chat-input"
          />
          <button
            className="pfc-send"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            {loading ? "⏳" : "➤"}
          </button>
        </div>
      </div>
    </>
  );
}
