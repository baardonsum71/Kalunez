import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload as UploadIcon, Music, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import MobileSelect from '@/components/MobileSelect';
import { toast } from '@/components/ui/use-toast';
import { AnalyticsEvents } from '@/lib/analytics';

const GENRES = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'R&B', 'Classical', 'Country', 'Reggae', 'Other'];

export default function Upload() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', artist: '', genre: 'Pop', description: '', duration: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rightsConfirmed) {
      toast({ title: 'Rights confirmation required', description: 'Please confirm you have the rights to upload this music.', variant: 'destructive' });
      return;
    }
    if (!audioFile) {
      toast({ title: 'Audio required', description: 'Please select an audio file to upload.', variant: 'destructive' });
      return;
    }
    if (audioFile.size > 50 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Audio files must be under 50 MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      let audio_url = '';
      let cover_url = '';
      const audioRes = await base44.integrations.Core.UploadFile({ file: audioFile });
      audio_url = audioRes.file_url;
      if (coverFile) {
        const coverRes = await base44.integrations.Core.UploadFile({ file: coverFile });
        cover_url = coverRes.file_url;
      }
      const created = await base44.entities.Track.create({
        ...form,
        duration: form.duration ? parseInt(form.duration, 10) : 0,
        audio_url,
        cover_url,
        plays: 0,
        likes: 0,
        rights_attested_at: new Date().toISOString(),
      });
      AnalyticsEvents.trackUploaded(created);
      qc.invalidateQueries({ queryKey: ['tracks'] });
      qc.invalidateQueries({ queryKey: ['platform-stats'] });
      setSuccess(true);
      setForm({ title: '', artist: '', genre: 'Pop', description: '', duration: '' });
      setAudioFile(null);
      setCoverFile(null);
      setRightsConfirmed(false);
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload your track. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Track Uploaded!</h2>
          <p className="text-muted-foreground mb-6">Your music is now live on Kalunez.</p>
          <button onClick={() => setSuccess(false)} className="gradient-bg text-white px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity">
            Upload Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-gradient min-h-screen safe-top safe-bottom">
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8 safe-left safe-right">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
            <UploadIcon className="w-7 h-7 text-purple-400" /> Upload Track
          </h1>
          <p className="text-muted-foreground">Share your music with the world</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20">
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Track Title *</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder="Enter track title..."
                className="w-full bg-secondary border border-border text-foreground text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Artist Name *</label>
              <input required value={form.artist} onChange={e => setForm({...form, artist: e.target.value})}
                placeholder="Your artist name..."
                className="w-full bg-secondary border border-border text-foreground text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Genre</label>
              <MobileSelect value={form.genre} onValueChange={(genre) => setForm({...form, genre})} options={GENRES} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Duration (seconds)</label>
              <input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                placeholder="e.g. 210"
                className="w-full bg-secondary border border-border text-foreground text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Tell us about your track..."
              rows={3}
              className="w-full bg-secondary border border-border text-foreground text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 resize-none" />
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Audio File</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-purple-500/50 transition-colors">
              <Music className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-sm text-muted-foreground">{audioFile ? audioFile.name : 'Click to upload audio'}</span>
              <input type="file" accept="audio/*" className="hidden" onChange={e => setAudioFile(e.target.files[0])} />
            </label>
          </div>

          {/* Cover Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Cover Art</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-purple-500/50 transition-colors">
              <UploadIcon className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-sm text-muted-foreground">{coverFile ? coverFile.name : 'Click to upload cover image'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => setCoverFile(e.target.files[0])} />
            </label>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={rightsConfirmed}
              onChange={(e) => setRightsConfirmed(e.target.checked)}
              className="mt-1 rounded border-border"
              required
            />
            <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
              I confirm this is my own original recording, or I have all rights and permissions to upload and distribute it on Kalunez.
              I will not upload music from Spotify, Apple Music, or any other service I do not control.{' '}
              <Link to="/terms" className="text-purple-400 hover:underline">Terms</Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={uploading || !form.title || !form.artist || !rightsConfirmed}
            className="w-full gradient-bg text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
            ) : (
              <><UploadIcon className="w-4 h-4" /> Upload Track</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}