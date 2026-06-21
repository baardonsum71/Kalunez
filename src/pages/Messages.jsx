import { useState, useEffect } from 'react';
import { MessageSquare, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Messages() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [newTo, setNewTo] = useState('');
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ['my-messages', user?.email],
    queryFn: () => base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 200),
    enabled: !!user,
    refetchInterval: 5000,
  });

  const { data: received = [] } = useQuery({
    queryKey: ['received-messages', user?.email],
    queryFn: () => base44.entities.Message.filter({ recipient_email: user.email }, '-created_date', 200),
    enabled: !!user,
    refetchInterval: 5000,
  });

  // Build thread list from all messages
  const threadMap = {};
  [...messages, ...received].forEach(msg => {
    const other = msg.sender_email === user?.email ? msg.recipient_email : msg.sender_email;
    const otherName = msg.sender_email === user?.email ? (msg.recipient_name || msg.recipient_email) : msg.sender_name;
    if (!threadMap[msg.thread_id] || new Date(msg.created_date) > new Date(threadMap[msg.thread_id].created_date)) {
      threadMap[msg.thread_id] = { ...msg, other_email: other, other_name: otherName };
    }
  });

  const threads = Object.values(threadMap).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const filtered = threads.filter(t => !search || t.other_email?.toLowerCase().includes(search.toLowerCase()) || t.other_name?.toLowerCase().includes(search.toLowerCase()));

  const startNewConversation = () => {
    if (!newTo.trim()) return;
    const threadId = [user.email, newTo.trim()].sort().join('_');
    navigate(`/messages/${encodeURIComponent(threadId)}?recipient=${encodeURIComponent(newTo.trim())}`);
  };

  if (!user) return (
    <div className="hero-gradient min-h-screen flex flex-col items-center justify-center gap-4">
      <MessageSquare className="w-12 h-12 text-purple-400 opacity-50" />
      <p className="text-white text-xl font-semibold">Sign in to view messages</p>
      <button onClick={() => base44.auth.redirectToLogin()} className="gradient-bg text-white px-6 py-3 rounded-xl font-bold hover:opacity-90">Sign In</button>
    </div>
  );

  return (
    <div className="hero-gradient min-h-screen px-4 pt-10 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-purple-400" /> Messages
          </h1>
          <button onClick={() => setShowNew(v => !v)} className="gradient-bg text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>

        {showNew && (
          <div className="bg-card border border-purple-500/40 rounded-xl p-4 mb-5 flex gap-3">
            <input
              value={newTo}
              onChange={e => setNewTo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startNewConversation()}
              placeholder="Enter recipient email..."
              className="flex-1 bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
            />
            <button onClick={startNewConversation} className="gradient-bg text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              Start
            </button>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-secondary border border-border text-foreground text-sm pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/20 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-white font-semibold mb-1">No conversations yet</p>
              <p className="text-muted-foreground text-sm">Start a new message above</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(thread => {
                const unread = received.filter(m => m.thread_id === thread.thread_id && !m.read).length;
                return (
                  <button
                    key={thread.thread_id}
                    onClick={() => navigate(`/messages/${encodeURIComponent(thread.thread_id)}?recipient=${encodeURIComponent(thread.other_email)}&recipientName=${encodeURIComponent(thread.other_name || thread.other_email)}`)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(thread.other_name || thread.other_email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-sm truncate">{thread.other_name || thread.other_email}</span>
                        <span className="text-muted-foreground text-xs shrink-0 ml-2">{timeAgo(thread.created_date)}</span>
                      </div>
                      <p className="text-muted-foreground text-xs truncate mt-0.5">{thread.text}</p>
                    </div>
                    {unread > 0 && (
                      <span className="w-5 h-5 gradient-bg rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{unread}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}