import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import useSocketStore from "../store/useSocketStore";
import MessageComposer from "../components/MessageComposer";
import MessageList from "../components/MessageList";
import PixelButton from "../components/PixelButton";

export default function Chat() {
  const { chatId: routeChatId } = useParams();
  const navigate = useNavigate();

  const socket = useSocketStore((s) => s.socket);
  const user = useSocketStore((s) => s.user);
  const messages = useSocketStore((s) => s.privateMessages);
  const addMessage = useSocketStore((s) => s.addPrivateMessages);
  const connectSocket = useSocketStore((s) => s.connectSocket);

  const connected = useSocketStore((s) => s.isConnected);
  const setCurrentChatId = useSocketStore((s) => s.setCurrentChatId);
  const [input, setInput] = useState("");

  const bottomRef = useRef(null);

  const [partnerLeft, setPartnerLeft] = useState(false);
  const activeChatId = routeChatId;

  useEffect(() => {
    if (!activeChatId) {
      navigate("/", { replace: true });
      return;
    }

    if (!socket) {
      connectSocket();
      return;
    }

    const receiveMessage = (message) => {
      addMessage(message);
    };

    const partnerLeftHandler = () => setPartnerLeft(true);

    socket.on("RECEIVE_PRIVATE_MESSAGE", receiveMessage);
    socket.on("PARTNER_LEFT", partnerLeftHandler);

    return () => {
      socket.off("RECEIVE_PRIVATE_MESSAGE", receiveMessage);
      socket.off("PARTNER_LEFT", partnerLeftHandler);
    };
  }, [activeChatId, addMessage, connectSocket, navigate, socket]);

  function sendMessage(e) {
    e.preventDefault();

    const content = input.trim();
    if (!content || !socket || !activeChatId) return;

    const message = {
      senderId: user.userId,
      content,
      chatId: activeChatId,
    };

    socket.emit("SEND_PRIVATE_MESSAGE", message);
    addMessage(message);
    setInput("");
  }

  function exitChat() {
    setCurrentChatId(null);
    socket?.emit("EXIT_PRIVATE_CHAT", activeChatId);
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

          <PixelButton
            onClick={exitChat}
            className="bg-red-600 text-white px-3 py-1.5 flex gap-2 items-center"
          >
            <LogOut size={16} />
            EXIT
          </PixelButton>
        </div>

        {/* Messages */}
        <MessageList
          partnerLeft={partnerLeft}
          messages={messages}
          bottomRef={bottomRef}
          className="pixel-input flex-1 p-4 overflow-y-auto space-y-4 mb-3 bg-slate-950 border-4 scrollbar-track-slate-950 scrollbar-thin scrollbar-thumb-slate-400"
          renderMessage={(message, index) => {
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
          }}
        />

        {/* {partnerLeft && (
          <div className="flex flex-col items-center justify-center gap-6 mb-3">
            <div className="text-red-500 text-center text-2xl">
              Chat Ended. Partner left the chat
            </div>

            <div className="flex gap-4">
              <PixelButton
                onClick={() => navigate("/matchmaking")}
                className="bg-blue-500 text-white px-3 py-2"
              >
                Find Another Match
              </PixelButton>
              <PixelButton
                onClick={() => navigate("/")}
                className="bg-orange-500 text-white px-3 py-2"
              >
                Home
              </PixelButton>
            </div>
          </div>
        )} */}

        {/* Input */}
        <MessageComposer
          value={input}
          onChange={setInput}
          onSubmit={sendMessage}
          disabled={partnerLeft || !connected}
          inputClassName="py-4"
        />
      </div>
    </div>
  );
}
