import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LiveChat({ streamId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [nameSet, setNameSet] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Load existing messages
    base44.entities.ChatMessage.filter({ stream_id: streamId }, 'created_date', 100).then(setMessages);

    // Subscribe to new messages in real-time
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.stream_id !== streamId) return;
      if (event.type === 'create') {
        setMessages(prev => [...prev, event.data]);
      }
    });
    return unsubscribe;
  }, [streamId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await base44.entities.ChatMessage.create({
      stream_id: streamId,
      sender_name: name || 'Anonymous',
      message: input.trim(),
    });
    setInput('');
  };

  if (!nameSet) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
        <p className="text-white text-sm font-semibold">Join the chat</p>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your display name"
          className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={() => setNameSet(true)}
          className="gradient-bg text-white text-sm py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl flex flex-col h-72">
      <div className="px-4 py-3 border-b border-border text-white text-sm font-semibold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Live Chat
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className="text-sm">
            <span className="text-purple-400 font-semibold">{msg.sender_name}: </span>
            <span className="text-foreground">{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="px-3 py-2 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
        />
        <button type="submit" className="gradient-bg text-white px-3 py-2 rounded-lg hover:opacity-90 transition-opacity">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}