import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search } from "lucide-react";
import useSocketStore from "../store/useSocketStore";

export default function Matchmaking() {
  const navigate = useNavigate();

  const { socket, setIsMatchingForChat, setCurrentChatId, resetPrivateChat } =
    useSocketStore();
  const [timer, setTimer] = useState(0);

  useEffect(() => resetPrivateChat(), []);

  useEffect(() => {
    if (!socket) return;

    const joinQueue = () => {
      socket.emit("START_CHAT_MATCHMAKING");
    };

    if (!socket.connected) {
      socket.connect();
      socket.once("connect", joinQueue);
    } else {
      joinQueue();
    }

    socket.on("MATCH_FOUND", (chatId) => {
      setCurrentChatId(chatId);
      navigate(`/chat/${chatId}`,{replace:true});
    });

    const interval = setInterval(() => {
      setTimer((p) => p + 1);
    }, 1000);

    return () => {
      clearInterval(interval);

      socket.off("connect", joinQueue);
      socket.emit("cancel_matchmaking");
    };
  }, [socket, navigate]);

  const handleCancel = () => {
    socket?.emit("CANCEL_CHAT_MATCHMAKING");
    navigate("/",{replace:true});
    setIsMatchingForChat(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-950">
      <div className="w-full max-w-sm pixel-panel p-6 text-center bg-slate-800">
        <div className="inline-flex p-3 bg-slate-900 border-2 border-black mb-4 shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Search size={32} className="text-indigo-400 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold mb-2 uppercase">FINDING SOMEONE</h1>

        <p className="text-slate-400 text-sm mb-6 font-bold uppercase">
          Looking for someone to chat with...
        </p>

        <div className="pixel-input p-6 mb-6">
          <span className="text-xs text-slate-400 block mb-1 font-bold">
            WAITING TIME
          </span>

          <span className="text-4xl text-green-400 font-bold">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </span>
        </div>

        <button
          onClick={handleCancel}
          className="w-full pixel-btn bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 flex justify-center items-center gap-2"
        >
          <X size={18} />
          CANCEL
        </button>
      </div>
    </div>
  );
}
