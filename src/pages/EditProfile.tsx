import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Usa os dados salvos localmente no login
    const storedName = localStorage.getItem('userName');
    const storedEmail = localStorage.getItem('userEmail');

    if (storedName) setName(storedName);
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) return;

    try {
      await api.put(
        `/users/update/${userId}`,
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Atualiza os dados locais após o sucesso
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);

      toast.success('Perfil atualizado com sucesso!', { position: 'top-right' });
      navigate('/chats');
    } catch (err) {
      console.error('Erro ao atualizar perfil', err);
      toast.error('Erro ao atualizar perfil.');
    }
  };

  const handleCancel = () => {
    navigate('/chats');
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md bg-[#1a1f2e] rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Editar Perfil</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 rounded-md transition duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md transition duration-200"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
