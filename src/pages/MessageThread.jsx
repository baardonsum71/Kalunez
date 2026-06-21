import { useState, useEffect, useRef } from 'react';
import { Send, ChevronLeft, MessageSquare } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function MessageThread() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const recipientEmail = params.get('recipient') || '';
  const recipientName = params.get('recipientName') || recipientEmail;

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const decodedThread = decodeURIComponent(threadId);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [sent, recv] = await Promise.all([
        base44.entities.Message.filter({ thread_id: decodedThread, sender_email: user.email }, 'created_date', 100),
        base44.entities.Message.filter({ thread_id: decodedThread, recipient_email: user.email }, 'created_date', 100),
      ]);
      const all = [...sent, ...recv].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
      setMessages(all);
      // Mark received as read
      recv.filter(m => !m.read).forEach(m => base44.entities.Message.update(m.id, { read: true }));
    };
    load();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.thread_id === decodedThread) load();
    });
    return () => unsub();
  }, [user, decodedThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user || sending) return;
    setSending(true);
    await base44.entities.Message.create({
      thread_id: decodedThread,
      sender_email: user.email,
      sender_name: user.full_name || user.email.split('@')[0],
      recipient_email: recipientEmail,
      text: text.trim(),
      read: false,
    });
    setText('');
    setSending(false);
  };

  if (!user) return (
    <div className="hero-gradient min-h-screen flex flex-col items-center justify-center gap-4">
      <MessageSquare className="w-12 h-12 text-purple-400 opacity-50" />
      <p className="text-white text-xl font-semibold">Sign in to view messages</p>
      <button onClick={() => base44.auth.redirectToLogin()} className="gradient-bg text-white px-6 py-3 rounded-xl font-bold hover:opacity-90">Sign In</button>
    </div>
  );

  return (
    <div className="hero-gradient min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/messages')} className="text-muted-foreground hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">
          {(recipientName || recipientEmail)[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">{recipientName}</p>
          {recipientName !== recipientEmail && <p className="text-muted-foreground text-xs">{recipientEmail}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-6 overflow-y-auto max-w-2xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground opacity-30 mb-3" />
            <p className="text-muted-foreground text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => {
              const isMine = msg.sender_email === user?.email;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? 'gradient-bg text-white rounded-br-sm' : 'bg-card border border-border text-foreground rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                    <span className="text-muted-foreground text-xs px-1">{timeAgo(msg.created_date)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-16 md:bottom-0 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <form onSubmit={send} className="max-w-2xl mx-auto flex gap-3">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-secondary border border-border text-foreground text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="gradient-bg text-white px-4 py-2.5 rounded-xl disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}