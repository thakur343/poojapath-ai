"use client";
import { useEffect, useRef, useState } from "react";

const dayConfig: Record<number, {
  name: string; deity: string;
  color1: string; color2: string; greeting: string;
}> = {
  0: { name: "Ravivar",   deity: "Surya Dev",  color1: "#e65c00", color2: "#f9d423", greeting: "Jai Surya Dev! Aaj Ravivar hai — safalta aur tej ka din." },
  1: { name: "Somvar",    deity: "Shiv ji",     color1: "#1a1a2e", color2: "#16213e", greeting: "Om Namah Shivaya! Aaj Somvar hai — Shiv ji ki aradhana ka pavitra din." },
  2: { name: "Mangalvar", deity: "Hanuman ji",  color1: "#b31217", color2: "#e52d27", greeting: "Jai Bajrang Bali! Aaj Mangalvar hai — shakti aur sahas ka din." },
  3: { name: "Budhvar",   deity: "Ganesh ji",   color1: "#134e5e", color2: "#71b280", greeting: "Jai Shri Ganesh! Aaj Budhvar hai — buddhi aur gyaan ka din." },
  4: { name: "Guruvar",   deity: "Vishnu ji",   color1: "#f7971e", color2: "#ffd200", greeting: "Jai Shri Hari! Aaj Guruvar hai — guru aur Vishnu ji ki kripa ka din." },
  5: { name: "Shukravar", deity: "Lakshmi ji",  color1: "#e91e8c", color2: "#f06292", greeting: "Jai Maa Lakshmi! Aaj Shukravar hai — dhan aur soundarya ka din." },
  6: { name: "Shanivar",  deity: "Shani Dev",   color1: "#232526", color2: "#414345", greeting: "Jai Shani Dev! Aaj Shanivar hai — karma aur nyay ka din." },
};

interface Message {
  text: string;
  shloka?: string;
  type: "user" | "bot";
}

export default function GuruPage() {
  const day = new Date().getDay();
  const cfg = dayConfig[day];

  const [messages, setMessages] = useState<Message[]>([
    { text: cfg.greeting, shloka: "~ Om Shanti Shanti Shantih", type: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const quickQuestions = [
    "Shubh Muhurat batao",
    "Karma kya hai",
    "Anxiety dur karo",
    "Aaj ka lucky color",
    "Om Namah Shivaya arth",
    "Peace mantra do",
  ];

  async function askGuru(userMsg: string) {
    setMessages(prev => [...prev, { text: userMsg, type: "user" }]);
    setLoading(true);
    try {
      const res = await fetch("/api/guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are AI Guru — a wise, warm spiritual guide for PoojaPath.ai. Today is ${cfg.name}, the day of ${cfg.deity}. Reply in simple Hinglish (mix of Hindi and English). Keep answers short (2-4 sentences). Always end with a relevant Sanskrit shloka or mantra on a new line starting with "~Shloka: ". Be compassionate and uplifting. Reference today's deity (${cfg.deity}) when relevant.`,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      const full = data.content?.[0]?.text || "Kshama karein, abhi uttar dene mein asmarth hoon.";
      const parts = full.split("~Shloka:");
      setMessages(prev => [...prev, {
        text: parts[0].trim(),
        shloka: parts[1] ? "~ " + parts[1].trim() : undefined,
        type: "bot",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        text: "Kshama karein, connection mein samasya hai. Dobara prayas karein.",
        type: "bot",
      }]);
    }
    setLoading(false);
  }

  function handleSend() {
    const txt = input.trim();
    if (!txt || loading) return;
    setInput("");
    askGuru(txt);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${cfg.color1}, ${cfg.color2})`,
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "16px 20px",
        background: "rgba(0,0,0,0.2)",
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 24,
        }}>🧘</div>
        <div>
          <p style={{ color: "white", fontWeight: 600, fontSize: 17, margin: 0 }}>
            AI Guru
          </p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: 0, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4eff91", display: "inline-block" }} />
            Online • {cfg.name} — {cfg.deity}
          </p>
        </div>
        <div style={{
          marginLeft: "auto", fontSize: 12, color: "white",
          padding: "4px 12px", borderRadius: 20,
          background: "rgba(255,255,255,0.2)",
        }}>
          🪔 PoojaPath.ai
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "16px", display: "flex",
        flexDirection: "column", gap: 12,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column",
            maxWidth: "75%",
            alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
            alignItems: msg.type === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              padding: "10px 15px",
              borderRadius: 18,
              borderBottomRightRadius: msg.type === "user" ? 4 : 18,
              borderBottomLeftRadius: msg.type === "bot" ? 4 : 18,
              fontSize: 14, lineHeight: 1.6,
              background: msg.type === "user"
                ? "rgba(255,255,255,0.92)"
                : "rgba(0,0,0,0.3)",
              color: msg.type === "user" ? "#1a1a1a" : "#ffffff",
            }}>
              {msg.text}
            </div>
            {msg.shloka && (
              <p style={{
                fontSize: 11, marginTop: 4,
                fontStyle: "italic",
                color: "rgba(255,255,255,0.65)",
              }}>
                {msg.shloka}
              </p>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{
            alignSelf: "flex-start",
            display: "flex", gap: 5,
            padding: "12px 16px",
            borderRadius: 18, borderBottomLeftRadius: 4,
            background: "rgba(0,0,0,0.25)",
          }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
                display: "inline-block",
                animation: `bounce 1.2s infinite ${i * 0.2}s`,
              }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick buttons */}
      <div style={{
        display: "flex", gap: 8,
        padding: "10px 16px",
        overflowX: "auto",
        background: "rgba(0,0,0,0.2)",
        scrollbarWidth: "none",
      }}>
        {quickQuestions.map(q => (
          <button key={q}
            onClick={() => !loading && askGuru(q)}
            style={{
              whiteSpace: "nowrap", fontSize: 12,
              color: "white", padding: "6px 14px",
              borderRadius: 20, cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.35)",
              background: "transparent",
            }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div style={{
        display: "flex", gap: 10,
        padding: "12px 16px",
        background: "rgba(0,0,0,0.25)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Apna prashn poochhen..."
          style={{
            flex: 1, borderRadius: 25,
            padding: "11px 18px", fontSize: 14,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white", outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: loading
              ? "rgba(255,255,255,0.4)"
              : "rgba(255,255,255,0.92)",
            border: "none", fontSize: 18,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center",
            justifyContent: "center",
          }}>
          ➤
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        input::placeholder { color: rgba(255,255,255,0.5); }
        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>
    </div>
  );
}
