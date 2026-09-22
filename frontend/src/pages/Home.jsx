import { useEffect, useState } from "react";
import { Users, Globe, MessageSquare, Gamepad2 } from "lucide-react";
import useSocketStore from "../store/useSocketStore";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const {
    connectSocket,
    user,
    isConnected,
    isMatchingForChat,
    setIsMatchingForChat,
    socket,
  } = useSocketStore();
  const [mode, setMode] = useState("chat");
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket?.connected) {
      connectSocket();
    }
  }, []);

  function handleMatching() {
    // socket?.emit("START_CHAT_MATCHMAKING");
    setIsMatchingForChat(true);
    navigate("/matchmaking");
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center px-4">
      {/* Mode Selector */}
      <div className="w-full max-w-md mb-4">
        <div className="border-2 border-black bg-slate-800 p-1 shadow-[4px_4px_0_0_#000]">
          <div className="flex">
            <button
              onClick={() => setMode("chat")}
              className={`
                flex-1 flex items-center justify-center gap-2
                py-2
                font-bold text-sm
                border-2
                transition-all
                ${
                  mode === "chat"
                    ? "bg-slate-200 text-black border-black shadow-[2px_2px_0_0_#000]"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }
              `}
            >
              <MessageSquare size={17} />
              CHAT MODE
            </button>

            <button
              onClick={() => setMode("game")}
              className={`
                flex-1 flex items-center justify-center gap-2
                py-2
                font-bold text-sm
                border-2
                transition-all
                ${
                  mode === "game"
                    ? "bg-slate-200 text-black border-black shadow-[2px_2px_0_0_#000]"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }
              `}
            >
              <Gamepad2 size={17} />
              GAME MODE
            </button>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md border-2 border-black bg-slate-800 p-6 shadow-[6px_6px_0_0_#000]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-3">
          <h1 className="text-2xl font-bold text-white uppercase">
            StrangerHub
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

        {/* Mode Actions */}
        <div className="space-y-4">
          {mode === "chat" ? (
            <>
              <button
                onClick={handleMatching}
                className="
                  w-full
                  border-2 border-black
                  bg-indigo-700
                  hover:bg-indigo-600
                  text-white
                  font-bold
                  py-3 px-4
                  flex items-center justify-center gap-2
                  text-lg
                  shadow-[4px_4px_0_0_#000]
                  active:translate-x-[2px]
                  active:translate-y-[2px]
                  active:shadow-[2px_2px_0_0_#000]
                  transition-all
                "
              >
                <Users size={20} />
                ANONYMOUS CHAT
              </button>

              <button
                className="
                  w-full
                  border-2 border-black
                  bg-slate-600
                  hover:bg-slate-500
                  text-white
                  font-bold
                  py-3 px-4
                  flex items-center justify-center gap-2
                  text-lg
                  shadow-[4px_4px_0_0_#000]
                  active:translate-x-[2px]
                  active:translate-y-[2px]
                  active:shadow-[2px_2px_0_0_#000]
                  transition-all
                "
              >
                <Globe size={20} />
                CHAT ROOMS
              </button>
            </>
          ) : (
            <>
              <button
                className="
                  w-full
                  border-2 border-black
                  bg-amber-500
                  hover:bg-amber-400
                  text-black
                  font-bold
                  py-3 px-4
                  flex items-center justify-center gap-2
                  text-lg
                  shadow-[4px_4px_0_0_#000]
                "
              >
                <Users size={20} />
                RANDOM MATCH
              </button>

              <button
                className="
                  w-full
                  border-2 border-black
                  bg-slate-600
                  hover:bg-slate-500
                  text-white
                  font-bold
                  py-3 px-4
                  flex items-center justify-center gap-2
                  text-lg
                  shadow-[4px_4px_0_0_#000]
                "
              >
                <Globe size={20} />
                GAME LOBBIES
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
