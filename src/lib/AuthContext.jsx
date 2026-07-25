import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) {
    // Profile row may not exist yet (trigger race on first sign-up) — not fatal.
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
    const profile = await fetchProfile(authUser.id);
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

  const signUpWithPassword = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || '' } },
    });
    if (error) throw error;
  };

  const signInWithApple = async (redirectTo) => {
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
