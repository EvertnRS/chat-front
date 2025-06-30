// src/pages/ChatRoom.tsx
import { useEffect, useState } from 'react';
import { connectSocket, getSocket } from '../services/socket';
import api from '../services/api';
import '../App.css'; // vamos criar esse CSS

interface Message {
  message: string;
  fileURL: string | null;
  from: 'me' | 'them';
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
}

interface ChatRoomProps {
  chatId: string;
  token: string;
}

const ChatRoom = ({ chatId, token }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);

  useEffect(() => {
  api.get<{ id: string; name: string; avatar?: string }>(`/chat/${chatId}`)
    .then(res => {
      setChatInfo({
        id: res.data.id,
        name: res.data.name,
        avatar: res.data.avatar || `https://i.pravatar.cc/40?u=${res.data.name}`
      });
    });
}, [chatId]);


  // Socket setup
  useEffect(() => {
    const socket = connectSocket(token);

    socket.on('connect', () => {
      socket.emit('joinRoom', chatId);
    });

    socket.on('newMessage', (data: { message: string; fileURL: string | null; from: string }) => {
      const isMine = data.from === 'me';
      setMessages((prev) => [...prev, { ...data, from: isMine ? 'me' : 'them' }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId, token]);

  const handleSend = () => {
    const socket = getSocket();
    if (!socket || !message.trim()) return;

    const newMsg: Message = {
      message,
      fileURL: null,
      from: 'me'
    };

    setMessages((prev) => [...prev, newMsg]);
    socket.emit('sendMessage', chatId, message);
    setMessage('');
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <img className="chat-avatar" src={chatInfo?.avatar} alt={chatInfo?.name} />
        <h2>{chatInfo?.name}</h2>
      </div>

      <div className="chat-messages">
        {messages.map((m, index) => (
          <div key={index} className={`message ${m.from}`}>
            {m.message}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Digite uma mensagem..."
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
};

export default ChatRoom;
