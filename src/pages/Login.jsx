import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

function AppleLogo() {
  return (
    <svg viewBox="0 0 384 512" className="w-4 h-4 fill-current" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.1-52.3.8-107.9 40.6-107.9 121.6 0 24.6 4.5 50 13.5 76.2 12 34.1 55.1 117.6 100.1 116.2 23.5-.6 40.1-16.8 70.7-16.8 29.7 0 45 16.8 71.6 16.8 45.4-.7 84.7-76.6 96.1-110.7-61.1-28.8-58.6-84.5-44.5-75.5zM254.4 40.7c19.4-23.2 32.4-55.5 28.8-87.7-27.9 1.1-61.6 18.6-81.6 42.1-17.9 20.8-33.5 54-29.3 85.7 30.6 2.4 61.9-15.6 82.1-40.1z" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { signInWithPassword, signUpWithPassword, signInWithApple, sendPasswordReset } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState('listener'); // 'listener' | 'artist'
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password);
        navigate(redirect, { replace: true });
      } else if (mode === 'signup') {
        await signUpWithPassword(email, password, fullName, accountType);
        setMessage('Account created. Check your email to confirm, then sign in.');
        setMode('signin');
      } else if (mode === 'reset') {
        await sendPasswordReset(email);
        setMessage('Password reset email sent — check your inbox.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setError('');
    try {
      await signInWithApple(`${window.location.origin}${redirect}`);
    } catch (err) {
      setError(err.message || 'Could not start Sign in with Apple');
    }
  };

  return (
    <div className="hero-gradient min-h-screen flex items-center justify-center px-4 pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-white">Kalunez</Link>
          <p className="text-muted-foreground mt-2">
            {mode === 'signin' && 'Sign in to continue'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'reset' && 'Reset your password'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <button
            type="button"
            onClick={handleApple}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <AppleLogo />
            Sign in with Apple
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <input
                  type="text"
                  placeholder="Display name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-secondary/50 border border-border text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('listener')}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      accountType === 'listener'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-border text-muted-foreground hover:text-white'
                    }`}
                  >
                    Listener
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('artist')}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      accountType === 'artist'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-border text-muted-foreground hover:text-white'
                    }`}
                  >
                    Artist
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Listeners stream and tip. Artists can also upload, go live, and earn. You can change this later in Settings.
                </p>
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-secondary/50 border border-border text-foreground text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
            />
            {mode !== 'reset' && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-secondary/50 border border-border text-foreground text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
              />
            )}

            {error && <p className="text-destructive text-xs">{error}</p>}
            {message && <p className="text-green-400 text-xs">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Send Reset Link'}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground space-y-1">
            {mode === 'signin' && (
              <>
                <button type="button" onClick={() => { setMode('reset'); setError(''); setMessage(''); }} className="hover:text-foreground transition-colors">
                  Forgot password?
                </button>
                <p>
                  No account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="text-purple-400 hover:underline">
                    Sign up
                  </button>
                </p>
              </>
            )}
            {mode !== 'signin' && (
              <p>
                <button type="button" onClick={() => { setMode('signin'); setError(''); setMessage(''); }} className="text-purple-400 hover:underline">
                  Back to sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
