"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  text: string;
  shloka?: string;
  type: "user" | "bot";
  topic?: string;
  isStreaming?: boolean;
}

const TOPICS = [
  { id: "kundli", icon: "📜", label: "Janam Kundli", desc: "Birth chart & planetary positions" },
  { id: "rashifal", icon: "⭐", label: "Rashifal", desc: "Daily horoscope by zodiac sign" },
  { id: "numerology", icon: "🔢", label: "Numerology", desc: "Lucky numbers & name analysis" },
  { id: "vastu", icon: "🏠", label: "Vastu Shastra", desc: "Home & office energy alignment" },
  { id: "gemstone", icon: "💎", label: "Ratna (Gemstone)", desc: "Suitable gem for your rashi" },
  { id: "mantra", icon: "🕉️", label: "Mantra Siddhi", desc: "Personalized mantra guidance" },
  { id: "marriage", icon: "💍", label: "Vivah Yog", desc: "Marriage compatibility & timing" },
  { id: "career", icon: "💼", label: "Career & Money", desc: "Business, job & wealth guidance" },
  { id: "health", icon: "🌿", label: "Arogya", desc: "Health predictions & remedies" },
  { id: "muhurat", icon: "⏰", label: "Shubh Muhurat", desc: "Auspicious timing for events" },
  { id: "palmistry", icon: "🖐️", label: "Hastrekha", desc: "Palm reading & life line" },
  { id: "tarot", icon: "🃏", label: "Tarot Cards", desc: "Tarot guidance & future reading" },
  { id: "remedy", icon: "🙏", label: "Upay & Remedy", desc: "Dosh nivaran & puja remedies" },
  { id: "panchang", icon: "📅", label: "Panchang", desc: "Today's auspicious timings" },
];

const QUICK_QUESTIONS: Record<string, string[]> = {
  kundli: ["Meri kundli mein kaunsa dosh hai?", "Mera ascendant kya hai?", "Shani dasha kab khatam hogi?"],
  rashifal: ["Aaj ka rashifal batao", "Is hafte ka bhavishya?", "Is mahine kya hoga?"],
  numerology: ["Mera lucky number kya hai?", "Mera naam sahi hai?", "Lucky color batao"],
  vastu: ["Bedroom kahan hona chahiye?", "Ghar ka mandir kahan rakhe?", "North-East ka mahatva?"],
  gemstone: ["Mujhe kaunsa gemstone pahenna chahiye?", "Ruby ya Pearl - kaunsa better?", "Gemstone kaise pahenne?"],
  mantra: ["Sukh ke liye mantra batao", "Shani ke liye mantra?", "Career ke liye mantra?"],
  marriage: ["Meri shadi kab hogi?", "Love marriage ya arranged?", "Kundli milan kaise hota hai?"],
  career: ["Mera career kab achha hoga?", "Business shuru karna chahiye?", "Job change karna chahiye?"],
  health: ["Health ka upay batao", "Kaunsa yoga achha hai?", "Diet ke liye guidance?"],
  muhurat: ["Griha pravesh ke liye muhurat?", "Vivah muhurat 2025?", "Aaj ka shubh muhurat?"],
  palmistry: ["Life line ke baare mein batao", "Heart line kya batati hai?", "Hath dekh ke bhavishya?"],
  tarot: ["Love ke baare mein tarot?", "Career guidance chahiye", "Past, present, future batao"],
  remedy: ["Mangal dosh ka upay?", "Kaal sarp dosh kya hai?", "Puja se problem solve hogi?"],
  panchang: ["Aaj ka panchang kya hai?", "Aaj Rahu Kaal kab hai?", "Shubh nakshatra kaunsa hai?"],
};

const DAY_CONFIG: Record<number, { name: string; deity: string; color: string }> = {
  0: { name: "Ravivar", deity: "Surya Dev", color: "#E8600A" },
  1: { name: "Somvar", deity: "Shiv ji", color: "#6366f1" },
  2: { name: "Mangalvar", deity: "Hanuman ji", color: "#dc2626" },
  3: { name: "Budhvar", deity: "Ganesh ji", color: "#16a34a" },
  4: { name: "Guruvar", deity: "Vishnu ji", color: "#ca8a04" },
  5: { name: "Shukravar", deity: "Lakshmi ji", color: "#db2777" },
  6: { name: "Shanivar", deity: "Shani Dev", color: "#475569" },
};

