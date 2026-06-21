import { useState, useEffect, useRef } from 'react';
import { Music, Users, Archive } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import WaveformFeedback from '@/components/WaveformFeedback';
import InviteCollaborator from '@/components/InviteCollaborator';
import AudioWaveform from '@/components/AudioWaveform';

export default function CollabRoom() {
  const { draftId } = useParams();
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: draft, isLoading: draftLoading } = useQuery({
    queryKey: ['collab-draft', draftId],
    queryFn: async () => {
      const drafts = await base44.entities.TrackDraft.filter({ id: draftId }, '', 1);
      return drafts[0] || null;
    },
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['collab-feedback', draftId],
    queryFn: () => base44.entities.CollabFeedback.filter({ track_draft_id: draftId }, 'timestamp_seconds', 100),
    enabled: !!draftId,
  });

  const { mutate: addFeedback } = useMutation({
    mutationFn: (data) => base44.entities.CollabFeedback.create({ track_draft_id: draftId, ...data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collab-feedback', draftId] }),
  });

  const { mutate: archiveDraft } = useMutation({
    mutationFn: () => base44.entities.TrackDraft.update(draftId, { status: 'archived' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collab-draft', draftId] }),
  });

  const isArtist = user?.email === draft?.artist_email;

  const handleAddFeedback = (timestamp, note) => {
    addFeedback({
      author_name: user.full_name || user.email.split('@')[0],
      author_email: user.email,
      timestamp_seconds: timestamp,
      note,
    });
  };

  if (draftLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground">Collab room not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-gradient min-h-screen">
      <div className="bg-gradient-to-b from-purple-900/30 to-transparent px-4 pt-10 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-1">
            <Music className="w-7 h-7 text-purple-400" /> {draft.title}
          </h1>
          <p className="text-muted-foreground">Artist: {draft.artist_email}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20 space-y-8">
        {/* Audio Player */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Audio Track</h2>
            {isArtist && <InviteCollaborator trackDraftId={draftId} />}
          </div>

          {draft.audio_url && (
            <div className="space-y-4">
              <AudioWaveform audioUrl={draft.audio_url} height={120} />
              <audio
                ref={audioRef}
                src={draft.audio_url}
                controls
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                className="w-full"
              />
              <WaveformFeedback
                duration={audioRef.current?.duration || 0}
                feedbacks={feedbacks}
                onAddFeedback={handleAddFeedback}
                currentTime={currentTime}
                audioRef={audioRef}
              />
            </div>
          )}
        </div>

        {/* Collaborators */}
        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-400" /> Collaborators
          </h2>
          <div className="space-y-2">
            <div className="bg-secondary border border-border rounded-lg p-3">
              <p className="text-white font-semibold text-sm">{draft.artist_email}</p>
              <p className="text-muted-foreground text-xs">Artist</p>
            </div>
            {draft.collaborator_emails?.map((collab) => (
              <div key={collab} className="bg-secondary border border-border rounded-lg p-3">
                <p className="text-white font-semibold text-sm">{collab}</p>
                <p className="text-muted-foreground text-xs">Collaborator</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {isArtist && (
          <div className="flex gap-3">
            <button
              onClick={() => archiveDraft()}
              className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl hover:bg-secondary/80 transition-colors font-semibold"
            >
              <Archive className="w-4 h-4" /> Archive Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
}