import { useEffect, useState, useRef } from 'react';
import { initSocket } from '../services/socket';
import api from '../services/api';
import '../App.css';
import EmojiPicker from 'emoji-picker-react';

interface Message {
  message: string;
  fileURL: string | null;
  from: 'me' | 'them';
  sentAt?: string;
}

interface MessageFromServer {
  id: string;
  sender: string;
  recipient: string;
  text: string | null;
  file: string | null;
  sentAt: string;
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof initSocket> | null>(null);

  const userId = localStorage.getItem('userId');

  // Carrega informações do chat
  useEffect(() => {
    const fetchChatInfo = async () => {
      try {
        const res = await api.get<Chat[]>('/chat');
        const found = res.data.find((c) => c.id === chatId);
        setChatInfo(found ?? { id: chatId, name: 'Chat não encontrado' });
      } catch (err) {
        console.error('Erro ao carregar o chat:', err);
      }
    };
    fetchChatInfo();
  }, [chatId]);

  // Carrega mensagens antigas
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await api.get<MessageFromServer[]>(`/message/${chatId}`);
        const fetched: Message[] = res.data.map((msg) => ({
          message: msg.text ?? '',
          fileURL: msg.file ?? null,
          from: msg.sender === userId ? 'me' : 'them',
          sentAt: msg.sentAt,
        }));
        setMessages(fetched);
      } catch (err) {
        console.error('Erro ao carregar mensagens:', err);
      }
    };

    loadMessages();
  }, [chatId, userId]);

  // Conecta e escuta mensagens em tempo real
  useEffect(() => {
    const socket = initSocket(token);
    socketRef.current = socket;

    socket.emit('joinRoom', chatId);

    const handleNewMessage = (data: any) => {
      const isMine = data.sender === userId;
      const newMessage: Message = {
        message: data.content,
        fileURL: data.fileURL ?? null,
        from: isMine ? 'me' : 'them',
        sentAt: data.sentAt,
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.disconnect();
    };
  }, [chatId, token, userId]);

  // Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensagem
  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const formData = new FormData();
      formData.append('content', message);

      // Adiciona a mensagem no estado antes da resposta do backend
      setMessages((prev) => [
        ...prev,
        {
          message,
          fileURL: null,
          from: 'me',
          sentAt: new Date().toISOString(),
        },
      ]);

      setMessage('');

      await api.post(`/message/create/${chatId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // A resposta real chegará pelo socket
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao enviar mensagem';
      console.error(msg);
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header px-4 py-3 border-b border-gray-700 bg-[#1a1f2e] flex items-center gap-2">
        <span className="text-purple-400 text-xl">💬</span>
        <h2 className="text-lg font-semibold text-white truncate max-w-full">
          {chatInfo?.name || 'Carregando...'}
        </h2>
      </div>

      <div className="chat-messages px-4 py-2 overflow-y-auto flex-1">
        {messages.map((m, index) => (
          <div key={index} className={`message ${m.from}`}>
            {m.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input flex items-center px-4 py-2 border-t border-gray-700 bg-[#1a1f2e]">
        <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="emoji-toggle mr-2">
          😊
        </button>

        {showEmojiPicker && (
          <div className="emoji-picker absolute bottom-14 left-4 z-50">
            <EmojiPicker onEmojiClick={(e) => setMessage((prev) => prev + e.emoji)} />
          </div>
        )}

        <input
          className="flex-1 px-4 py-2 bg-gray-800 text-white rounded mr-2"
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
        <button onClick={handleSend} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
