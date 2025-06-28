import { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = (searchParam = '') => {
    api.get('/chat', {
      params: {
        searchTerm: searchParam
      }
    }).then(res => setChats(res.data));
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchChats(search);
  };

  return (
    <div>
      <h2>Chats</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar chat"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      {chats.map((chat: any) => (
        <div key={chat.id} onClick={() => navigate(`/chats/${chat.id}`)}>
          <h3>{chat.name}</h3>
        </div>
      ))}
    </div>
  );
}
