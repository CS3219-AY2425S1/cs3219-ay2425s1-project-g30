import { MatchDataDto } from '@repo/dtos/match';
import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';

import { env } from '@/env.mjs';

const SOCKET_SERVER_URL = env.NEXT_PUBLIC_MATCH_SOCKET_URL;

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  isSearching: boolean;
  connectionError: string | null;
  connect: () => void;
  startSearch: () => void;
  stopSearch: () => void;
  disconnect: () => void;
}

const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  isSearching: false,
  connectionError: null,
  connect: () => {
    if (get().socket) return; // Prevent multiple connections

    const socket = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,
      withCredentials: true,
    });

    socket.on('connect', () => {
      set({ isConnected: true, connectionError: null });
      console.log('Connected to Socket.IO server');
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
      console.log('Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (error: Error) => {
      set({ connectionError: error.message });
      console.log(`Connection error: ${error.message}`);
    });

    socket.on('match_found', (message: MatchDataDto) => {
      console.log('Match found:', message);
      get().stopSearch();
    });

    socket.on('match_invalid', (message: string) => {
      console.log('Match invalid:', message);
      get().stopSearch();
    });

    socket.on('match_request_expired', (message: string) => {
      console.log('Match request expired:', message);
      get().stopSearch();
    });

    set({ socket });
  },
  startSearch: () => {
    set({ isSearching: true });
  },
  stopSearch: () => {
    set({ isSearching: false });
  },
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      socket.removeAllListeners();
      set({
        socket: null,
        isConnected: false,
        isSearching: false,
        connectionError: null,
      });
    }
  },
}));

export default useSocketStore;
