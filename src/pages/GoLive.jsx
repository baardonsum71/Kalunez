import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Video, Mic, MicOff, VideoOff, StopCircle, Camera, Copy, Check, Monitor } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LiveListeningRoom from '@/components/LiveListeningRoom';
import TipButton from '@/components/TipButton';
import MobileSelect from '@/components/MobileSelect';
import ShareButton from '@/components/ShareButton';
import { useLiveKitPublisher } from '@/hooks/useLiveKit';
import { generateRoomName, createMuxStream, isLiveKitConfigured, isMuxConfigured } from '@/lib/streaming';
import { toast } from '@/components/ui/use-toast';
import { AnalyticsEvents } from '@/lib/analytics';

const PROVIDERS = [
  { id: 'livekit', label: 'Browser (LiveKit)', desc: 'Stream directly from your webcam — no extra software' },
  ...(isMuxConfigured() ? [{ id: 'mux', label: 'OBS / RTMP (Mux)', desc: 'Use OBS Studio or similar with RTMP' }] : []),
];

export default function GoLive() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [step, setStep] = useState('setup');
  const streamStartRef = useRef(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(isLiveKitConfigured() ? 'livekit' : 'mux');
  const [form, setForm] = useState({ title: '', artist: '', category: 'Music', stream_type: 'Video' });
  const [streamRecord, setStreamRecord] = useState(null);
  const [muxCredentials, setMuxCredentials] = useState(null);
  const [copied, setCopied] = useState(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  const isLiveKit = provider === 'livekit';
  const roomName = streamRecord?.room_name;

  const { connected: livekitConnected, connecting: livekitConnecting } = useLiveKitPublisher({
    roomName,
    streamId: streamRecord?.id,
    mediaStream: mediaStream,
    enabled: step === 'live' && isLiveKit && !!roomName,
    onError: (msg) => setError(msg),
  });

  const startCamera = async () => {
    if (!rightsConfirmed) {
      setError('Please confirm you have the rights to broadcast this content.');
      return;
    }
    if (!isLiveKit) {
      setStep('preview');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const video = form.stream_type !== 'Audio Only';
      const media = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      streamRef.current = media;
      setMediaStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
      setStep('preview');
    } catch {
      setError('Could not access camera/microphone. Please allow permissions and try again.');
    }
    setLoading(false);
  };

  const goLive = async () => {
    if (!rightsConfirmed) {
      setError('Please confirm you have the rights to broadcast this content.');
      return;
    }
    if (!form.title || !form.artist) {
      setError('Please fill in title and artist name.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const room = isLiveKit ? generateRoomName() : null;

      const record = await base44.entities.LiveStream.create({
        ...form,
        provider,
        room_name: room,
        is_live: true,
        viewer_count: 0,
        reaction_count: 0,
        rights_attested_at: new Date().toISOString(),
      });

      let finalRecord = { ...record, room_name: room };

      if (provider === 'mux') {
        const mux = await createMuxStream(form.title, record.id);
        await base44.entities.LiveStream.update(record.id, {
          mux_playback_id: mux.muxPlaybackId,
          mux_live_stream_id: mux.muxLiveStreamId,
          stream_url: mux.hlsUrl,
        });
        setMuxCredentials(mux);
        finalRecord = { ...record, ...mux, mux_playback_id: mux.muxPlaybackId };
      }

      setStreamRecord(finalRecord);
      streamStartRef.current = Date.now();
      setStep('live');
      AnalyticsEvents.streamStarted(finalRecord);
      toast({ title: 'You are live!', description: 'Your stream is now broadcasting.' });
    } catch (err) {
      setError(err.message || 'Failed to start stream. Check your streaming configuration.');
    } finally {
      setLoading(false);
    }
  };

  const stopStream = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (streamRecord) {
      const duration = streamStartRef.current ? Math.floor((Date.now() - streamStartRef.current) / 1000) : null;
      await base44.entities.LiveStream.update(streamRecord.id, {
        is_live: false,
        ended_at: new Date().toISOString(),
        ...(duration ? { duration_seconds: duration } : {}),
      });
    }
    setStep('ended');
  };

  const toggleCam = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setCamOn(v => !v);
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMicOn(v => !v);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Copied', description: `${label} copied to clipboard.` });
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const streamUrl = streamRecord?.id
    ? `${window.location.origin}/stream/${streamRecord.id}`
    : '';

  return (
    <div className="hero-gradient min-h-screen px-4 pt-10 pb-24 safe-top safe-bottom">
      <div className="max-w-2xl mx-auto safe-left safe-right">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Radio className="w-7 h-7 text-pink-400 animate-pulse" /> Go Live
        </h1>
        <p className="text-muted-foreground mb-8">Start your live stream to the world</p>

        {step === 'setup' && (
          <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6 space-y-5">
            {PROVIDERS.length > 1 && (
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Streaming Method</label>
                <div className="grid gap-2">
                  {PROVIDERS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        provider === p.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-border hover:border-purple-500/40'
                      }`}
                    >
                      <p className="text-white text-sm font-semibold">{p.label}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Stream Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Friday Night Jazz Session"
                className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Artist Name *</label>
              <input
                value={form.artist}
                onChange={e => setForm(f => ({ ...f, artist: e.target.value }))}
                placeholder="Your name or band"
                className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                <MobileSelect value={form.category} onValueChange={(category) => setForm(f => ({ ...f, category }))} options={['Music', 'Electronic', 'Hip Hop', 'Rock', 'Jazz']} />
              </div>
              {isLiveKit && (
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                  <MobileSelect value={form.stream_type} onValueChange={(stream_type) => setForm(f => ({ ...f, stream_type }))} options={['Video', 'Audio Only']} />
                </div>
              )}
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={rightsConfirmed}
                onChange={(e) => setRightsConfirmed(e.target.checked)}
                className="mt-1 rounded border-border"
              />
              <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                I confirm I have the rights to perform and broadcast this content on Kalunez, including any music played during the stream.{' '}
                <Link to="/terms" className="text-purple-400 hover:underline">Terms</Link>
              </span>
            </label>
            <button
              type="button"
              onClick={startCamera}
              disabled={loading || !form.title || !form.artist || !rightsConfirmed}
              className="w-full gradient-bg text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isLiveKit ? (
                <Camera className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
              {isLiveKit ? 'Start Camera Preview' : 'Continue to RTMP Setup'}
            </button>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            {isLiveKit ? (
              <div className="bg-black rounded-2xl overflow-hidden aspect-video relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!camOn && form.stream_type !== 'Audio Only' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                    <VideoOff className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  {form.stream_type !== 'Audio Only' && (
                    <button type="button" onClick={toggleCam} className={`w-10 h-10 rounded-full flex items-center justify-center ${camOn ? 'bg-white/20' : 'bg-destructive'}`}>
                      {camOn ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-white" />}
                    </button>
                  )}
                  <button type="button" onClick={toggleMic} className={`w-10 h-10 rounded-full flex items-center justify-center ${micOn ? 'bg-white/20' : 'bg-destructive'}`}>
                    {micOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-purple-400" /> OBS / RTMP Setup
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  After going live, you'll receive RTMP credentials. Paste them into OBS Studio under Settings → Stream.
                </p>
                <ol className="text-muted-foreground text-sm space-y-1 list-decimal list-inside">
                  <li>Click "Go Live Now" below</li>
                  <li>Copy the Server URL and Stream Key</li>
                  <li>Open OBS → Settings → Stream → Custom</li>
                  <li>Start streaming in OBS</li>
                </ol>
              </div>
            )}
            {error && <p className="text-destructive text-sm">{error}</p>}
            <button
              type="button"
              onClick={goLive}
              disabled={loading}
              className="w-full gradient-bg text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Radio className="w-5 h-5" />}
              Go Live Now
            </button>
          </div>
        )}

        {step === 'live' && (
          <div className="space-y-4">
            {isLiveKit ? (
              <div className="bg-black rounded-2xl overflow-hidden aspect-video relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE
                  {livekitConnecting && <span className="opacity-70">· connecting</span>}
                  {livekitConnected && <span className="opacity-70">· broadcasting</span>}
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  {form.stream_type !== 'Audio Only' && (
                    <button type="button" onClick={toggleCam} className={`w-10 h-10 rounded-full flex items-center justify-center ${camOn ? 'bg-white/20' : 'bg-destructive'}`}>
                      {camOn ? <Video className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-white" />}
                    </button>
                  )}
                  <button type="button" onClick={toggleMic} className={`w-10 h-10 rounded-full flex items-center justify-center ${micOn ? 'bg-white/20' : 'bg-destructive'}`}>
                    {micOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>
            ) : muxCredentials && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-2 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE — Start OBS to broadcast
                </div>
                {[
                  { label: 'Server URL', value: muxCredentials.rtmpUrl },
                  { label: 'Stream Key', value: muxCredentials.streamKey },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                    <div className="flex gap-2">
                      <input readOnly value={value} className="flex-1 bg-secondary border border-border text-foreground text-xs px-3 py-2 rounded-lg font-mono" />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(value, label)}
                        className="px-3 py-2 bg-secondary border border-border rounded-lg hover:bg-white/5 transition-colors"
                      >
                        {copied === label ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{form.title}</p>
                <p className="text-muted-foreground text-sm">{form.artist}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <ShareButton title={form.title} url={streamUrl} text={`Watch "${form.title}" by ${form.artist} live on Kalunez!`} />
                <TipButton artistName={form.artist} />
              </div>
            </div>

            {streamRecord && <LiveListeningRoom streamId={streamRecord.id} />}

            <button
              type="button"
              onClick={stopStream}
              className="w-full bg-destructive text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <StopCircle className="w-5 h-5" /> End Stream
            </button>
          </div>
        )}

        {step === 'ended' && (
          <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-10 text-center">
            <StopCircle className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Stream Ended</h2>
            <p className="text-muted-foreground mb-6">Thanks for streaming on Kalunez!</p>
            <button
              type="button"
              onClick={() => { setStep('setup'); setStreamRecord(null); setMuxCredentials(null); setError(''); setRightsConfirmed(false); }}
              className="gradient-bg text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Start New Stream
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
