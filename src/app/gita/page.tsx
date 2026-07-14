"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import gitaData from "@/lib/gita.json";

interface Verse {
  verse_number: number;
  sanskrit: string;
  transliteration: string;
  translation_english: string;
  translation_hindi: string;
  explanation: string;
}

interface Chapter {
  chapter_number: number;
  name_sanskrit: string;
  name_translation: string;
  name_hindi: string;
  summary: string;
  verses?: Verse[];
}

export default function GitaPage() {
  const [selectedChIndex, setSelectedChIndex] = useState(1); // 2nd Chapter (Sankhya Yoga) as default
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | null>(47); // Verse 47 as default
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [daanModalOpen, setDaanModalOpen] = useState(false);
  const [daanSelected, setDaanSelected] = useState<string | null>(null);
  const [daanMessage, setDaanMessage] = useState("");

  const chapter: Chapter = gitaData.chapters[selectedChIndex];
  const verses: Verse[] = chapter.verses || [];
  const selectedVerse = verses.find(v => v.verse_number === selectedVerseNum) || verses[0] || null;

  // Sync default verse when chapter changes
  useEffect(() => {
    const ch = gitaData.chapters[selectedChIndex];
    if (ch.verses && ch.verses.length > 0) {
      setSelectedVerseNum(ch.verses[0].verse_number);
    } else {
      setSelectedVerseNum(null);
    }
    setChatOpen(false);
    setChatMessages([]);
  }, [selectedChIndex]);

  const handleAskPanditJi = async () => {
    if (!selectedVerse) return;
    setChatOpen(true);
    if (chatMessages.length > 0) return; // Already initialized

    const systemPrompt = `Pranam! I want to understand the deep spiritual meaning of Shloka ${selectedVerse.verse_number} from Chapter ${chapter.chapter_number} (${chapter.name_translation} - ${chapter.name_sanskrit}) of the Bhagavad Gita.
The Shloka is:
"${selectedVerse.sanskrit}"

Transliteration:
"${selectedVerse.transliteration}"

Hindi Translation:
"${selectedVerse.translation_hindi}"

English Translation:
"${selectedVerse.translation_english}"`;

    setLoadingAnswer(true);
    setChatMessages([{ role: "user", content: `Pandit Ji, please explain Bhagavad Gita Chapter ${chapter.chapter_number}, Verse ${selectedVerse.verse_number} to me.` }]);

    try {
      const response = await fetch("https://poojapath-backend.onrender.com/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Explain this Gita verse in depth with practical life application: Ch ${chapter.chapter_number} Verse ${selectedVerse.verse_number}. Text: ${selectedVerse.sanskrit}. Meaning: ${selectedVerse.translation_hindi}`,
          topic: "general",
          history: []
        })
      });
      const data = await response.json();
      const answer = data.response + (data.mantra ? `\n\n${data.mantra}` : "");
      setChatMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Kshama karein balak, is samay main antarikshiy tarango se nahi jud pa raha hu. Kripya thodi der baad prayas karein. Jai Shri Krishna!" }]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || loadingAnswer) return;

    const newMessages = [...chatMessages, { role: "user" as const, content: userQuery }];
    setChatMessages(newMessages);
    setUserQuery("");
    setLoadingAnswer(true);

    try {
      const historyPayload = newMessages.slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      }));

      const response = await fetch("https://poojapath-backend.onrender.com/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userQuery,
          topic: "general",
          history: historyPayload
        })
      });
      const data = await response.json();
      const answer = data.response + (data.mantra ? `\n\n${data.mantra}` : "");
      setChatMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Kshama karein, sanket kamzor hai. Kripya punah prayas karein." }]);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const submitDaan = (option: string) => {
    setDaanSelected(option);
    setDaanMessage("Dhanya ho! Aapka sankalp sweekar kiya gaya. Shrimad Bhagavad Gita ka gyaan aapko sadbuddhi pradaan karein. 🙏");
    setTimeout(() => {
      setDaanModalOpen(false);
      setDaanSelected(null);
      setDaanMessage("");
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-bg text-cream flex flex-col font-sans">
      {/* Header */}
      <header className="kundli-header px-6 py-4 flex items-center justify-between border-b border-brd bg-deep/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="kundli-back text-sm text-s hover:text-sl transition-all font-semibold">
            ← Back to PoojaPath
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-s to-gl bg-clip-text text-transparent">
            Shrimad Bhagavad Gita
          </h1>
        </div>
        <div className="text-xs text-mut font-medium uppercase tracking-widest hidden md:block">
          The Song of God
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar - Chapter & Verse Picker */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Chapter Selector */}
          <div className="bg-card-bg border border-brd rounded-2xl p-5 backdrop-blur-md">
            <h2 className="text-xs text-mut uppercase font-bold tracking-widest mb-3">Select Adhyaya (Chapter)</h2>
            <select
              className="w-full bg-deep/80 border border-brd rounded-xl px-3 py-2.5 text-cream text-sm outline-none focus:border-s transition-all cursor-pointer"
              value={selectedChIndex}
              onChange={(e) => setSelectedChIndex(parseInt(e.target.value))}
            >
              {gitaData.chapters.map((ch, idx) => (
                <option key={ch.chapter_number} value={idx}>
                  Ch {ch.chapter_number}: {ch.name_sanskrit} ({ch.name_translation})
                </option>
              ))}
            </select>
            
            <div className="mt-4 p-4 bg-deep/40 rounded-xl border border-brd/50">
              <h3 className="text-xs font-bold text-gl uppercase tracking-wider mb-1">Adhyaya Summary</h3>
              <p className="text-xs text-mut leading-relaxed">{chapter.summary}</p>
            </div>
          </div>

          {/* Verses List */}
          <div className="bg-card-bg border border-brd rounded-2xl p-5 backdrop-blur-md flex-1 min-h-[300px]">
            <h2 className="text-xs text-mut uppercase font-bold tracking-widest mb-3">Verses Available</h2>
            {verses.length > 0 ? (
              <div className="grid grid-cols-4 gap-2.5">
                {verses.map(v => (
                  <button
                    key={v.verse_number}
                    onClick={() => setSelectedVerseNum(v.verse_number)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedVerseNum === v.verse_number
                        ? "bg-s border-s text-white shadow-md shadow-s/20 scale-95"
                        : "bg-deep/50 border-brd hover:border-gl/60 text-mut hover:text-cream"
                    }`}
                  >
                    V {v.verse_number}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-xs text-mut py-8">
                Detailed shlokas coming soon. Choose Chapters 1, 2, 3, 4, 6, 9, 15, or 18 for popular shlokas!
              </div>
            )}
          </div>
        </section>

        {/* Right Area - Shloka Content & Pandit Ji Chat */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          
          {selectedVerse ? (
            <>
              {/* Shloka Card - styled like an ancient patra/manuscript */}
              <div className="relative bg-gradient-to-b from-[#1c1109] to-[#251710] border-l-4 border-r-4 border-gl/60 rounded-xl p-8 shadow-xl overflow-hidden">
                {/* Scroll Rollers */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8a5a16] via-[#ffeaa7] to-[#8a5a16]" />
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8a5a16] via-[#ffeaa7] to-[#8a5a16]" />
                
                <div className="text-center mb-6">
                  <div className="text-gl font-bold uppercase tracking-widest text-[10px] mb-1">
                    Shrimad Bhagavad Gita
                  </div>
                  <h3 className="text-cream font-bold text-lg font-cormorant">
                    Chapter {chapter.chapter_number}, Shloka {selectedVerse.verse_number}
                  </h3>
                </div>

                {/* Sanskrit Verse */}
                <div className="text-center bg-[#150a04]/40 border border-gl/15 rounded-xl py-6 px-4 my-6">
                  <p className="font-tiro text-2xl text-gl font-medium whitespace-pre-line leading-relaxed tracking-wider">
                    {selectedVerse.sanskrit}
                  </p>
                </div>

                {/* Transliteration */}
                <div className="text-center mb-8 px-4">
                  <p className="text-xs text-mut italic leading-relaxed tracking-wide">
                    {selectedVerse.transliteration}
                  </p>
                </div>

                {/* Translations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brd/40">
                  <div>
                    <h4 className="text-[10px] font-bold text-gl uppercase tracking-widest mb-1.5">हिंदी अनुवाद</h4>
                    <p className="text-xs text-cream/90 leading-relaxed font-tiro font-light">
                      {selectedVerse.translation_hindi}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gl uppercase tracking-widest mb-1.5">English Translation</h4>
                    <p className="text-xs text-cream/90 leading-relaxed font-light">
                      {selectedVerse.translation_english}
                    </p>
                  </div>
                </div>

                {/* Quick Commentary */}
                <div className="mt-6 p-4 bg-deep/40 rounded-xl border border-brd/40">
                  <h4 className="text-[10px] font-bold text-s uppercase tracking-widest mb-1">Pandit Ji's Brief Glimpse</h4>
                  <p className="text-xs text-mut leading-relaxed font-light">{selectedVerse.explanation}</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={handleAskPanditJi}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-s to-sl text-white font-bold text-xs shadow-lg shadow-s/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider flex items-center gap-2"
                  >
                    <span>🕉️</span> Ask Pandit Ji to Explain In-Depth
                  </button>
                  <button
                    onClick={() => setDaanModalOpen(true)}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-gl to-[#c9922b] text-white font-bold text-xs shadow-lg shadow-gl/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-wider flex items-center gap-2"
                  >
                    <span>🪙</span> Perform Daan
                  </button>
                </div>
              </div>

              {/* Pandit Ji AI Chat Box */}
              {chatOpen && (
                <div className="bg-card-bg border border-brd rounded-2xl p-5 backdrop-blur-md flex flex-col h-[400px]">
                  <div className="flex items-center justify-between pb-3 border-b border-brd mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="font-bold text-sm text-cream">Jyotish Pandit Commentary</div>
                    </div>
                    <button
                      onClick={() => setChatOpen(false)}
                      className="text-xs text-mut hover:text-cream transition-all"
                    >
                      Close Chat
                    </button>
                  </div>

                  {/* Chat messages stream */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-brd">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-s text-white rounded-tr-none"
                              : "bg-deep/80 border border-brd text-cream rounded-tl-none whitespace-pre-wrap"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {loadingAnswer && (
                      <div className="flex justify-start">
                        <div className="bg-deep/80 border border-brd rounded-2xl rounded-tl-none px-4 py-3 text-xs text-mut flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-gl rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-gl rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-gl rounded-full animate-bounce [animation-delay:0.4s]" />
                          <span>Pandit Ji vichar kar rahe hain...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask any question about this verse..."
                      value={userQuery}
                      onChange={e => setUserQuery(e.target.value)}
                      className="flex-1 bg-deep/80 border border-brd rounded-xl px-4 py-2.5 text-xs text-cream outline-none focus:border-s transition-all"
                    />
                    <button
                      type="submit"
                      disabled={loadingAnswer || !userQuery.trim()}
                      className="px-4 py-2 bg-s hover:bg-sl text-white font-bold text-xs rounded-xl disabled:opacity-40 transition-all uppercase"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="bg-card-bg border border-brd rounded-2xl p-8 text-center text-mut text-sm">
              Please select a chapter and verse to read.
            </div>
          )}
        </section>

      </main>

      {/* Daan Traditional Brass Thal Modal */}
      {daanModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={(e) => { if(e.target === e.currentTarget) setDaanModalOpen(false); }}>
          <div className="bg-gradient-to-b from-[#2a1708] to-[#1c0f05] border-2 border-gl rounded-2xl p-6 max-w-sm w-full text-center relative shadow-2xl">
            <button className="absolute top-3 right-3 text-mut hover:text-cream text-lg" onClick={() => setDaanModalOpen(false)}>✕</button>
            
            <div className="text-gl font-bold text-sm uppercase tracking-wider mb-2">🪙 Devotion Offering (Daan) 🪙</div>
            <p className="text-xs text-mut mb-6 leading-relaxed">
              Complete your study of Shrimad Bhagavad Gita with a symbolic offering in your mind, supporting spiritual welfare.
            </p>

            {daanMessage ? (
              <div className="p-4 bg-s/10 border border-s/30 rounded-xl text-xs text-gl leading-relaxed font-semibold animate-pulse">
                {daanMessage}
              </div>
            ) : (
              <div className="space-y-3.5">
                <button
                  onClick={() => submitDaan("Gau Seva")}
                  className="w-full py-3 px-4 bg-deep/80 hover:bg-s/20 border border-brd hover:border-gl rounded-xl text-left flex justify-between items-center text-xs font-semibold text-cream transition-all"
                >
                  <span>🐄 Gau Seva (Feed Holy Cows)</span>
                  <span className="text-gl">₹51</span>
                </button>
                <button
                  onClick={() => submitDaan("Kashi Diya")}
                  className="w-full py-3 px-4 bg-deep/80 hover:bg-s/20 border border-brd hover:border-gl rounded-xl text-left flex justify-between items-center text-xs font-semibold text-cream transition-all"
                >
                  <span>🪔 Light Diya at Ganga Ghat (Kashi)</span>
                  <span className="text-gl">₹101</span>
                </button>
                <button
                  onClick={() => submitDaan("Gurukul")}
                  className="w-full py-3 px-4 bg-deep/80 hover:bg-s/20 border border-brd hover:border-gl rounded-xl text-left flex justify-between items-center text-xs font-semibold text-cream transition-all"
                >
                  <span>🏫 Support Vedic Gurukul Shishya</span>
                  <span className="text-gl">₹251</span>
                </button>
                <button
                  onClick={() => submitDaan("Pushpa Arpan")}
                  className="w-full py-3 px-4 bg-deep/80 hover:bg-s/20 border border-brd hover:border-gl rounded-xl text-left flex justify-between items-center text-xs font-semibold text-cream transition-all"
                >
                  <span>🌸 Pushpa Arpan (Offer Flowers)</span>
                  <span className="text-gl">Manas Offer (Free)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
