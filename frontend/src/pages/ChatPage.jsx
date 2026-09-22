import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import useSocketStore from "../store/useSocketStore";

export default function Chat() {
  const params = useParams();
  const navigate = useNavigate();

  const socket = useSocketStore((s) => s.socket);
  const user = useSocketStore((s) => s.user);
  const messages = useSocketStore((s) => s.privateMessages);
  const addMessage = useSocketStore((s) => s.addPrivateMessages);
  const chatId = useSocketStore((s) => s.currentChatId);
  const connectSocket = useSocketStore((s) => s.connectSocket);

  const connected = useSocketStore((s) => s.isConnected);
  const setConnected = useSocketStore((s) => s.setConnected);
  const setCurrentChatId = useSocketStore((s) => s.setCurrentChatId);
  const [input, setInput] = useState("");

  const bottomRef = useRef(null);

  const [partnerLeft, setPartnerLeft] = useState(false);

  useEffect(() => {
    if (!chatId) {
      navigate("/", { replace: true });
    }
    if (!socket?.connected) {
      connectSocket();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const receiveMessage = (message) => {
      addMessage(message);
    };

    const disconnect = () => setConnected(false);

    socket.on("RECEIVE_PRIVATE_MESSAGE", receiveMessage);
    socket.on("partner_disconnected", disconnect);

    socket.on("PARTNER_LEFT", () => {
      setPartnerLeft(true);
    });

    return () => {
      socket.off("RECEIVE_PRIVATE_MESSAGE", receiveMessage);
      socket.off("partner_disconnected", disconnect);
    };
  }, [addMessage, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();

    const content = input.trim();
    if (!content || !socket) return;

    const message = {
      senderId: user.userId,
      content,
      chatId: chatId || params.chatId,
    };

    socket.emit("SEND_PRIVATE_MESSAGE", message);
    addMessage(message);
    setInput("");
  }

  function exitChat() {
    console.log("exitting chat");
    setCurrentChatId(null);
    socket?.emit("EXIT_PRIVATE_CHAT", chatId || params.chatId);
    navigate("/", { replace: true });
  }

  return (
    <div className="flex justify-center items-center bg-slate-900 min-h-screen h-screen">
      <div className="w-full max-w-3xl h-[90vh] pixel-panel p-4 flex flex-col bg-slate-800 border-2">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-3">
          <div>
            <h1 className="text-xl font-bold">ANONYMOUS CHAT</h1>
            <span
              className={`text-xs font-bold ${
                connected ? "text-green-400" : "text-red-500"
              }`}
            >
              {connected ? "CONNECTED" : "DISCONNECTED"}
            </span>
          </div>

          <button
            onClick={exitChat}
            className="pixel-btn bg-red-600 text-white px-3 py-1.5 flex gap-2 items-center"
          >
            <LogOut size={16} />
            EXIT
          </button>
        </div>

        {/* Messages */}
        <div className="pixel-input flex-1 p-4 overflow-y-auto space-y-4 mb-3 bg-slate-950 border-4">
          {messages.map((message, index) => {
            const own = message.senderId === user.userId;

            return (
              <div
                key={index}
                className={`flex ${own ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 border-2 border-black max-w-md ${
                    own
                      ? "bg-slate-700 text-white"
                      : "bg-slate-900 text-green-400"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })}

          {partnerLeft && (
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="text-red-500 text-center text-2xl">
                Chat Ended. Partner left the chat
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/matchmaking")}
                  className="bg-blue-500 text-white px-3 py-2"
                >
                  Find Another Match
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="bg-orange-500 text-white px-3 py-2"
                >
                  Home
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex gap-2 items-center block">
          <input
            value={input}
            disabled={partnerLeft}
            onChange={(e) => setInput(e.target.value)}
            className="pixel-input flex-1 px-3 text-white outline-none bg-slate-950 py-4 border-2 border-black disabled:cursor-not-allowed"
            placeholder="Message..."
          />

          <button
            type="submit"
            disabled={!connected || !input.trim()}
            className="pixel-btn bg-green-600 text-black font-bold px-5 disabled:opacity-50 py-4 border-2"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}
