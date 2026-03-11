import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');
const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉'];

export default function CommunityChat({ user }: any) {
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // 1. Încărcare canale
    axios.get('http://localhost:3000/chat/channels')
      .then(res => {
        setChannels(res.data);
        if (res.data.length > 0) setSelectedChannel(res.data[0]);
      })
      .catch(err => console.error('Error loading channels:', err));

    if (user) {
      socket.emit('identify', user);
    }

    socket.on('updateUserList', (users: any[]) => {
      setOnlineUsers(users);
    });

    socket.on('userTyping', (data: { name: string; isTyping: boolean }) => {
      setTypingUsers(prev => ({ ...prev, [data.name]: data.isTyping }));
    });

    return () => {
      socket.off('updateUserList');
      socket.off('userTyping');
    };
  }, [user]);

  useEffect(() => {
    if (!selectedChannel) return;
    
    socket.emit('joinChannel', selectedChannel.id);
    
    axios.get(`http://localhost:3000/chat/messages/${selectedChannel.id}`)
      .then(res => setMessages(res.data));

    socket.on('receiveMessage', (msg) => {
      if (msg.channelId === selectedChannel.id) setMessages(prev => [...prev, msg]);
    });

    socket.on('reactionUpdated', (payload) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === payload.id ? payload : message
        )
      );
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('reactionUpdated');
    };
  }, [selectedChannel]);

  const handleInputChange = (val: string) => {
    setInputValue(val);

    socket.emit('typing', { channelId: selectedChannel.id, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { channelId: selectedChannel.id, isTyping: false });
    }, 2000);
  };

  const send = () => {
    if (!inputValue.trim()) return;
    socket.emit('sendMessage', { userId: user.id, content: inputValue, channelId: selectedChannel.id });
    setInputValue('');
    socket.emit('typing', { channelId: selectedChannel.id, isTyping: false });
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    socket.emit('toggleReaction', { messageId, userId: user.id, emoji });
  };

  const currentTyping = Object.entries(typingUsers)
    .filter(([name, isTyping]) => isTyping && name !== user.name)
    .map(([name]) => name);

  return (
    <div className="flex h-[600px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="w-64 bg-slate-950 p-4 border-r border-slate-800">
        <h4 className="text-slate-500 font-black text-[10px] uppercase mb-4 tracking-widest">Canale Text</h4>
        {channels.map(c => (
          <button key={c.id} onClick={() => setSelectedChannel(c)}
            className={`w-full text-left p-2 rounded-lg text-sm font-bold mb-1 transition-all ${selectedChannel?.id === c.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            # {c.name}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col p-6 bg-slate-900/50">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map(m => (
            <div key={m.id} className="flex flex-col group">
              <span className={`text-[10px] font-black uppercase ${m.user.role === 'TEACHER' ? 'text-rose-500' : 'text-blue-500'}`}>
                {m.user.name} {m.user.role === 'TEACHER' && '🛡️'}
              </span>
              <p className="text-slate-200 text-sm bg-slate-800/30 p-2 rounded-lg inline-block self-start mt-1">
                {m.content}
              </p>
              
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REACTION_EMOJIS.map((emoji) => {
                  const reactionsForEmoji = m.reactionSummary?.filter((r: any) => r.emoji === emoji) || [];
                  const count = reactionsForEmoji.length > 0 ? reactionsForEmoji[0].count : 0;
                  const reactedByMe = reactionsForEmoji.length > 0 && reactionsForEmoji[0].userIds.includes(user.id);

                  if (count === 0) return (
                    <button key={emoji} onClick={() => toggleReaction(m.id, emoji)} 
                      className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 rounded transition-all">
                      {emoji}
                    </button>
                  );

                  return (
                    <button key={emoji} onClick={() => toggleReaction(m.id, emoji)}
                      className={`px-2 py-0.5 text-xs rounded-md border transition-colors flex items-center gap-1 ${
                        reactedByMe ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                      {emoji} <span>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="h-6 mt-2">
          {currentTyping.length > 0 && (
            <p className="text-[10px] text-slate-500 font-bold italic animate-pulse">
              {currentTyping.join(', ')} {currentTyping.length === 1 ? 'scrie...' : 'scriu...'}
            </p>
          )}
        </div>

        <input 
          value={inputValue} 
          onChange={e => handleInputChange(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && send()}
          className="p-4 bg-slate-800 rounded-xl text-white outline-none focus:ring-2 ring-blue-500 transition-all shadow-inner"
          placeholder={`Mesaj în #${selectedChannel?.name}`} 
        />
      </div>

      <div className="w-64 bg-slate-950 p-4 border-l border-slate-800 overflow-y-auto">
        <h4 className="text-slate-500 font-black text-[10px] uppercase mb-6 tracking-widest">Membri Online — {onlineUsers.length}</h4>
        <div className="space-y-4">
          {onlineUsers
            .sort((a) => (a.role === 'TEACHER' ? -1 : 1)) // Profesorii la început
            .map((u, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-inner
                    ${u.role === 'TEACHER' ? 'bg-rose-600' : 'bg-blue-600'}`}>
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-950 rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${u.role === 'TEACHER' ? 'text-rose-400' : 'text-slate-300'}`}>
                    {u.name} {u.role === 'TEACHER' && '🛡️'}
                  </span>
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">
                    {u.role === 'TEACHER' ? 'Profesor' : 'Student'}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}