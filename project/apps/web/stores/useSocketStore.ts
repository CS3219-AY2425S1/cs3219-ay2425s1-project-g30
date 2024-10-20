import { MatchDataDto } from '@repo/dtos/match';
import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { env } from '@/env.mjs'; 
import { Router } from 'next/router';

const SOCKET_SERVER_URL = env.NEXT_PUBLIC_MATCH_SOCKET_URL;

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  isSearching: boolean;
  toastMessage: { variant: "default" | "success" | "error" | "destructive" | null | undefined, title: string, description: string } | null;
  connectionError: string | null;
  connect: () => void;
  startSearch: () => void;
  stopSearch: () => void;
  disconnect: () => void;
  clearToastMessage: () => void;
}

const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  isSearching: false,
  connectionError: null,
  toastMessage: null,
  connect: (router) => {
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

      set({
        toastMessage: {
          variant: 'success',
          title: 'Match Found',
          description: 'Your match was successful.',
        },
      });
    });

    socket.on('match_invalid', (message: string) => {
      console.log('Match invalid:', message);
      get().stopSearch();
      set({
        toastMessage: {
          variant: 'error',
          title: 'Match Invalid',
          description: 'Your match was invalid.',
        },
      });
    });

    socket.on('match_request_expired', (message: string) => {
      console.log('Match request expired:', message);
      get().stopSearch();
      set({
        toastMessage: {
          variant: 'error',
          title: 'Match Expired',
          description: 'Your match request exceeds 2 minutes and has expired. Please try again.',
        },
      });
    });

    set({ socket });
  },
  startSearch: () => {
    console.log('Search started...');
    set({ isSearching: true });
  },
  stopSearch: () => {
    console.log('Search stopped...');
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
  clearToastMessage: () => set({ toastMessage: null }),
}));

export default useSocketStore;
