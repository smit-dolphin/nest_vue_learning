import { io } from 'socket.io-client';

const backendUrl = `http://${window.location.hostname}:3000`;

export const socket = io(backendUrl, {
  withCredentials: true,
  autoConnect: false,
});