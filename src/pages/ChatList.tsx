import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import CreateGroupModal from './CreateGroupModal';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  updatedAt?: string;
}

export default function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState('');
  const [userName, setUserName] = useState('...');
  const [showGroupModal, setShowGroupModal] = useState(false);

  const navigate = useNavigate();
  const { id: selectedId } = useParams();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchChats(search);
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    api.get<{ name: string }>('/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUserName(res.data.name))
      .catch(() => setUserName('Usuário'));
  }, []);

  const fetchChats = (searchTerm = '') => {
    api.get<Chat[]>('/chat', { params: { searchTerm } })
      .then(res => {
        const formatted = res.data.map((chat) => ({
          ...chat,
          avatar: chat.avatar || `https://i.pravatar.cc/40?u=${chat.name}`,
          lastMessage: chat.lastMessage || '',
          updatedAt: chat.updatedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setChats(formatted);
      })
      .catch((err) => {
        console.error('Erro ao buscar chats:', err);
      });
  };

  function highlightMatch(text: string, query: string) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <span key={i} className="font-bold text-white">{part}</span>
        : <span key={i}>{part}</span>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#1f2937] text-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg text-gray-300">Conectado como</h2>
            <p className="text-xl font-semibold text-white leading-tight truncate max-w-[200px]">
              {userName}
            </p>
          </div>
        </div>

        <div className="mb-4 relative">
          <input
            type="text"
            className="w-full px-4 py-2 pr-10 rounded-md bg-gray-700 text-white placeholder-gray-400 text-sm"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-500 text-sm"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto px-4 space-y-2">
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => navigate(`/chats/${chat.id}`)}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-600 transition ${selectedId === chat.id ? 'bg-gray-700' : ''}`}
          >
            <img className="w-10 h-10 rounded-full object-cover" src={chat.avatar} alt={chat.name} />
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm truncate max-w-[150px]">{highlightMatch(chat.name, search)}</span>
                <span className="text-xs text-gray-400 ml-2">{chat.updatedAt}</span>
              </div>
              <span className="text-xs text-gray-400 truncate block max-w-full">{chat.lastMessage}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between bg-[#111827] px-4 py-2 rounded-md">
          <div>
            <p className="text-sm font-semibold text-white">{userName}</p>
            <p className="text-xs text-green-400">● Online</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/edit-profile')} className="text-gray-300 hover:text-white text-lg" title="Editar perfil">✏️</button>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className="text-gray-300 hover:text-red-500 text-lg" title="Sair">🔌</button>
            <button onClick={() => setShowGroupModal(true)} className="text-gray-300 hover:text-green-400 text-lg" title="Criar grupo">➕</button>
          </div>
        </div>
      </div>

      {showGroupModal && (
        <CreateGroupModal
          onClose={() => {
            setShowGroupModal(false);
            fetchChats();
          }}
        />
      )}
    </div>
  );
}
