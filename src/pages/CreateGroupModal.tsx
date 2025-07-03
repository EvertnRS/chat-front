import { useState } from 'react';
import api from '../services/api';

interface ValidUser {
  id: string;
  email: string;
}

export default function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [members, setMembers] = useState<ValidUser[]>([]);
  const [error, setError] = useState('');

  const handleAddEmail = async () => {
    setError('');
    try {
      const res = await api.post<{ validEmails: ValidUser[] }>('/users/validate-emails', {
        emails: [email]
      });

      const valid = res.data.validEmails?.[0];

      if (!valid) {
        setError('Usuário não encontrado');
        return;
      }

      if (members.some(m => m.id === valid.id)) {
        setError('Usuário já adicionado');
        return;
      }

      setMembers(prev => [...prev, valid]);
      setEmail('');
    } catch (err) {
      console.error(err);
      setError('Erro ao validar e-mail');
    }
  };

  const handleCreateGroup = async () => {
    try {
      const formData = new FormData();
      formData.append('name', groupName);
      formData.append('description', description);

      members.forEach(member => {
        formData.append('participants', member.id);
      });

      await api.post('/groups', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao criar grupo');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1f2937] p-6 rounded-lg w-[400px] text-white">
        <h2 className="text-lg font-semibold mb-4">Criar Grupo</h2>

        <input
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          placeholder="Nome do grupo"
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Descrição"
          className="w-full p-2 mb-2 bg-gray-700 rounded"
        />

        <div className="flex gap-2 mb-2">
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email do integrante"
            className="flex-1 p-2 bg-gray-700 rounded"
          />
          <button onClick={handleAddEmail} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded">+</button>
        </div>

        {error && <p className="text-red-400 mb-2">{error}</p>}

        <ul className="text-sm text-gray-300 mb-4">
          {members.map((m, i) => (
            <li key={i}>• {m.email}</li>
          ))}
        </ul>

        <div className="flex justify-between">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancelar</button>
          <button onClick={handleCreateGroup} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Criar Grupo</button>
        </div>
      </div>
    </div>
  );
}
