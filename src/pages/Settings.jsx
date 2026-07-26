import { useEffect, useRef, useState } from 'react';
import { Settings as SettingsIcon, Trash2, AlertTriangle, Shield, ChevronRight, KeyRound, Eye, EyeOff, Star, Scale, Cookie, FileText, User, Camera, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { uploadFile } from '@/lib/db';
import { CookieConsentSettings } from '@/components/CookieConsent';
import LanguagePicker from '@/components/LanguagePicker';

export default function Settings() {
  const { t } = useTranslation();
  const { user, logout, refreshUser } = useAuth();
  const fileRef = useRef(null);
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
    profile_picture_url: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      full_name: user.full_name || '',
      account_type: user.account_type || 'listener',
      artist_name: user.artist_name || '',
      bio: user.bio || '',
      profile_picture_url: user.profile_picture_url || '',
    });
  }, [user]);

  const persistProfile = async (overrides = {}) => {
    if (!user?.id) return { error: new Error('Not signed in') };
    const next = { ...profileForm, ...overrides };
    const accountType = next.account_type === 'artist' ? 'artist' : 'listener';
    const fullName = (next.full_name || user.full_name || '').trim();
    return supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      account_type: accountType,
      artist_name: accountType === 'artist' ? (next.artist_name || '').trim() || fullName : null,
      bio: (next.bio || '').trim() || null,
      profile_picture_url: next.profile_picture_url || null,
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setProfileErr('');
    setProfileMsg('');
    setProfileSaving(true);
    const { error } = await persistProfile();
    setProfileSaving(false);
    if (error) {
      setProfileErr(error.message);
      return;
    }
    await refreshUser?.();
    setProfileMsg(t('settings.saved'));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user?.id) return;
    if (!file.type.startsWith('image/')) {
      setProfileErr('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileErr('Image must be under 5 MB.');
      return;
    }
    setProfileErr('');
    setProfileMsg('');
    setPhotoUploading(true);
    try {
      const { file_url } = await uploadFile('avatars', file, `${user.id}/`);
      setProfileForm((p) => ({ ...p, profile_picture_url: file_url }));
      const { error } = await persistProfile({ profile_picture_url: file_url });
      if (error) throw error;
      await refreshUser?.();
      setProfileMsg(t('settings.saved'));
    } catch (err) {
      setProfileErr(err.message || 'Could not upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next !== pwForm.confirm) return setPwError(t('settings.passwordMismatch'));
    if (pwForm.next.length < 8) return setPwError(t('settings.passwordShort'));
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
            <SettingsIcon className="w-7 h-7 text-purple-400" /> {t('settings.title')}
          </h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-[calc(8rem+var(--safe-bottom))] space-y-6">
        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" /> {t('settings.profile')}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">{t('settings.profileHint')}</p>
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={photoUploading || !user}
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 bg-black/40 shrink-0 hover:border-purple-400 transition-colors disabled:opacity-50"
                aria-label={t('settings.changePhoto')}
              >
                {profileForm.profile_picture_url ? (
                  <img src={profileForm.profile_picture_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-white/40">
                    <Camera className="w-7 h-7" />
                  </span>
                )}
                {photoUploading && (
                  <span className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </span>
                )}
              </button>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium">{t('settings.photo')}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={photoUploading || !user}
                  className="text-cyan-300 text-sm hover:underline disabled:opacity-50 mt-1"
                >
                  {profileForm.profile_picture_url ? t('settings.changePhoto') : t('settings.uploadPhoto')}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            <div>
              <label className="text-white text-xs mb-1 block">{t('settings.displayName')}</label>
              <input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full bg-secondary/50 border border-border text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
                placeholder={t('settings.namePlaceholder')}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['listener', 'artist'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setProfileForm((p) => ({ ...p, account_type: type }))}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    profileForm.account_type === type
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-border text-muted-foreground hover:text-white'
                  }`}
                >
                  {type === 'listener' ? t('settings.listener') : t('settings.artist')}
                </button>
              ))}
            </div>
            {profileForm.account_type === 'artist' && (
              <div>
                <label className="text-white text-xs mb-1 block">{t('settings.artistName')}</label>
                <input
                  value={profileForm.artist_name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, artist_name: e.target.value }))}
                  className="w-full bg-secondary/50 border border-border text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder={t('settings.artistPlaceholder')}
                />
              </div>
            )}
            <div>
              <label className="text-white text-xs mb-1 block">{t('settings.bio')}</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                rows={3}
                className="w-full bg-secondary/50 border border-border text-white text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                placeholder={t('settings.bioPlaceholder')}
              />
            </div>
            {profileErr && <p className="text-destructive text-xs">{profileErr}</p>}
            {profileMsg && <p className="text-green-400 text-xs">{profileMsg}</p>}
            <button
              type="submit"
              disabled={profileSaving}
              className="gradient-bg text-white text-sm font-semibold px-4 py-2.5 rounded-xl disabled:opacity-50"
            >
              {profileSaving ? t('settings.saving') : t('settings.saveProfile')}
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">{t('settings.account')}</h2>
          <div className="space-y-3">
            <LanguagePicker />

            <Link to="/subscription" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-white text-sm"><Star className="w-4 h-4 text-yellow-400" /> {t('settings.subscription')}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/privacy" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-white text-sm"><Shield className="w-4 h-4 text-cyan-400" /> {t('settings.privacy')}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/terms" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-white text-sm"><FileText className="w-4 h-4 text-purple-400" /> {t('settings.terms')}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/dmca" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-white text-sm"><Scale className="w-4 h-4 text-teal-400" /> {t('settings.dmca')}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <Link to="/cookies" className="flex items-center justify-between py-2 border-b border-border hover:opacity-80 transition-opacity">
              <span className="flex items-center gap-2 text-white text-sm"><Cookie className="w-4 h-4 text-amber-400" /> {t('settings.cookies')}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            <CookieConsentSettings />
            <button
              onClick={() => { setChangingPassword(!changingPassword); setPwError(''); setPwSuccess(false); }}
              className="flex items-center justify-between py-2 w-full hover:opacity-80 transition-opacity"
            >
              <span className="flex items-center gap-2 text-white text-sm"><KeyRound className="w-4 h-4 text-purple-400" /> {t('settings.changePassword')}</span>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${changingPassword ? 'rotate-90' : ''}`} />
            </button>
            {changingPassword && (
              <form onSubmit={handleChangePassword} className="bg-secondary/50 rounded-xl p-4 space-y-3">
                {['current', 'next', 'confirm'].map((field, i) => (
                  <div key={field} className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder={i === 0 ? t('settings.currentPassword') : i === 1 ? t('settings.newPassword') : t('settings.confirmPassword')}
                      value={pwForm[field]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                      className="w-full bg-card border border-border text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500 pr-10"
                      required
                    />
                    {i === 2 && (
                      <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                ))}
                {pwError && <p className="text-destructive text-xs">{pwError}</p>}
                {pwSuccess && <p className="text-green-400 text-xs">{t('settings.passwordUpdated')}</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={pwLoading} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
                    {pwLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {t('settings.save')}
                  </button>
                  <button type="button" onClick={() => setChangingPassword(false)} className="border border-border text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-secondary transition-colors">{t('settings.cancel')}</button>
                </div>
              </form>
            )}

            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center justify-between py-2 w-full border-t border-border mt-1 pt-3 hover:opacity-80 transition-opacity"
            >
              <span className="flex items-center gap-2 text-white text-sm">
                <LogOut className="w-4 h-4 text-[var(--lime)]" /> {t('settings.signOut')}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="bg-card border border-destructive/30 rounded-2xl p-6">
          <h2 className="text-destructive font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> {t('settings.dangerZone')}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">{t('settings.deleteHint')}</p>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="select-none flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/30 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> {t('settings.deleteAccount')}
            </button>
          ) : (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-3">
              <p className="text-white text-sm font-medium">{t('settings.deleteConfirmTitle')}</p>
              <p className="text-muted-foreground text-sm">{t('settings.deleteConfirmBody')}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="select-none bg-destructive text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {t('settings.yesDelete')}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="select-none border border-border text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-secondary transition-colors"
                >
                  {t('settings.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
