// src/pages/ChatList.tsx
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
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMembers, setGroupMembers] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

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

    api.get('/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setUserName(res.data.name))
      .catch(() => setUserName('Usuário'));
  }, []);

  const fetchChats = (searchTerm = '') => {
    api.get('/chat', { params: { searchTerm } })
      .then(res => {
        const formatted = res.data.map((chat: any) => ({
          id: chat.id,
          name: chat.name,
          avatar: chat.avatar || `https://i.pravatar.cc/40?u=${chat.name}`,
          lastMessage: chat.lastMessage || '',
          updatedAt:
            chat.updatedAt ||
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const handleCreateGroup = async () => {
    setCreating(true);
    setError('');

    const emails = groupMembers
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    try {
      // ✅ Validar com backend se emails existem
      const validRes = await api.post('/users/validate-emails', { emails });
      const validEmails = validRes.data.validEmails;

      if (validEmails.length === 0) {
        setError('Nenhum email válido encontrado.');
        setCreating(false);
        return;
      }

      // ✅ Criar grupo
      await api.post('/groups', {
        name: groupName,
        description: groupDescription,
        members: validEmails
      });

      setShowGroupModal(false);
      setGroupName('');
      setGroupDescription('');
      setGroupMembers('');
      fetchChats(); // atualiza lista
    } catch (err) {
      console.error('Erro ao criar grupo:', err);
      setError('Erro ao criar grupo');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#1f2937] text-white">
      {/* Topo */}
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

      {/* Lista de conversas */}
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

      {/* Rodapé */}
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

      {/* Modal de criação de grupo */}
      {showGroupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Criar grupo</h3>
            <input
              type="text"
              placeholder="Nome do grupo"
              className="w-full mb-2 px-4 py-2 rounded bg-gray-700 text-white"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Descrição"
              className="w-full mb-2 px-4 py-2 rounded bg-gray-700 text-white"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
            />
            <textarea
              placeholder="E-mails dos integrantes (separados por vírgula)"
              className="w-full mb-2 px-4 py-2 rounded bg-gray-700 text-white"
              rows={3}
              value={groupMembers}
              onChange={(e) => setGroupMembers(e.target.value)}
            />
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setShowGroupModal(false)} className="px-4 py-2 bg-gray-600 rounded text-white">Cancelar</button>
              <button onClick={handleCreateGroup} disabled={creating} className="px-4 py-2 bg-purple-600 rounded text-white">
                {creating ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
