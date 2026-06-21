import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function InviteCollaborator({ trackDraftId, onInvited }) {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    try {
      const draft = await base44.entities.TrackDraft.filter({ id: trackDraftId }, '', 1);
      if (draft.length > 0) {
        const updated = await base44.entities.TrackDraft.update(trackDraftId, {
          collaborator_emails: [...new Set([...(draft[0].collaborator_emails || []), email.trim()])],
        });
        setEmail('');
        setShowForm(false);
        onInvited && onInvited(updated);
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
        >
          <UserPlus className="w-4 h-4" /> Invite
        </button>
      ) : (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Invite Collaborator</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && email.trim() && handleInvite()}
            placeholder="collaborator@email.com"
            type="email"
            className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
            autoFocus
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
          <button
            onClick={handleInvite}
            disabled={!email.trim() || loading}
            className="w-full gradient-bg text-white text-sm px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Inviting...' : 'Send Invite'}
          </button>
        </div>
      )}
    </div>
  );
}