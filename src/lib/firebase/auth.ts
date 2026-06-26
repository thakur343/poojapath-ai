"use client";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

// ── Providers ──────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const githubProvider = new GithubAuthProvider();
githubProvider.addScope("read:user");
githubProvider.addScope("user:email");

// ── Firestore safe write (3s timeout, never blocks auth) ───
async function safeFirestoreWrite(fn: () => Promise<void>) {
  try {
    await Promise.race([
      fn(),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore timeout")), 3000)
      ),
    ]);
  } catch (e) {
    console.warn("Firestore write skipped:", e);
  }
}

// ── Email / Password ───────────────────────────────────────
export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signupWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });

  await safeFirestoreWrite(() =>
    setDoc(doc(db, "users", result.user.uid), {
      uid:         result.user.uid,
      email,
      displayName,
      provider:    "email",
      createdAt:   serverTimestamp(),
    })
  );

  return result.user;
}

// ── Google Sign-In ─────────────────────────────────────────
export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user   = result.user;

  await safeFirestoreWrite(async () => {
    const ref  = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:         user.uid,
        email:       user.email,
        displayName: user.displayName,
        photoURL:    user.photoURL,
        provider:    "google",
        createdAt:   serverTimestamp(),
      });
    }
  });

  return user;
}

// ── GitHub Sign-In ─────────────────────────────────────────
export async function loginWithGitHub() {
  const result = await signInWithPopup(auth, githubProvider);
  const user   = result.user;

  await safeFirestoreWrite(async () => {
    const ref  = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid:         user.uid,
        email:       user.email,
        displayName: user.displayName,
        photoURL:    user.photoURL,
        provider:    "github",
        createdAt:   serverTimestamp(),
      });
    }
  });

  return user;
}

// ── Password Reset ─────────────────────────────────────────
export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

// ── Sign Out ───────────────────────────────────────────────
export async function logout() {
  await signOut(auth);
}
