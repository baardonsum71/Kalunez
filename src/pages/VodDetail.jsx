import { useParams, Link } from 'react-router-dom';
import { Music, Clock, Calendar, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommentSection from '@/components/CommentSection';
import FollowButton from '@/components/FollowButton';

function formatDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function VodDetail() {
  const { id } = useParams();

  const { data: vod, isLoading } = useQuery({
    queryKey: ['vod', id],
    queryFn: () => base44.entities.LiveStream.filter({ id }, '-created_date', 1).then(r => r[0]),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-900 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!vod) return (
    <div className="hero-gradient min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-white text-xl">VOD not found.</p>
      <Link to="/archive" className="text-purple-400 hover:underline">Back to Archive</Link>
    </div>
  );

  return (
    <div className="hero-gradient min-h-screen px-4 pt-[calc(1.5rem+var(--safe-top))] pb-[calc(6rem+var(--safe-bottom))]">
      <div className="max-w-2xl mx-auto">
        <Link to="/archive" className="flex items-center gap-1 text-muted-foreground hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Archive
        </Link>

        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl overflow-hidden mb-6">
          <div className="aspect-video bg-secondary relative flex items-center justify-center">
            {vod.thumbnail_url ? (
              <img src={vod.thumbnail_url} alt={vod.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/40 to-purple-900/30">
                <Music className="w-20 h-20 text-indigo-400/50" />
              </div>
            )}
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">VOD</div>
            {vod.duration_seconds && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDuration(vod.duration_seconds)}
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h1 className="text-white font-bold text-2xl">{vod.title}</h1>
                <p className="text-muted-foreground">{vod.artist}</p>
              </div>
              <FollowButton artistName={vod.artist} />
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-sm mt-3 flex-wrap">
              {vod.category && <span className="bg-secondary px-3 py-1 rounded-full">{vod.category}</span>}
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(vod.ended_at || vod.created_date)}</span>
            </div>
            {vod.description && <p className="text-muted-foreground text-sm mt-4">{vod.description}</p>}
          </div>
        </div>

        <CommentSection contentId={id} contentType="vod" />
      </div>
    </div>
  );
}