import { useEffect, useState, useRef } from 'react';
import { connectSocket, getSocket } from '../services/socket';
import api from '../services/api';
import '../App.css';
import EmojiPicker from 'emoji-picker-react';

interface Message {
  message: string;
  fileURL: string | null;
  from: 'me' | 'them';
}

interface Chat {
  id: string;
  name: string;
}

interface ChatRoomProps {
  chatId: string;
  token: string;
}

const ChatRoom = ({ chatId, token }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [chatInfo, setChatInfo] = useState<Chat | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // 🔄 Buscar dados do chat atual
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await api.get<{ id: string; name: string }>(`/chat/${chatId}`);
        setChatInfo({
          id: res.data.id,
          name: res.data.name,
        });
      } catch (err) {
        console.error('Erro ao carregar chat:', err);
        setChatInfo({
          id: chatId,
          name: 'Nome não disponível',
        });
      }
    };

    fetchChat();
  }, [chatId]);

  // 📡 Conectar ao socket
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

  // ⬇️ Rolar para a última mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const socket = getSocket();
    if (!socket || !message.trim()) return;

    const newMsg: Message = {
      message,
      fileURL: null,
      from: 'me',
    };

    setMessages((prev) => [...prev, newMsg]);
    socket.emit('sendMessage', chatId, message);
    setMessage('');
  };

  return (
    <div className="chat-room">
      {/* ✅ Cabeçalho do Chat sem imagem */}
      <div className="chat-header px-4 py-3 border-b border-gray-700 bg-[#1a1f2e] flex items-center gap-2">
        <span className="text-purple-400 text-xl">💬</span>
        <h2 className="text-lg font-semibold text-white truncate">
          {chatInfo?.name || 'Carregando...'}
        </h2>
      </div>

      {/* 💬 Mensagens */}
      <div className="chat-messages">
        {messages.map((m, index) => (
          <div key={index} className={`message ${m.from}`}>
            {m.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 📝 Input + Emojis */}
      <div className="chat-input">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="emoji-toggle"
        >
          😶‍🌫️
        </button>

        {showEmojiPicker && (
          <div className="emoji-picker">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setMessage((prev) => prev + emojiData.emoji);
              }}
            />
          </div>
        )}

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Digite uma mensagem..."
        />
        <button onClick={handleSend}>Enviar</button>
      </div>
    </div>
  );
};

export default ChatRoom;
