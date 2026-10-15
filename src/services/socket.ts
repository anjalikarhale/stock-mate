import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected to server, id:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection error:', error.message);
    });
  }

  return socket;
}

export function joinClassroomRoom(classroomId: string, user: any) {
  const s = getSocket();
  if (s.connected) {
    s.emit('join-classroom', { classroomId, user });
  } else {
    s.once('connect', () => {
      s.emit('join-classroom', { classroomId, user });
    });
  }
}

export function joinActivityRoom(activityId: string, classroomId: string, user: any) {
  const s = getSocket();
  if (s.connected) {
    s.emit('join-activity', { activityId, classroomId, user });
  } else {
    s.once('connect', () => {
      s.emit('join-activity', { activityId, classroomId, user });
    });
  }
}
