import { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function LiveListeningRoom({ streamId }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allMessages = [] } = useQuery({
    queryKey: ['chat-messages', streamId],
    queryFn: () => base44.entities.ChatMessage.filter({ stream_id: streamId }, 'created_date', 200),
    refetchInterval: 5000,
    staleTime: 3000,
  });

  useEffect(() => {
    setMessages(allMessages);
  }, [allMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!streamId) return;
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.stream_id === streamId) {
        if (event.type === 'create') {
          setMessages(prev => [...prev, event.data]);
        }
      }
    });
    return () => unsub();
  }, [streamId]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user || sending) return;
    setSending(true);
    await base44.entities.ChatMessage.create({
      stream_id: streamId,
      sender_name: user.full_name || user.email.split('@')[0],
      message: input.trim(),
    });
    setInput('');
    setSending(false);
  };

  // Count unique active users from recent messages (last 2 minutes)
  const twoMinutesAgo = new Date(Date.now() - 2 * 60000);
  const recentMessages = messages.filter(m => new Date(m.created_date) > twoMinutesAgo);
  const activeUsers = new Set(recentMessages.map(m => m.sender_name)).size;

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-secondary/50 px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span className="text-white font-semibold text-sm">Live Chat</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Users className="w-3.5 h-3.5" />
          <span>{activeUsers} active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageSquare className="w-8 h-8 text-muted-foreground mb-2 opacity-30" />
            <p className="text-muted-foreground text-xs">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-purple-400 text-xs font-semibold truncate">{msg.sender_name}</span>
                <span className="text-muted-foreground text-xs">{new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-foreground text-sm break-words">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {user ? (
        <form onSubmit={send} className="border-t border-border px-4 py-3 flex gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Join the chat..."
            className="flex-1 bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="gradient-bg text-white p-2 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <div className="border-t border-border px-4 py-3 bg-secondary/30 text-center text-muted-foreground text-xs">
          <button onClick={() => base44.auth.redirectToLogin()} className="text-purple-400 hover:text-purple-300 font-semibold">
            Sign in
          </button>
          {' '}to join the chat
        </div>
      )}
    </div>
  );
}