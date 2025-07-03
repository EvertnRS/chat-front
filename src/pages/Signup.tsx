import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/auth';
import toast from 'react-hot-toast';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      toast.success('Cadastro realizado com sucesso!', {
        position: 'top-right',
    });

      navigate('/'); // Redireciona para o login
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error;

      if (errorMessage === 'User with this email already exists') {
        toast.error('Este e-mail já está em uso.', { position: 'top-right' });
      } else {
        toast.error('Erro ao cadastrar. Verifique os dados.', { position: 'top-right' });
      }
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md bg-[#1a1f2e] rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Criar uma conta</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Nome</label>
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-md transition duration-200"
          >
            Cadastrar
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400 text-sm">
          Já tem uma conta?{' '}
          <span
            className="text-purple-500 cursor-pointer hover:underline"
            onClick={() => navigate('/')}
          >
            Faça login
          </span>
        </p>
      </div>
    </div>
  );
}
