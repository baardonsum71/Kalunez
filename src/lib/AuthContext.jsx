import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) return null;
  return data;
}

/** Creates a listener profile if the DB trigger missed it (common on first signup). */
async function ensureProfile(authUser) {
  if (!authUser?.id) return null;

  let profile = await fetchProfile(authUser.id);
  if (profile) return profile;

  const fullName =
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    authUser.email?.split('@')[0] ||
    '';
  const accountType = authUser.user_metadata?.account_type === 'artist' ? 'artist' : 'listener';

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: authUser.id,
        email: authUser.email,
        full_name: fullName,
        account_type: accountType,
      },
      { onConflict: 'id' }
    )
    .select('*')
    .maybeSingle();

  if (error) {
    // eslint-disable-next-line no-console
    console.error('ensureProfile failed:', error.message);
    return null;
  }
  return data;
}

function mergeUser(authUser, profile) {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: authUser.email,
    full_name: profile?.full_name || authUser.user_metadata?.full_name || null,
    subscription_tier: profile?.subscription_tier || 'free',
    role: profile?.role || 'user',
    profile_picture_url: profile?.profile_picture_url || null,
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

  const loadUser = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    const profile = await ensureProfile(authUser);
    setUser(mergeUser(authUser, profile));
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error) {
        setAuthError({ type: 'unknown', message: error.message });
        setIsLoadingAuth(false);
        return;
      }
      loadUser(session?.user || null).finally(() => {
        if (mounted) setIsLoadingAuth(false);
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user || null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [loadUser]);

  const signInWithPassword = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithPassword = async (email, password, fullName, accountType = 'listener') => {
    const type = accountType === 'artist' ? 'artist' : 'listener';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          account_type: type,
        },
      },
    });
    if (error) throw error;
    // If email confirm is off, session exists immediately — ensure profile now.
    if (data?.user) await ensureProfile({ ...data.user, email: data.user.email || email });
  };

  const signInWithApple = async (redirectTo) => {
    // OAuth opens the system browser — blocked on native (Apple Guideline 4).
    if (Capacitor.isNativePlatform()) {
      throw new Error('Use email and password to sign in inside the app.');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: redirectTo || window.location.origin },
    });
    if (error) throw error;
  };

  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  };

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.assign('/');
    }
  };

  const navigateToLogin = (returnUrl) => {
    const redirect = returnUrl || window.location.pathname + window.location.search;
    // Stay inside the Capacitor WebView (relative path) — do not open an external browser.
    window.location.assign(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        // Kept for backward compatibility with components that still read this flag;
        // Supabase has no separate "app public settings" loading phase like Base44 did.
        isLoadingPublicSettings: false,
        authError,
        logout,
        navigateToLogin,
        signInWithPassword,
        signUpWithPassword,
        signInWithApple,
        sendPasswordReset,
        refreshUser: () => supabase.auth.getUser().then(({ data }) => loadUser(data?.user || null)),
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