export default function PanditPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string>("kundli");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const day = new Date().getDay();
  const cfg = DAY_CONFIG[day];

  const addWelcomeMessage = useCallback(() => {
    const topic = TOPICS.find(t => t.id === "kundli");
    setMessages([{
      id: "welcome",
      text: `Jai Shri Ram! Main hun Pandit Ji — aapka AI Jyotish Guru. Aaj ${cfg.name} hai, ${cfg.deity} ka pavitra din.\n\nMain aapki madad kar sakta hun:\n• Kundli & Rashifal\n• Vastu & Numerology\n• Vivah Yog & Career\n• Mantra & Remedies\n• Tarot & Palmistry\n\nKaunse vishay par guidance chahiye? Neeche topic select karein ya seedha puchh lijiye!`,
      shloka: `~ Om Namah Shivaya — May ${cfg.deity} guide your path today`,
      type: "bot",
      topic: topic?.id,
    }]);
  }, [cfg]);

  useEffect(() => {
    addWelcomeMessage();
  }, [addWelcomeMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      type: "user",
      topic: activeTopic,
    };

    const botMsgId = (Date.now() + 1).toString();
    const botPlaceholder: Message = {
      id: botMsgId,
      text: "",
      type: "bot",
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, botPlaceholder]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://poojapath-backend.onrender.com/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          topic: activeTopic,
          day_name: cfg.name,
          deity: cfg.deity,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const token = parsed.token || "";
              fullText += token;
              setMessages(prev => prev.map(m =>
                m.id === botMsgId ? { ...m, text: fullText, isStreaming: true } : m
              ));
            } catch {
              // skip unparseable chunks
            }
          }
        }
      }

      // Parse shloka from final text
      let finalText = fullText;
      let shloka: string | undefined;
      if (fullText.includes("~Shloka:")) {
        const parts = fullText.split("~Shloka:");
        finalText = parts[0].trim();
        shloka = "~ " + parts[1].trim();
      }

      setMessages(prev => prev.map(m =>
        m.id === botMsgId ? { ...m, text: finalText, shloka, isStreaming: false } : m
      ));
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === botMsgId
          ? { ...m, text: "Kshama karein, connection mein samasya hai. Thodi der mein dobara prayas karein.", isStreaming: false }
          : m
      ));
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060302",
      color: "#FDF0DC",
      fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        borderBottom: "1px solid rgba(200,145,60,0.15)",
        background: "rgba(6,3,2,0.95)",
        backdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <a href="/" style={{ color: "rgba(200,175,140,0.6)", textDecoration: "none", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          ← Home
        </a>
        <div style={{ width: 1, height: 20, background: "rgba(200,145,60,0.2)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: `linear-gradient(135deg, ${cfg.color}, rgba(200,145,60,0.4))`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: `0 0 20px ${cfg.color}40`,
          }}>🧘</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FDF0DC" }}>Pandit Ji AI</div>
            <div style={{ fontSize: 10, color: "#4ade80", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "livePulse 1.5s infinite" }} />
              Online • {cfg.name} — {cfg.deity}
            </div>
          </div>
        </div>

        {/* Topic switcher for mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            marginLeft: "auto", background: "rgba(232,96,10,0.1)", border: "1px solid rgba(232,96,10,0.2)",
            color: "#F5841F", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer",
          }}
        >
          {sidebarOpen ? "✕ Topics" : "☰ Topics"}
        </button>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 62px)" }}>

        {/* Sidebar — Topics */}
        {sidebarOpen && (
          <aside style={{
            width: 260,
            minWidth: 260,
            borderRight: "1px solid rgba(200,145,60,0.12)",
            background: "rgba(8,4,2,0.85)",
            overflowY: "auto",
            backdropFilter: "blur(10px)",
            padding: "12px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(200,175,140,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 8px 8px" }}>
              Select Topic
            </div>
            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 12, cursor: "pointer",
                  border: activeTopic === topic.id ? "1px solid rgba(232,96,10,0.4)" : "1px solid transparent",
                  background: activeTopic === topic.id ? "rgba(232,96,10,0.1)" : "transparent",
                  color: activeTopic === topic.id ? "#F5841F" : "rgba(200,175,140,0.6)",
                  textAlign: "left", transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 18, minWidth: 24 }}>{topic.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{topic.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{topic.desc}</div>
                </div>
              </button>
            ))}

            {/* Groq Badge */}
            <div style={{ marginTop: "auto", padding: "12px 8px 4px" }}>
              <div style={{
                background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)",
                borderRadius: 10, padding: "10px 12px", fontSize: 10, color: "rgba(200,175,140,0.5)",
                lineHeight: 1.6,
              }}>
                <div style={{ color: "#10b981", fontWeight: 600, marginBottom: 4 }}>⚡ Powered by</div>
                Groq AI (Llama 3.3 70B)<br />
                Fallback: Ollama Local AI<br />
                System: Vedic Knowledge Base
              </div>
            </div>
          </aside>
        )}

        {/* Main Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Active Topic Bar */}
          <div style={{
            padding: "8px 20px",
            borderBottom: "1px solid rgba(200,145,60,0.08)",
            background: "rgba(6,3,2,0.6)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            {(() => {
              const t = TOPICS.find(t => t.id === activeTopic);
              return t ? (
                <>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(253,240,220,0.9)" }}>{t.label}</span>
                  <span style={{ fontSize: 11, color: "rgba(200,175,140,0.4)" }}>— {t.desc}</span>
                </>
              ) : null;
            })()}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.type === "user" ? "flex-end" : "flex-start",
                gap: 6,
                maxWidth: "80%",
                alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
              }}>
                {msg.type === "bot" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${cfg.color}, rgba(200,145,60,0.4))`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14,
                    }}>🧘</div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>Pandit Ji</span>
                  </div>
                )}
                <div style={{
                  padding: "12px 16px",
                  borderRadius: msg.type === "user" ? "20px 20px 4px 20px" : "4px 20px 20px 20px",
                  background: msg.type === "user"
                    ? "linear-gradient(135deg, rgba(232,96,10,0.25), rgba(184,74,8,0.2))"
                    : "rgba(255,248,235,0.04)",
                  border: msg.type === "user"
                    ? "1px solid rgba(232,96,10,0.3)"
                    : "1px solid rgba(200,145,60,0.12)",
                  fontSize: 14, lineHeight: 1.7,
                  color: "rgba(253,240,220,0.9)",
                  whiteSpace: "pre-wrap",
                  backdropFilter: "blur(8px)",
                  position: "relative",
                }}>
                  {msg.text}
                  {msg.isStreaming && (
                    <span style={{
                      display: "inline-block", width: 8, height: 16, background: "#E8600A",
                      marginLeft: 3, borderRadius: 2, animation: "blink 0.8s infinite",
                      verticalAlign: "middle",
                    }} />
                  )}
                </div>
                {msg.shloka && (
                  <div style={{
                    fontSize: 12, fontStyle: "italic", color: "rgba(242,201,110,0.65)",
                    padding: "6px 14px",
                    fontFamily: "var(--font-tiro), serif",
                  }}>
                    {msg.shloka}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && messages[messages.length - 1]?.isStreaming === true && messages[messages.length - 1]?.text === "" && (
              <div style={{ display: "flex", gap: 6, padding: "12px 16px", background: "rgba(255,248,235,0.04)", border: "1px solid rgba(200,145,60,0.12)", borderRadius: "4px 20px 20px 20px", width: "fit-content" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "rgba(200,175,140,0.5)",
                    animation: `bounce 1.2s infinite ${i * 0.2}s`,
                  }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Questions */}
          <div style={{
            padding: "8px 16px",
            borderTop: "1px solid rgba(200,145,60,0.08)",
            display: "flex", gap: 8, overflowX: "auto",
            scrollbarWidth: "none",
          }}>
            {(QUICK_QUESTIONS[activeTopic] || []).map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                disabled={loading}
                style={{
                  whiteSpace: "nowrap",
                  padding: "6px 14px",
                  borderRadius: 20, fontSize: 11,
                  border: "1px solid rgba(200,145,60,0.2)",
                  background: "rgba(255,248,235,0.03)",
                  color: "rgba(200,175,140,0.7)",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(200,145,60,0.12)",
            background: "rgba(6,3,2,0.9)",
            display: "flex", gap: 10, alignItems: "flex-end",
          }}>
            <div style={{ flex: 1, position: "relative" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`${TOPICS.find(t => t.id === activeTopic)?.icon || "🙏"} Apna prashn puchhen... (Enter to send, Shift+Enter for new line)`}
                disabled={loading}
                rows={1}
                style={{
                  width: "100%",
                  background: "rgba(255,248,235,0.05)",
                  border: "1px solid rgba(200,145,60,0.2)",
                  borderRadius: 16,
                  padding: "12px 16px",
                  color: "rgba(253,240,220,0.9)",
                  fontSize: 14,
                  outline: "none",
                  resize: "none",
                  lineHeight: 1.5,
                  fontFamily: "inherit",
                  maxHeight: 120,
                  overflowY: "auto",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 46, height: 46, borderRadius: "50%",
                background: loading || !input.trim()
                  ? "rgba(200,145,60,0.15)"
                  : `linear-gradient(135deg, ${cfg.color}, #B84A08)`,
                border: "none",
                color: "white",
                fontSize: 18,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s",
                flexShrink: 0,
                boxShadow: loading || !input.trim() ? "none" : `0 4px 20px ${cfg.color}40`,
              }}
            >
              {loading ? "⏳" : "➤"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(200,145,60,0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
}
