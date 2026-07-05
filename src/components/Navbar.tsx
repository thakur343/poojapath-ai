"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { useLang, type Lang } from "@/lib/i18n/LanguageContext";
import { logout } from "@/lib/firebase/auth";

const LANGS: { code: Lang; label: string; flag: string; sub: string }[] = [
  { code: "en", label: "English",   flag: "🇬🇧", sub: "International" },
  { code: "hi", label: "हिंदी",     flag: "🇮🇳", sub: "भारत" },
  { code: "sa", label: "संस्कृत",   flag: "🕉️", sub: "देवभाषा" },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const { lang, setLang, t } = useLang();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [langExpanded, setLangExpanded] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    router.push("/login");
    router.refresh();
  };

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setLangExpanded(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Hover open / close with small delay
  const onEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setProfileOpen(true);
  };
  const onLeave = () => {
    timerRef.current = setTimeout(() => {
      setProfileOpen(false);
      setLangExpanded(false);
    }, 280);
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Devotee";
  const email       = user?.email || "";
  const initials    = displayName.slice(0, 2).toUpperCase();
  const photoURL    = user?.photoURL;
  const currentLang = LANGS.find(l => l.code === lang)!;

  return (
    <>
      {/* ── CSS injected once ── */}
      <style>{`
        .nav-profile-drop {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 260px;
          background: linear-gradient(135deg, #18100a 0%, #2a1b12 50%, #18100a 100%);
          border-left: 3px double #c9922b;
          border-right: 3px double #c9922b;
          border-top: none;
          border-bottom: none;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,.85), 0 0 25px rgba(201,146,43,.15);
          backdrop-filter: blur(24px);
          transform-origin: top center;
          transition: transform .4s cubic-bezier(.19,1,.22,1), opacity .3s ease;
          z-index: 9999;
          pointer-events: none;
          opacity: 0;
          transform: scaleY(0);
          padding: 8px 0;
        }
        .nav-profile-drop::before, .nav-profile-drop::after {
          content: '';
          position: absolute;
          left: -14px;
          right: -14px;
          height: 12px;
          background: linear-gradient(to bottom, #5a3c18, #c9922b 25%, #ffeaa7 50%, #c9922b 75%, #5a3c18);
          border-radius: 6px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.6);
          z-index: 10000;
        }
        /* Cylindrical scroll knobs at both ends of rods */
        .nav-profile-drop::before {
          top: -3px;
        }
        .nav-profile-drop::after {
          bottom: -3px;
        }
        .nav-profile-drop.open {
          opacity: 1;
          transform: scaleY(1);
          pointer-events: auto;
        }
        .npd-header {
          padding: 18px 16px 14px;
          background: linear-gradient(135deg, rgba(201,146,43,.1), rgba(232,96,10,.06));
          border-bottom: 1px solid rgba(201,146,43,.1);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .npd-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 2px solid rgba(201,146,43,.5);
          object-fit: cover;
          flex-shrink: 0;
        }
        .npd-avatar-init {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg,#c9922b,#e8600a);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700; color: #fff;
          border: 2px solid rgba(201,146,43,.5);
          flex-shrink: 0;
        }
        .npd-name {
          font-size: 14px; font-weight: 700; color: var(--cream);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 160px;
        }
        .npd-email {
          font-size: 10.5px; color: rgba(201,146,43,.55);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 160px; margin-top: 2px;
        }
        .npd-body { padding: 8px 6px; }
        .npd-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          font-size: 13px; color: rgba(253,240,220,.75);
          cursor: pointer; transition: all .18s;
          border: none; background: none;
          width: 100%; text-align: left; font-family: inherit;
          text-decoration: none;
        }
        .npd-item:hover {
          background: rgba(201,146,43,.1);
          color: var(--gl);
          transform: translateX(3px);
        }
        .npd-item-icon { font-size: 16px; flex-shrink: 0; width: 22px; text-align: center; }
        .npd-item-label { flex: 1; }
        .npd-item-badge {
          font-size: 10px; padding: 2px 7px; border-radius: 20px;
          background: rgba(201,146,43,.15); color: var(--gl); font-weight: 600;
        }
        .npd-divider {
          height: 1px; background: rgba(201,146,43,.1);
          margin: 4px 6px;
        }
        /* Language sub-panel */
        .npd-lang-panel {
          max-height: 0; overflow: hidden;
          transition: max-height .3s ease, opacity .3s ease;
          opacity: 0;
        }
        .npd-lang-panel.open {
          max-height: 200px; opacity: 1;
        }
        .npd-lang-opt {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 12px 8px 36px;
          border-radius: 8px; cursor: pointer;
          transition: all .15s; border: none; background: none;
          width: 100%; font-family: inherit; color: rgba(253,240,220,.6);
          font-size: 12.5px; text-align: left;
        }
        .npd-lang-opt:hover, .npd-lang-opt.active {
          background: rgba(201,146,43,.12);
          color: var(--gl);
        }
        .npd-lang-opt.active { font-weight: 700; }
        .npd-signout {
          border-top: 1px solid rgba(201,146,43,.1);
          padding: 6px 6px 8px;
        }
        .npd-signout-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          font-size: 13px; color: rgba(240,80,60,.75);
          cursor: pointer; transition: all .18s;
          border: none; background: none;
          width: 100%; font-family: inherit;
        }
        .npd-signout-btn:hover {
          background: rgba(240,80,60,.1);
          color: #f87171;
        }
        /* Trigger avatar in nav */
        .nav-profile-trigger {
          display: flex; align-items: center; gap: 7px;
          cursor: pointer; padding: 4px 10px 4px 4px;
          border-radius: 30px;
          border: 1px solid rgba(201,146,43,.2);
          background: rgba(201,146,43,.06);
          transition: all .2s;
        }
        .nav-profile-trigger:hover {
          border-color: rgba(201,146,43,.4);
          background: rgba(201,146,43,.12);
        }
        .nav-profile-trigger .caret {
          font-size: 10px; color: rgba(201,146,43,.5);
          transition: transform .25s;
        }
        .nav-profile-trigger .caret.up { transform: rotate(180deg); }

        /* Lang pill button (when logged out) */
        .nav-lang-pill {
          display: flex; align-items: center; gap: 5px;
          background: rgba(201,146,43,.1); border: 1px solid rgba(201,146,43,.22);
          color: var(--gl); border-radius: 8px; padding: 6px 10px;
          font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit;
          transition: all .2s; position: relative;
        }
        .nav-lang-pill:hover { background: rgba(201,146,43,.18); }
        .nav-lang-drop {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: rgba(8,4,1,.98); border: 1px solid rgba(201,146,43,.2);
          border-radius: 12px; padding: 6px; min-width: 150px;
          box-shadow: 0 12px 40px rgba(0,0,0,.7); z-index: 9999;
          backdrop-filter: blur(20px);
          transition: opacity .2s, transform .2s;
        }
        .nav-lang-btn {
          display: flex; align-items: center; gap: 8px;
          width: 100%; background: transparent; border: none;
          border-radius: 8px; padding: 8px 12px;
          font-family: inherit; font-size: 13px; cursor: pointer;
          transition: all .15s; text-align: left;
          color: rgba(242,201,110,.6);
        }
        .nav-lang-btn:hover, .nav-lang-btn.active {
          background: rgba(201,146,43,.15); color: var(--gl);
        }
        .nav-lang-btn.active { font-weight: 700; }
      `}</style>

      <nav>
        <div className="nlogo">🪔 PoojaPath<span>.ai</span></div>

        <div className="nlinks">
          <Link href="/"       style={{ color: "inherit", textDecoration: "none" }}>{t("nav_home")}</Link>
          <Link href="/pandit" style={{ color: "inherit", textDecoration: "none" }}>{t("nav_pandit")}</Link>
          <Link href="/jaap"   style={{ color: "inherit", textDecoration: "none" }}>{t("nav_jaap")}</Link>
          <Link href="/kundli" style={{ color: "inherit", textDecoration: "none" }}>{t("nav_kundli")}</Link>
          <button onClick={() => scrollToSection("#darshan-sec")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0 }}>
            {t("nav_darshan")}
          </button>
          <button onClick={() => scrollToSection("#pricing-sec")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", font: "inherit", padding: 0 }}>
            {t("nav_pricing")}
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

          {!loading && (
            <>
              {user ? (
                /* ════ LOGGED IN — animated profile dropdown ════ */
                <div
                  ref={dropRef}
                  style={{ position: "relative" }}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                >
                  {/* Trigger */}
                  <div className="nav-profile-trigger" onClick={() => setProfileOpen(o => !o)}>
                    {photoURL
                      ? <img src={photoURL} alt={displayName} className="npd-avatar" style={{ width: 30, height: 30 }} />
                      : <div className="npd-avatar-init" style={{ width: 30, height: 30, fontSize: 11 }}>{initials}</div>
                    }
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gl)", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {displayName}
                    </span>
                    <span className={`caret ${profileOpen ? "up" : ""}`}>▼</span>
                  </div>

                  {/* ── Dropdown panel ── */}
                  <div className={`nav-profile-drop ${profileOpen ? "open" : ""}`}>

                    {/* Profile header */}
                    <div className="npd-header">
                      {photoURL
                        ? <img src={photoURL} alt={displayName} className="npd-avatar" />
                        : <div className="npd-avatar-init">{initials}</div>
                      }
                      <div style={{ overflow: "hidden" }}>
                        <div className="npd-name">{displayName}</div>
                        <div className="npd-email">{email}</div>
                        <div style={{ marginTop: 4, display: "flex", gap: 4 }}>
                          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 20, background: "rgba(201,146,43,.15)", color: "var(--gl)", fontWeight: 700 }}>
                            🪷 Devotee
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="npd-body">
                      {/* Profile Settings */}
                      <Link href="/profile" className="npd-item" onClick={() => setProfileOpen(false)}>
                        <span className="npd-item-icon">👤</span>
                        <span className="npd-item-label">My Profile</span>
                      </Link>

                      {/* My Orders */}
                      <Link href="/orders" className="npd-item" onClick={() => setProfileOpen(false)}>
                        <span className="npd-item-icon">📜</span>
                        <span className="npd-item-label">My Mantras</span>
                        <span className="npd-item-badge">History</span>
                      </Link>

                      {/* Saved Kundli */}
                      <Link href="/kundli" className="npd-item" onClick={() => setProfileOpen(false)}>
                        <span className="npd-item-icon">📊</span>
                        <span className="npd-item-label">Janam Kundli</span>
                      </Link>

                      <div className="npd-divider" />

                      {/* Language selector */}
                      <button
                        className="npd-item"
                        onClick={() => setLangExpanded(o => !o)}
                      >
                        <span className="npd-item-icon">{currentLang.flag}</span>
                        <span className="npd-item-label">Language — {currentLang.label}</span>
                        <span style={{ fontSize: 10, opacity: 0.5 }}>{langExpanded ? "▲" : "▼"}</span>
                      </button>

                      {/* Language sub-panel */}
                      <div className={`npd-lang-panel ${langExpanded ? "open" : ""}`}>
                        {LANGS.map(l => (
                          <button
                            key={l.code}
                            className={`npd-lang-opt ${lang === l.code ? "active" : ""}`}
                            onClick={() => { setLang(l.code); setLangExpanded(false); }}
                          >
                            <span style={{ fontSize: 16 }}>{l.flag}</span>
                            <span>{l.label}</span>
                            <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.5 }}>{l.sub}</span>
                            {lang === l.code && <span style={{ color: "var(--gl)", fontSize: 11 }}>✓</span>}
                          </button>
                        ))}
                      </div>

                      <div className="npd-divider" />

                      {/* Help */}
                      <Link href="/pandit" className="npd-item" onClick={() => setProfileOpen(false)}>
                        <span className="npd-item-icon">🧘</span>
                        <span className="npd-item-label">Talk with Pandit Ji</span>
                      </Link>
                    </div>

                    {/* Sign out */}
                    <div className="npd-signout">
                      <button className="npd-signout-btn" onClick={handleLogout}>
                        <span style={{ fontSize: 16 }}>🚪</span>
                        <span>{t("nav_signout")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ════ LOGGED OUT — login + standalone lang pill ════ */
                <>
                  {/* Language pill (standalone when logged out) */}
                  <div style={{ position: "relative" }} ref={dropRef}>
                    <button
                      className="nav-lang-pill"
                      onClick={() => setProfileOpen(o => !o)}
                    >
                      <span style={{ fontSize: 14 }}>{currentLang.flag}</span>
                      <span>{currentLang.label}</span>
                      <span style={{ fontSize: 10, opacity: 0.5 }}>{profileOpen ? "▲" : "▼"}</span>
                    </button>
                    {profileOpen && (
                      <div className="nav-lang-drop">
                        {LANGS.map(l => (
                          <button
                            key={l.code}
                            className={`nav-lang-btn ${lang === l.code ? "active" : ""}`}
                            onClick={() => { setLang(l.code); setProfileOpen(false); }}
                          >
                            <span style={{ fontSize: 16 }}>{l.flag}</span>
                            <span>{l.label}</span>
                            {lang === l.code && <span style={{ marginLeft: "auto", fontSize: 10 }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link href="/login" className="nbtn" style={{
                    background: "rgba(201,146,43,.12)", border: "1px solid rgba(201,146,43,.25)",
                    color: "var(--gl)", borderRadius: "8px", padding: "8px 16px",
                    fontSize: "13px", fontWeight: 600, textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: "5px", transition: "all .2s",
                  }}>
                    {t("nav_login")}
                  </Link>
                </>
              )}
            </>
          )}

          <button className="nbtn nb1" onClick={() => scrollToSection("#form-sec")}>{t("nav_btn1")}</button>
          <button className="nbtn nb2" onClick={() => scrollToSection("#darshan-sec")}>{t("nav_btn2")}</button>
        </div>
      </nav>
    </>
  );
}
