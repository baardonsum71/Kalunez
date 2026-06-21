import { useState } from 'react';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Shield, ChevronRight, KeyRound, Eye, EyeOff, Star, Scale, Cookie, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CookieConsentSettings } from '@/components/CookieConsent';

export default function Settings() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next !== pwForm.confirm) return setPwError('New passwords do not match.');
    if (pwForm.next.length < 8) return setPwError('Password must be at least 8 characters.');
    setPwLoading(true);
    await base44.auth.updateMe({ password: pwForm.next });
    setPwLoading(false);
    setPwSuccess(true);
    setPwForm({ current: '', next: '', confirm: '' });
    setTimeout(() => { setChangingPassword(false); setPwSuccess(false); }, 2000);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await base44.auth.deleteMe();
      await base44.auth.logout();
    } catch (error) {
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
        {/* Account Section */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-foreground text-sm">Notifications</span>
              <span className="text-muted-foreground text-sm">Coming soon</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-foreground text-sm">Language</span>
              <span className="text-muted-foreground text-sm">English</span>
            </div>
            <Link to="/subscription" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-foreground text-sm"><Star className="w-4 h-4 text-yellow-400" /> Subscription & Billing</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/privacy" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-foreground text-sm"><Shield className="w-4 h-4 text-cyan-400" /> Privacy Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/terms" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-foreground text-sm"><FileText className="w-4 h-4 text-purple-400" /> Terms of Service</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/dmca" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-foreground text-sm"><Scale className="w-4 h-4 text-teal-400" /> DMCA Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/cookies" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-foreground text-sm"><Cookie className="w-4 h-4 text-amber-400" /> Cookie Policy</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <CookieConsentSettings />
            <button
              onClick={() => { setChangingPassword(!changingPassword); setPwError(''); setPwSuccess(false); }}
              className="flex items-center justify-between py-2 w-full hover:opacity-80 transition-opacity"
            >
              <span className="flex items-center gap-2 text-foreground text-sm"><KeyRound className="w-4 h-4 text-purple-400" /> Change Password</span>
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
                      className="w-full bg-card border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500 pr-10"
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
                  <button type="button" onClick={() => setChangingPassword(false)} className="border border-border text-foreground text-sm px-4 py-2 rounded-lg font-semibold hover:bg-secondary transition-colors">Cancel</button>
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
                  className="select-none border border-border text-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
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