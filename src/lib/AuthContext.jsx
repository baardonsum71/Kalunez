import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/api/firebaseClient';

const AuthContext = createContext();

async function fetchProfile(userId) {
  const snap = await getDoc(doc(db, 'profiles', userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** Creates a listener/artist profile if missing (first signup). */
async function ensureProfile(authUser, extras = {}) {
  if (!authUser?.uid) return null;

  let profile = await fetchProfile(authUser.uid);
  if (profile) return profile;

  const fullName =
    extras.full_name
    || authUser.displayName
    || authUser.email?.split('@')[0]
    || '';
  const accountType = extras.account_type === 'artist' ? 'artist' : 'listener';

  const payload = {
    id: authUser.uid,
    email: authUser.email || '',
    full_name: fullName,
    account_type: accountType,
    subscription_tier: 'free',
    role: 'user',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'profiles', authUser.uid), payload, { merge: true });
    profile = await fetchProfile(authUser.uid);
    return profile;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('ensureProfile failed:', err?.message || err);
    return null;
  }
}

function mergeUser(authUser, profile) {
  if (!authUser) return null;
  return {
    id: authUser.uid,
    email: authUser.email,
    full_name: profile?.full_name || authUser.displayName || null,
    subscription_tier: profile?.subscription_tier || 'free',
    role: profile?.role || 'user',
    profile_picture_url: profile?.profile_picture_url || authUser.photoURL || null,
    artist_name: profile?.artist_name || null,
    account_type: profile?.account_type || 'listener',
    bio: profile?.bio || null,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadUser = useCallback(async (authUser, extras) => {
    if (!authUser) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    const profile = await ensureProfile(authUser, extras);
    setUser(mergeUser(authUser, profile));
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      loadUser(firebaseUser)
        .catch((err) => setAuthError({ type: 'unknown', message: err.message }))
        .finally(() => setIsLoadingAuth(false));
    });
    return () => unsub();
  }, [loadUser]);

  const signInWithPassword = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithPassword = async (email, password, fullName, accountType = 'listener') => {
    const type = accountType === 'artist' ? 'artist' : 'listener';
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName) {
      try {
        await updateProfile(cred.user, { displayName: fullName });
      } catch {
        // Non-fatal.
      }
    }
    await ensureProfile(cred.user, { full_name: fullName || '', account_type: type });
    await loadUser(cred.user, { full_name: fullName || '', account_type: type });
  };

  const signInWithApple = async () => {
    // OAuth popup/system browser — blocked on native (Apple Guideline 4).
    if (Capacitor.isNativePlatform()) {
      throw new Error('Use email and password to sign in inside the app.');
    }
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    await signInWithPopup(auth, provider);
  };

  const sendPasswordReset = async (email) => {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
    });
  };

  const logout = async (shouldRedirect = true) => {
    await signOut(auth);
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.assign('/');
    }
  };

  const navigateToLogin = (returnUrl) => {
    const redirect = returnUrl || window.location.pathname + window.location.search;
    window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError,
        logout,
        navigateToLogin,
        signInWithPassword,
        signUpWithPassword,
        signInWithApple,
        sendPasswordReset,
        refreshUser: () => loadUser(auth.currentUser),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
