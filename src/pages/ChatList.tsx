import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

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

    api.get('/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => setUserName(res.data.name))
    .catch(() => setUserName('Usuário'));
  }, []);

  const fetchChats = (searchTerm = '') => {
    api.get('/chat', { params: { searchTerm } })
      .then((res) => {
        const formatted = res.data.map((chat: any) => ({
          id: chat.id,
          name: chat.name,
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
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="font-bold text-white">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#1f2937] text-white">
      {/* Topo */}
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Chats</h2>

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
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Lista de chats */}
      <ul className="flex-1 overflow-y-auto px-4 space-y-2">
        {chats.map((chat) => (
          <li
            key={chat.id}
            onClick={() => navigate(`/chats/${chat.id}`)}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-600 transition ${
              selectedId === chat.id ? 'bg-gray-700' : ''
            }`}
          >
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={chat.avatar}
              alt={chat.name}
            />
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm truncate max-w-[150px]">
                  {highlightMatch(chat.name, search)}
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {chat.updatedAt}
                </span>
              </div>
              <span className="text-xs text-gray-400 truncate block max-w-full">
                {chat.lastMessage}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Rodapé estilo Discord com perfil */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between bg-[#111827] px-4 py-2 rounded-md">
          <div>
            <p className="text-sm font-semibold text-white">{userName}</p>
            <p className="text-xs text-green-400">● Online</p>
          </div>
          <button
            onClick={() => navigate('/edit-profile')}
            className="text-gray-300 hover:text-white text-lg"
            title="Editar perfil"
          >
            ✏️
          </button>
        </div>
      </div>
    </div>
  );
}
