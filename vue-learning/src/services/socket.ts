import { io } from 'socket.io-client';

const backendUrl = window.location.origin

export const socket = io(backendUrl, {
  withCredentials: true,
  autoConnect: false,
});