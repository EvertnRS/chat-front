import api from './api';

export const login = async (email: string, password: string) => {
  const res = await api.post('/login', { email, password });
  localStorage.setItem('token', res.data.token);
  return res.data;
};

export const signup = async (name: string, email: string, password: string) => {
  const res = await api.post('/signup', { name, email, password });
  return res.data;
};

/*Registrar
Criar novo grupo 
	(Editar grupo) 
	(Adicionar pelo email)
Perfil (Discord)
Grupos sem fotos
Descrição do grupo*/