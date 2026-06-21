import { Crown } from 'lucide-react';

export default function ProBadge({ user }) {
  if (!user || user.subscription_tier !== 'pro') return null;
  
  return (
    <div className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-2 py-0.5">
      <Crown className="w-3 h-3 text-yellow-400" />
      <span className="text-xs font-semibold text-yellow-400">Pro</span>
    </div>
  );
}