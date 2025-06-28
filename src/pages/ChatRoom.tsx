import { useEffect, useState } from 'react';
import { connectSocket, getSocket } from '../services/socket';

interface Message {
  message: string;
  fileURL: string | null;
}

interface ChatRoomProps {
  chatId: string;
  token: string;
}

const ChatRoom = ({ chatId, token }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const socket = connectSocket(token);

    socket.on('connect', () => {
      console.log('✅ Socket connected. Joining room...');
      socket.emit('joinRoom', chatId);
    });

    socket.on('newMessage', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('updateMessage', (data) => {
      console.log('updateMessage received:', data);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connect error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [chatId, token]);


  const handleSend = () => {
    const socket = getSocket();
    if (!socket || !message.trim()) return;
    socket.emit('sendMessage', chatId, message);
    setMessage('');
  };

  return (
    <div>
      <h2>Chat {chatId}</h2>
      <div>
        {messages.map((m, index) => (
          <p key={index}>{m.message}</p>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};
export default ChatRoom;