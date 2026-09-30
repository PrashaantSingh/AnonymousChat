import { create } from "zustand";
import createSocketConnection from "../socket";
import { persist, createJSONStorage } from "zustand/middleware";

function generateUser() {
  const adjectives = [
    "Shadow",
    "Cyber",
    "Silent",
    "Dark",
    "Swift",
    "Crazy",
    "Mystic",
    "Neon",
  ];

  const nouns = [
    "Wolf",
    "Falcon",
    "Dragon",
    "Tiger",
    "Ghost",
    "Hunter",
    "Phoenix",
    "Storm",
  ];

  const name1 = adjectives[Math.floor(Math.random() * adjectives.length)];
  const name2 = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(100 + Math.random() * 900);

  return {
    userId: crypto.randomUUID(),
    userName: `${name1}${name2}${number}`,
  };
}

function getUser() {
  const storedUser = sessionStorage.getItem("user");

  if (storedUser) {
    return JSON.parse(storedUser);
  }

  const user = generateUser();

  sessionStorage.setItem("user", JSON.stringify(user));

  return user;
}

const useSocketStore = create(
  persist(
    (set, get) => ({
      user: getUser(),
      socketUrl: "http://localhost:5000",
      socket: null,
      isConnected: false,
      privateMessages: [],
      roomMessages: [],
      currentRoom: null,
      isMatchingForChat: false,
      currentChatId: null,

      setCurrentChatId: (id) => {
        set({ currentChatId: id });
      },
      setIsMatchingForChat: (state) => set({ isMatchingForChat: state }),
      connectSocket: () => {
        const existingSocket = get().socket;
        if (existingSocket) return existingSocket;

        const socket = createSocketConnection(get().socketUrl, {
          auth: get().user,
        });

        socket.on("connect", () => get().setConnected(true));
        socket.on("disconnect", () => get().setConnected(false));
        socket.on("connect_error", () => get().setConnected(false));
        set({ socket: socket });
        return socket;
      },
      setConnected: (state) => set({ isConnected: state }),
      setDisplayName: (name) => {
        sessionStorage.setItem("displayName", name);
        set({ displayName: name });
      },
      resetPrivateChat: () => {
        set({ privateMessages: [], currentChatId: null });
      },
      addPrivateMessages: (msg) => {
        set((state) => ({
          privateMessages: [...state.privateMessages, msg],
        }));
      },

      clearPrivateMessages: () => set({ privateMessages: [] }),
      setCurrentRoom: (room) => set({ currentRoom: room }),
      setRoomMessages: (messages) => set({ roomMessages: messages }),
      addRoomMessage: (message) => {
        set((state) => ({ roomMessages: [...state.roomMessages, message] }));
      },
      resetRoom: () => set({ currentRoom: null, roomMessages: [] }),
    }),
    {
      name: "anonymousChat",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentChatId: state.currentChatId,
        privateMessages: state.privateMessages,
        currentRoom: state.currentRoom,
        roomMessages: state.roomMessages,
      }),
    },
  ),
);

export default useSocketStore;
