import { useEffect } from "react";
import { Users, Globe } from "lucide-react";
import useSocketStore from "../store/useSocketStore";
import { useNavigate } from "react-router-dom";
import PixelButton from "../components/PixelButton";

export default function Home() {
  const { connectSocket, user, isConnected, setIsMatchingForChat, socket } =
    useSocketStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) {
      connectSocket();
    }
  }, [connectSocket, socket]);

  function handleMatching() {
    // socket?.emit("START_CHAT_MATCHMAKING");
    setIsMatchingForChat(true);
    navigate("/matchmaking");
  }

  function handleRooms() {
    navigate("/rooms");
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center px-4">
      {/* Main Card */}
      <div className="w-full max-w-md border-2 border-black bg-slate-800 p-6 shadow-[6px_6px_0_0_#000]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-3">
          <h1 className="text-2xl font-bold text-white uppercase">
            Anonymous Chat
          </h1>

          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <span
              className={`w-3 h-3 border-2 border-black ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />

            {isConnected ? "ONLINE" : "OFFLINE"}
          </div>
        </div>

        {/* Username */}
        <div className="mb-6">
          <label className="text-sm text-slate-400 block mb-1 font-bold">
            DISPLAY NAME
          </label>

          <div className="border-2 border-black bg-slate-950 px-3 py-2 text-xl font-bold uppercase text-green-400">
            {user?.userName || "UNKNOWN"}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <PixelButton
            onClick={handleMatching}
            className="w-full bg-indigo-700 hover:bg-indigo-600 text-white font-bold py-3 px-4 flex items-center justify-center gap-2 text-lg cursor-pointer"
          >
            <Users size={20} />
            ANONYMOUS CHAT
          </PixelButton>

          <PixelButton
            onClick={handleRooms}
            className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 flex items-center justify-center gap-2 text-lg cursor-pointer"
          >
            <Globe size={20} />
            CHAT ROOMS
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
