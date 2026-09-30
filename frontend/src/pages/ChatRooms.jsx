import { useEffect, useState } from "react";
import { ArrowLeft, DoorOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSocketStore from "../store/useSocketStore";
import PixelButton from "../components/PixelButton";

export default function ChatRooms() {
  const navigate = useNavigate();
  const socket = useSocketStore((state) => state.socket);
  const connectSocket = useSocketStore((state) => state.connectSocket);
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [ownedRooms, setOwnedRooms] = useState([]);
  const [error, setError] = useState("");
  const isConnected = useSocketStore((state) => state.isConnected);

  useEffect(() => {
    if (!socket) {
      connectSocket();
      return;
    }
    const roomError = (message) => setError(message);
    const roomJoined = ({ room }) => navigate(`/rooms/${room.roomId}`);
    const updateOwnedRooms = (nextRooms) => setOwnedRooms(nextRooms);
    const requestOwnedRooms = () => socket.emit("GET_MY_ROOMS");

    socket.on("ROOM_ERROR", roomError);
    socket.on("ROOM_JOINED", roomJoined);
    socket.on("MY_ROOMS", updateOwnedRooms);
    socket.on("connect", requestOwnedRooms);
    if (isConnected) requestOwnedRooms();
    return () => {
      socket.off("ROOM_ERROR", roomError);
      socket.off("ROOM_JOINED", roomJoined);
      socket.off("MY_ROOMS", updateOwnedRooms);
      socket.off("connect", requestOwnedRooms);
    };
  }, [connectSocket, isConnected, navigate, socket]);

  function createRoom(event) {
    event.preventDefault();
    const name = roomName.trim();
    if (!name) {
      setError("A room name is required.");
      return;
    }
    setError("");
    socket?.emit("CREATE_ROOM", { name });
  }

  function joinRoom(event) {
    event.preventDefault();
    const normalizedRoomId = roomId.trim();
    if (!normalizedRoomId) {
      setError("A room ID is required.");
      return;
    }
    setError("");
    socket?.emit("JOIN_ROOM", normalizedRoomId);
  }

  function joinOwnedRoom(roomIdToJoin) {
    setError("");
    socket?.emit("JOIN_ROOM", roomIdToJoin);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center px-4 py-8">
      <main className="w-full max-w-2xl pixel-panel bg-slate-800 p-5 text-white">
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
          <PixelButton
            onClick={() => navigate("/")}
            className="px-3 py-2 flex gap-2 items-center"
          >
            <ArrowLeft size={17} /> HOME
          </PixelButton>
          <h1 className="text-2xl font-bold">CHAT ROOMS</h1>
        </div>

        <section className="mb-5 pb-5">
          <h2 className="font-bold text-lg mb-3">CREATE ROOM</h2>
          <form
            onSubmit={createRoom}
            className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"
          >
            <input
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              className="pixel-input bg-slate-950 text-white px-3 py-2 border-2 border-black"
              placeholder="Room name"
              required
              maxLength={40}
            />
            <PixelButton
              type="submit"
              className="bg-green-600 text-black px-3 py-2 cursor-pointer"
            >
              CREATE ROOM
            </PixelButton>
          </form>
        </section>

        <section className="pt-5">
          <h2 className="font-bold text-lg mb-3">JOIN A ROOM</h2>
          <form onSubmit={joinRoom} className="flex gap-2">
            <input
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              className="pixel-input flex-1 bg-slate-950 text-white px-3 py-2 border-2 border-black"
              placeholder="Paste room ID"
            />
            <PixelButton
              type="submit"
              disabled={!roomId.trim()}
              className="bg-amber-500 text-black px-3 py-2 flex gap-2 items-center disabled:opacity-50 cursor-pointer"
            >
              <DoorOpen size={16} /> JOIN
            </PixelButton>
          </form>
          {error && <p className="mt-3 text-red-400">{error}</p>}
        </section>

        {ownedRooms.length !== 0 && (
          <section className="mb-6 mt-6 pb-5">
            <h2 className="font-bold text-lg mb-3">YOUR LIVE ROOMS</h2>
            {ownedRooms.length === 0 ? (
              <p className="text-slate-400">You do not have any live rooms.</p>
            ) : (
              <div className="space-y-2">
                {ownedRooms.map((room) => (
                  <div
                    key={room.roomId}
                    className="border-2 border-black bg-slate-950 p-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold truncate">{room.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {room.roomId}
                      </p>
                    </div>
                    <span className="text-green-400 flex items-center gap-1 text-sm">
                      <Users size={15} /> {room.memberCount}
                    </span>
                    <PixelButton
                      onClick={() => joinOwnedRoom(room.roomId)}
                      className="bg-indigo-700 text-white px-3 py-1.5 flex gap-2 items-center cursor-pointer"
                    >
                      <DoorOpen size={16} /> JOIN
                    </PixelButton>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
