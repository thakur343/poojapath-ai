"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// ── Detect Language from Browser ─────────────────────────────────────────────
function detectLanguage(): string {
  if (typeof window === "undefined") return "hi";
  const lang = navigator.language || "hi";
  // If browser is set to Hindi, Marathi, Sanskrit, or related → 'hi'
  if (/^(hi|mr|sa|gu|pa|bn|te|ta|kn|ml)/.test(lang)) return "hi";
  return "en";
}

// ── Save user profile to backend for ML email targeting ───────────────────────
async function saveUserProfile(user: User) {
  try {
    const language = detectLanguage();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    await fetch("https://poojapath-backend.onrender.com/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        name: user.displayName || user.email?.split("@")[0] || "Devotee",
        language,
        timezone,
        email_opt_in: true,
      }),
    });
  } catch {
    // Silent fail — non-critical
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      // Auto-save profile for email ML targeting
      if (firebaseUser?.email) {
        saveUserProfile(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
