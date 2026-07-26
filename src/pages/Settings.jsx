import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Shield, ChevronRight, KeyRound, Eye, EyeOff, Star, Scale, Cookie, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { CookieConsentSettings } from '@/components/CookieConsent';

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    account_type: 'listener',
    artist_name: '',
    bio: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      full_name: user.full_name || '',
      account_type: user.account_type || 'listener',
      artist_name: user.artist_name || '',
      bio: user.bio || '',
    });
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setProfileErr('');
    setProfileMsg('');
    setProfileSaving(true);
    const accountType = profileForm.account_type === 'artist' ? 'artist' : 'listener';
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: profileForm.full_name.trim(),
      account_type: accountType,
      artist_name: accountType === 'artist' ? profileForm.artist_name.trim() || profileForm.full_name.trim() : null,
      bio: profileForm.bio.trim() || null,
    });
    setProfileSaving(false);
    if (error) {
      setProfileErr(error.message);
      return;
    }
    await refreshUser?.();
    setProfileMsg('Profile saved.');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next !== pwForm.confirm) return setPwError('New passwords do not match.');
    if (pwForm.next.length < 8) return setPwError('Password must be at least 8 characters.');
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwLoading(false);
    if (error) return setPwError(error.message);
    setPwSuccess(true);
    setPwForm({ current: '', next: '', confirm: '' });
    setTimeout(() => { setChangingPassword(false); setPwSuccess(false); }, 2000);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('deleteAccount', { body: {} });
      if (error) throw error;
      await logout();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-[calc(2.5rem+var(--safe-top))] pb-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
            <SettingsIcon className="w-7 h-7 text-purple-400" /> Settings
          </h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-[calc(8rem+var(--safe-bottom))] space-y-6">
        {/* Profile */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" /> Your profile
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Everyone gets a profile. Choose Listener (stream & tip) or Artist (also upload & go live).
          </p>
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="text-white text-xs mb-1 block">Display name</label>
              <input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full bg-secondary/50 border border-border text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder="Your name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['listener', 'artist'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProfileForm((p) => ({ ...p, account_type: type }))}
                  className={`py-2.5 rounded-xl text-sm font-semibold border capitalize transition-colors ${
                    profileForm.account_type === type
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-border text-muted-foreground hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {profileForm.account_type === 'artist' && (
              <div>
                <label className="text-white text-xs mb-1 block">Artist / stage name</label>
                <input
                  value={profileForm.artist_name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, artist_name: e.target.value }))}
                  className="w-full bg-secondary/50 border border-border text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Public artist name"
                />
              </div>
            )}
            <div>
              <label className="text-white text-xs mb-1 block">Bio (optional)</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                rows={3}
                className="w-full bg-secondary/50 border border-border text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                placeholder="A short intro"
              />
            </div>
            {profileErr && <p className="text-destructive text-xs">{profileErr}</p>}
            {profileMsg && <p className="text-green-400 text-xs">{profileMsg}</p>}
            <button
              type="submit"
              disabled={profileSaving}
              className="gradient-bg text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50"
            >
              {profileSaving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </div>

        {/* Account Section */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-white text-sm">Notifications</span>
              <span className="text-muted-foreground text-sm">Coming soon</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-white text-sm">Language</span>
              <span className="text-muted-foreground text-sm">English</span>
            </div>
            <Link to="/subscription" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-white text-sm"><Star className="w-4 h-4 text-yellow-400" /> Subscription & Billing</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/privacy" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-white text-sm"><Shield className="w-4 h-4 text-cyan-400" /> Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/terms" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-white text-sm"><FileText className="w-4 h-4 text-purple-400" /> Terms of Service</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/dmca" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-white text-sm"><Scale className="w-4 h-4 text-teal-400" /> DMCA Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/cookies" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-white text-sm"><Cookie className="w-4 h-4 text-amber-400" /> Cookie Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <CookieConsentSettings />
            <button
              onClick={() => { setChangingPassword(!changingPassword); setPwError(''); setPwSuccess(false); }}
              className="flex items-center justify-between py-2 w-full hover:opacity-80 transition-opacity"
            >
              <span className="flex items-center gap-2 text-white text-sm"><KeyRound className="w-4 h-4 text-purple-400" /> Change Password</span>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${changingPassword ? 'rotate-90' : ''}`} />
            </button>
            {changingPassword && (
              <form onSubmit={handleChangePassword} className="bg-secondary/50 rounded-xl p-4 space-y-3">
                {['current', 'next', 'confirm'].map((field, i) => (
                  <div key={field} className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder={i === 0 ? 'Current password' : i === 1 ? 'New password' : 'Confirm new password'}
                      value={pwForm[field]}
                      onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full bg-card border border-border text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500 pr-10"
                      required
                    />
                    {i === 2 && (
                      <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                ))}
                {pwError && <p className="text-destructive text-xs">{pwError}</p>}
                {pwSuccess && <p className="text-green-400 text-xs">Password updated!</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={pwLoading} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
                    {pwLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Save
                  </button>
                  <button type="button" onClick={() => setChangingPassword(false)} className="border border-border text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-secondary transition-colors">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-card border border-destructive/30 rounded-2xl p-6">
          <h2 className="text-destructive font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="select-none flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/30 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          ) : (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-3">
              <p className="text-white text-sm font-medium">Are you absolutely sure?</p>
              <p className="text-muted-foreground text-sm">This will permanently delete your account, tracks, and all data.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="select-none bg-destructive text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="select-none border border-border text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}