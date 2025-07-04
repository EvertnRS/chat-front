// services/socket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (token: string) => {
  if (!socket) {
    socket = io('http://18.228.199.115:3000/', {
      extraHeaders: { authentication: token },
    });

    socket.on('connect', () => console.log('Socket conectado:', socket?.id));
    socket.on('disconnect', () => console.log('Socket desconectado'));
    socket.on('connect_error', (err) =>
      console.error('Erro na conexão do socket:', err.message)
    );
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error('Socket não inicializado');
  return socket;
};
