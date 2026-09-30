import { useEffect, useRef, useState } from "react";
import { Copy, LogOut, Trash2, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import useSocketStore from "../store/useSocketStore";
import MessageComposer from "../components/MessageComposer";
import MessageList from "../components/MessageList";
import PixelButton from "../components/PixelButton";

export default function RoomChatPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);
  const connectSocket = useSocketStore((state) => state.connectSocket);
  const user = useSocketStore((state) => state.user);
  const room = useSocketStore((state) => state.currentRoom);
  const messages = useSocketStore((state) => state.roomMessages);
  const setCurrentRoom = useSocketStore((state) => state.setCurrentRoom);
  const setRoomMessages = useSocketStore((state) => state.setRoomMessages);
  const addRoomMessage = useSocketStore((state) => state.addRoomMessage);
  const resetRoom = useSocketStore((state) => state.resetRoom);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [roomDeleted, setRoomDeleted] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket) {
      connectSocket();
      return;
    }
    const joined = ({ room: nextRoom, messages: nextMessages }) => {
      setCurrentRoom(nextRoom);
      setRoomMessages(nextMessages);
    };
    const updated = (nextRoom) => setCurrentRoom(nextRoom);
    const deleted = (deletedRoomId) => {
      if (deletedRoomId === roomId) {
        setRoomDeleted(true);
        setError("");
      }
    };
    const roomError = (message) => setError(message);
    if (!isConnected) return;

    const joinRoom = () => socket.emit("JOIN_ROOM", roomId);

    socket.on("ROOM_JOINED", joined);
    socket.on("ROOM_UPDATED", updated);
    socket.on("ROOM_DELETED", deleted);
    socket.on("ROOM_ERROR", roomError);
    socket.on("RECEIVE_ROOM_MESSAGE", addRoomMessage);
    joinRoom();
    return () => {
      socket.off("ROOM_JOINED", joined);
      socket.off("ROOM_UPDATED", updated);
      socket.off("ROOM_DELETED", deleted);
      socket.off("ROOM_ERROR", roomError);
      socket.off("RECEIVE_ROOM_MESSAGE", addRoomMessage);
    };
  }, [
    addRoomMessage,
    connectSocket,
    isConnected,
    navigate,
    resetRoom,
    roomId,
    setCurrentRoom,
    setRoomMessages,
    socket,
  ]);

  function sendMessage(event) {
    event.preventDefault();
    if (!input.trim()) return;
    socket?.emit("SEND_ROOM_MESSAGE", { roomId, content: input });
    setInput("");
  }

  function leaveRoom() {
    socket?.emit("LEAVE_ROOM", roomId);
    resetRoom();
    navigate("/rooms", { replace: true });
  }

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Unable to copy the room ID. Please copy it manually.");
    }
  }

  function deleteRoom() {
    socket?.emit("DELETE_ROOM", roomId);
  }

  function returnToRooms() {
    resetRoom();
    navigate("/rooms", { replace: true });
  }

  return (
    <div className="flex justify-center items-center bg-slate-900 min-h-screen px-3">
      <div className="w-full max-w-3xl h-[90vh] pixel-panel p-4 flex flex-col bg-slate-800">
        <header className="flex justify-between items-center border-b-2 border-black pb-3 mb-3 gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold">{room?.name || "ROOM CHAT"}</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400 truncate">{roomId}</p>
              <PixelButton
                onClick={copyRoomId}
                aria-label="Copy room ID"
                title="Copy room ID"
                className="p-1 text-slate-300"
              >
                <Copy size={14} />
              </PixelButton>
              {copied && <span className="text-xs text-green-400">COPIED</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400 flex items-center gap-1">
              <Users size={16} /> {room ? room.memberCount : "..."}
            </span>
            {room?.creatorId === user.userId && (
              <PixelButton
                onClick={deleteRoom}
                disabled={roomDeleted}
                aria-label="Delete room"
                title="Delete room"
                className="bg-red-950 text-red-300 p-1.5"
              >
                <Trash2 size={16} />
              </PixelButton>
            )}
            <PixelButton
              onClick={leaveRoom}
              className="bg-red-600 text-white px-3 py-1.5 flex gap-2 items-center"
            >
              <LogOut size={16} /> EXIT
            </PixelButton>
          </div>
        </header>
        {error && (
          <p className="border-2 border-red-500 bg-red-950 text-red-300 p-3 mb-3">
            {error}
          </p>
        )}
        {roomDeleted && (
          <div className="border-2 border-amber-500 bg-amber-950 text-amber-200 p-3 mb-3 flex items-center justify-between gap-3">
            <p>The room was deleted by its creator.</p>
            <PixelButton
              onClick={returnToRooms}
              className="bg-amber-500 text-black px-3 py-1.5 whitespace-nowrap"
            >
              BACK TO ROOMS
            </PixelButton>
          </div>
        )}

        <MessageList
          messages={messages}
          bottomRef={bottomRef}
          className="pixel-input flex-1 p-4 overflow-y-auto space-y-3 mb-3 bg-slate-950 border-4 scrollbar-track-slate-950 scrollbar-thin scrollbar-thumb-slate-400"
          renderMessage={(message, index) =>
            message.type === "system" ? (
              <div
                key={`${message.senderId}-${index}`}
                className="text-center text-sm text-slate-400 py-1"
              >
                {message.content}
              </div>
            ) : (
              <div
                key={`${message.senderId}-${index}`}
                className={`flex ${message.senderId === user.userId ? "justify-end" : "justify-start"}`}
              >
                <div>
                  <p className="text-xs text-purple-400 p-1">
                    {message.senderId === user.userId
                      ? "> You"
                      : "> " + message.senderName}
                  </p>
                  <div
                    className={`inline-block px-3 py-2 border-2 border-black max-w-md ${message.senderId === user.userId ? "bg-slate-700 text-white" : "bg-slate-900 text-green-400"}`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            )
          }
        />
        <MessageComposer
          value={input}
          onChange={setInput}
          onSubmit={sendMessage}
          disabled={roomDeleted || !isConnected}
        />
      </div>
    </div>
  );
}
