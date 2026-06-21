import { useState, useEffect } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function CommentSection({ contentId, contentType }) {
  const [text, setText] = useState('');
  const [user, setUser] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', contentId],
    queryFn: () => base44.entities.Comment.filter({ content_id: contentId }, '-created_date', 50),
    enabled: !!contentId,
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => base44.entities.Comment.create({
      content_id: contentId,
      content_type: contentType,
      author_name: user.full_name || user.email.split('@')[0],
      author_email: user.email,
      text: text.trim(),
    }),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['comments', contentId] });
      const prevComments = qc.getQueryData(['comments', contentId]);
      const newComment = {
        id: `optimistic-${Date.now()}`,
        author_name: user.full_name || user.email.split('@')[0],
        author_email: user.email,
        text: text.trim(),
        created_date: new Date().toISOString(),
      };
      qc.setQueryData(['comments', contentId], (old) => [newComment, ...(old || [])]);
      setText('');
      return { prevComments };
    },
    onError: (err, newComment, context) => {
      if (context?.prevComments) {
        qc.setQueryData(['comments', contentId], context.prevComments);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', contentId] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    submit();
  };

  return (
    <div className="mt-8">
      <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        Comments {comments.length > 0 && <span className="text-muted-foreground text-sm font-normal">({comments.length})</span>}
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
            {(user.full_name || user.email)[0].toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!text.trim() || isPending}
              className="gradient-bg text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 bg-secondary/50 border border-border rounded-xl p-4 text-center">
          <p className="text-muted-foreground text-sm mb-2">Sign in to leave a comment</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="gradient-bg text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-secondary shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-2 bg-secondary rounded w-1/4" />
                <div className="h-3 bg-secondary rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-6">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                {c.author_name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-semibold">{c.author_name}</span>
                  <span className="text-muted-foreground text-xs">{timeAgo(c.created_date)}</span>
                </div>
                <p className="text-foreground text-sm leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}