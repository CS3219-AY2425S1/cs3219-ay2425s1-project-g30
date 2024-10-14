import { io, Socket } from "socket.io-client";
import { create } from "zustand";

const SOCKET_SERVER_URL = "http://localhost:8080";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  connect: () => {
    if (get().socket) return; // Prevent multiple connections

    const socket = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,
      withCredentials: true,
    });

    socket.on("connect", () => {
      set({ isConnected: true });
      console.log("Connected to Socket.IO server");
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
      console.log("Disconnected from Socket.IO server");
    });

    socket.on("match_found", (message) => {
      // TODO: Implement logic to show match found
      console.log(message);
    });

    socket.on("match_request_expired", (message) => {
      // TODO: Implement logic to show no match found
      console.log(message);
    });

    set({ socket });
  },
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
}));

export default useSocketStore;
