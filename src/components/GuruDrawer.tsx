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

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GuruDrawer({ open, onClose }: Props) {
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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
      const res = await fetch("http://localhost:8000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          day_name: cfg.name,
          deity: cfg.deity
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        text: data.response || "Kshama karein, abhi uttar dene mein asmarth hoon.",
        shloka: data.mantra || undefined,
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
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 40,
          background: "rgba(0,0,0,0.6)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "100%", maxWidth: 440, zIndex: 50,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        background: `linear-gradient(160deg, ${cfg.color1}, ${cfg.color2})`,
        boxShadow: "-8px 0 40px rgba(0,0,0,0.5)",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(0,0,0,0.2)",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 22,
          }}>🧘</div>
          <div>
            <p style={{ color: "white", fontWeight: 500, fontSize: 16, margin: 0 }}>
              AI Pandit Live Pooja
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: 0 }}>
              ₹501 • 30 min session • {cfg.name} — {cfg.deity}
            </p>
          </div>
          <button onClick={onClose} style={{
            marginLeft: "auto", width: 34, height: 34,
            borderRadius: "50%", background: "rgba(255,255,255,0.15)",
            border: "none", color: "white", fontSize: 16,
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "16px 16px 8px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", maxWidth: "80%",
              alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
              alignItems: msg.type === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                padding: "10px 14px",
                borderRadius: 16,
                borderBottomRightRadius: msg.type === "user" ? 4 : 16,
                borderBottomLeftRadius: msg.type === "bot" ? 4 : 16,
                fontSize: 14, lineHeight: 1.6,
                background: msg.type === "user" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.3)",
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

          {/* Typing dots */}
          {loading && (
            <div style={{
              alignSelf: "flex-start",
              display: "flex", gap: 5,
              padding: "12px 16px", borderRadius: 16,
              borderBottomLeftRadius: 4,
              background: "rgba(0,0,0,0.25)",
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "rgba(255,255,255,0.7)",
                  display: "inline-block",
                  animation: `gurubounce 1.2s infinite ${i * 0.2}s`,
                }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick buttons */}
        <div style={{
          display: "flex", gap: 8, padding: "10px 16px",
          overflowX: "auto", background: "rgba(0,0,0,0.2)",
          scrollbarWidth: "none",
        }}>
          {quickQuestions.map(q => (
            <button key={q} onClick={() => !loading && askGuru(q)} style={{
              whiteSpace: "nowrap", fontSize: 12,
              color: "white", padding: "5px 12px",
              borderRadius: 20, cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.35)",
              background: "transparent",
            }}>
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          display: "flex", gap: 8, padding: "12px 16px",
          background: "rgba(0,0,0,0.25)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Apna prashn poochhen..."
            style={{
              flex: 1, borderRadius: 24,
              padding: "10px 16px", fontSize: 14,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white", outline: "none",
            }}
          />
          <button onClick={handleSend} disabled={loading} style={{
            width: 42, height: 42, borderRadius: "50%",
            background: loading ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.92)",
            border: "none", fontSize: 18,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>➤</button>
        </div>
      </div>

      <style>{`
        @keyframes gurubounce {
          0%,60%,100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        ::-webkit-scrollbar { width: 0; }
      `}</style>
    </>
  );
}