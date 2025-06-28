import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
    socket = io('http://18.228.199.115:3000/', {
        extraHeaders: {
            authentication: token,
        },
    });

    socket.on('connect', () => {
        console.log('Socket connected', socket?.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
    });

    return socket;
};

export const getSocket = () => socket;