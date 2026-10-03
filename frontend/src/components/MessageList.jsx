import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PixelButton from "./PixelButton";

export default function MessageList({
  partnerLeft,
  roomDeleted,
  roomUnavailable,
  onRoomDeleted,
  onRoomUnavailable,
  messages,
  bottomRef,
  renderMessage,
  className = "",
}) {
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [bottomRef, messages, partnerLeft]);

  return (
    <div className={className}>
      {messages.map(renderMessage)}
      {partnerLeft && (
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
      )}
      {roomDeleted && (
        <div className="flex flex-col items-center justify-center gap-6 mb-3">
          <div className="text-red-500 text-center text-2xl">
            The room was deleted by its creator.
          </div>
          <PixelButton
            onClick={onRoomDeleted}
            className="bg-orange-500 text-white px-3 py-2"
          >
            BACK TO ROOMS
          </PixelButton>
        </div>
      )}
      {!roomDeleted && roomUnavailable && (
        <div className="flex flex-col items-center justify-center gap-6 mb-3">
          <div className="text-red-500 text-center text-2xl">
            That room does not exist or has been closed.
          </div>
          <PixelButton
            onClick={onRoomUnavailable}
            className="bg-orange-500 text-white px-3 py-2"
          >
            BACK TO ROOMS
          </PixelButton>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
