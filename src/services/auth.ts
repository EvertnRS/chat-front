import api from './api';

interface LoginResponse {
  user: {
    id: string;
  };
  token: string;
}

interface SignupResponse {
  id: string;
  name: string;
  email: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>('/login', { email, password });

  const { token, user } = res.data;

  localStorage.setItem('token', token);
  localStorage.setItem('userId', user.id);

  const hasName = localStorage.getItem('userName');
  const hasEmail = localStorage.getItem('userEmail');
  if (!hasName || !hasEmail) {
    console.warn('Nome/email não encontrados no localStorage após login.');
  }

  return res.data;
};

export const signup = async (
  name: string,
  email: string,
  password: string
): Promise<SignupResponse> => {
  const res = await api.post<SignupResponse>('/signup', { name, email, password });

  localStorage.setItem('userName', res.data.name);
  localStorage.setItem('userEmail', res.data.email);

  return res.data;
};
