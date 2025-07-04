import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Member {
  id: string;
  email: string;
}

export default function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para criar um grupo.');
      navigate('/login');
    }
  }, [navigate]);

  const handleAddId = () => {
    setError('');

    if (!userId.trim()) {
      setError('ID inválido');
      return;
    }

    if (members.some((m) => m.id === userId.trim())) {
      setError('Usuário já adicionado');
      return;
    }

    setMembers((prev) => [...prev, { id: userId.trim(), email: userId.trim() }]);
    setUserId('');
  };

  const handleCreateGroup = async () => {
    try {
      setError('');

      const formData = new FormData();
      formData.append('name', groupName);
      formData.append('description', description);

      // Enviar apenas os IDs dos outros membros (o backend já inclui o criador)
      members.forEach((member) => {
        formData.append('participants', member.id);
      });

      await api.post('/chat/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Erro ao criar grupo';
      console.error(msg);
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1f2937] p-6 rounded-lg w-[400px] text-white">
        <h2 className="text-lg font-semibold mb-4">Criar Grupo</h2>

        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Nome do grupo"
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição"
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />

        <div className="flex gap-2 mb-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ID do integrante"
            className="flex-1 p-2 bg-gray-700 rounded"
          />
          <button
            onClick={handleAddId}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            +
          </button>
        </div>

        {error && <p className="text-red-400 mb-2">{error}</p>}

        <ul className="text-sm text-gray-300 mb-4">
          {members.map((m, i) => (
            <li key={i}>• {m.email}</li>
          ))}
        </ul>

        <div className="flex justify-between">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">
            Cancelar
          </button>
          <button
            onClick={handleCreateGroup}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Criar Grupo
          </button>
        </div>
      </div>
    </div>
  );
}
