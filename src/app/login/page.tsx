"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  loginWithEmail,
  signupWithEmail,
  loginWithGoogle,
  loginWithGitHub,
  resetPassword,
} from "@/lib/firebase/auth";
import { useAuth } from "@/lib/firebase/AuthProvider";

type Tab = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);
  // ── UI state ──────────────────────────────────────────────
  const [tab,      setTab]      = useState<Tab>("login");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState<string | null>(null);

  // ── Form fields ───────────────────────────────────────────
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  const clearMessages = () => { setError(null); setSuccess(null); };
  const switchTab = (t: Tab) => { setTab(t); clearMessages(); };

  // ── Email / Password submit ───────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      if (tab === "login") {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, name);
        setSuccess("🎉 Account created! You are now signed in.");
      }
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Something went wrong.";
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  // ── Google sign-in ────────────────────────────────────────
  const handleGoogle = async () => {
    clearMessages();
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Google sign-in failed.";
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  // ── GitHub sign-in ────────────────────────────────────────
  const handleGitHub = async () => {
    clearMessages();
    setLoading(true);
    try {
      await loginWithGitHub();
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "GitHub sign-in failed.";
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ───────────────────────────────────────
  const handleForgot = async () => {
    if (!email) { setError("Enter your email above first."); return; }
    clearMessages();
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess("📧 Password reset link sent to your email!");
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Failed to send reset email.";
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Floating Om particles */}
      <div className="login-particles" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="login-om" style={{ "--i": i } as React.CSSProperties}>ॐ</span>
        ))}
      </div>
      <div className="login-glow" aria-hidden />

      {/* Card */}
      <div className="login-card">
        <Link href="/" className="login-logo">🪔 PoojaPath<span>.ai</span></Link>
        <p className="login-tagline">✦ &nbsp;Your sacred digital companion&nbsp; ✦</p>

        {/* Tabs */}
        <div className="login-tabs" role="tablist">
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`login-tab ${tab === t ? "login-tab--active" : ""}`}
              onClick={() => switchTab(t)}
            >
              {t === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Alerts */}
        {success && <div className="lf-alert lf-alert--success" role="alert">{success}</div>}
        {error   && <div className="lf-alert lf-alert--error"   role="alert">⚠️ {error}</div>}

        {/* ── Email / Password Form ─────────────────────── */}
        <form className="login-form" onSubmit={handleEmailSubmit}>
          {tab === "signup" && (
            <div className="lf-group">
              <label htmlFor="login-name" className="lf-label">Full Name</label>
              <input id="login-name" type="text" className="lf-input"
                placeholder="Arjun Sharma" value={name}
                onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
          )}
          <div className="lf-group">
            <label htmlFor="login-email" className="lf-label">Email Address</label>
            <input id="login-email" type="email" className="lf-input"
              placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="lf-group">
            <label htmlFor="login-password" className="lf-label">
              Password
              {tab === "login" && (
                <button type="button" className="lf-forgot-btn" onClick={handleForgot}>Forgot?</button>
              )}
            </label>
            <div className="lf-pass-wrap">
              <input id="login-password" type={showPass ? "text" : "password"}
                className="lf-input"
                placeholder={tab === "signup" ? "Min. 6 characters" : "••••••••"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                required minLength={6}
                autoComplete={tab === "login" ? "current-password" : "new-password"} />
              <button type="button" className="lf-eye"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Hide password" : "Show password"}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button id="login-submit-btn" type="submit"
            className={`lf-submit ${loading ? "lf-submit--loading" : ""}`} disabled={loading}>
            {loading ? <span className="lf-spinner" /> :
              tab === "login" ? "🪔 Enter the Sanctum" : "🌸 Begin My Journey"}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider"><span /><p>or continue with</p><span /></div>

        {/* Social Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Google */}
          <button id="login-google-btn" className="lf-google-btn" type="button"
            onClick={handleGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.6 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.7 7.2 29.1 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 19 13 24 13c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.7 7.2 29.1 5 24 5 16.3 5 9.7 9 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5 0 9.6-1.9 13-5l-6-5.2C29.2 36.5 26.7 37.5 24 37.5c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 41 16.3 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6 5.2C36.9 39.4 44 33.9 44 25c0-1.3-.1-2.6-.4-3.9z" />
            </svg>
            Continue with Google
          </button>

          {/* GitHub */}
          <button id="login-github-btn" className="lf-google-btn" type="button"
            onClick={handleGitHub} disabled={loading}
            style={{ background: "rgba(30,30,30,0.85)", borderColor: "rgba(255,255,255,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.57 0-.28-.01-1.02-.01-2-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02.005 2.05.138 3.01.404 2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.21.69.82.57C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <p className="login-footer-note">
          {tab === "login" ? <>Don&apos;t have an account?{" "}
            <button type="button" className="ln-switch" onClick={() => switchTab("signup")}>Create one</button></>
          : <>Already a member?{" "}
            <button type="button" className="ln-switch" onClick={() => switchTab("login")}>Sign in</button></>}
        </p>
        <p className="login-terms">
          By continuing you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

// ── Human-friendly Firebase error messages ─────────────────
function friendlyError(msg: string): string {
  if (msg.includes("user-not-found") || msg.includes("invalid-credential"))
    return "Incorrect email or password. Please try again.";
  if (msg.includes("wrong-password"))
    return "Incorrect password. Please try again.";
  if (msg.includes("email-already-in-use"))
    return "This email is already registered. Try signing in.";
  if (msg.includes("weak-password"))
    return "Password is too weak. Use at least 6 characters.";
  if (msg.includes("too-many-requests"))
    return "Too many attempts. Please wait a moment and try again.";
  if (msg.includes("popup-closed-by-user") || msg.includes("cancelled-popup-request"))
    return "Sign-in was cancelled.";
  if (msg.includes("account-exists-with-different-credential"))
    return "An account already exists with this email. Try a different sign-in method.";
  return msg;
}
