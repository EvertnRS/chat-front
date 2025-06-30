// src/pages/ChatList.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
}

export default function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { id: selectedId } = useParams(); // id da rota atual

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = (searchTerm = '') => {
    api.get('/chat', { params: { searchTerm } })
      .then(res => {
        const formatted = res.data.map((chat: any) => ({
          id: chat.id,
          name: chat.name,
          avatar: chat.avatar || `https://i.pravatar.cc/40?u=${chat.name}`,
          lastMessage: chat.lastMessage || ''
        }));
        setChats(formatted);
      })
      .catch((err) => {
        console.error('Erro ao buscar chats:', err);
      });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchChats(search);
  };

  return (
    <div className="h-full w-full p-4 bg-[#1f2937] text-white">
      <h2 className="text-xl font-semibold mb-4">Conversas</h2>

      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          className="w-full p-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      <ul className="space-y-2">
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
            <div className="flex flex-col">
              <span className="font-medium">{chat.name}</span>
              <span className="text-sm text-gray-400 truncate max-w-[150px]">
                {chat.lastMessage}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
