export default function RoomMessage({ message, userId }) {
  if (message.type === "system") {
    return (
      <div
        className="text-center text-sm text-slate-400 py-1"
      >
        {message.content}
      </div>
    );
  }

  const isOwnMessage = message.senderId === userId;

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div>
        <p className="text-xs text-purple-400 p-1">
          {isOwnMessage ? "> You" : "> " + message.senderName}
        </p>
        <div
          className={`inline-block px-3 py-2 border-2 border-black max-w-md ${isOwnMessage ? "bg-slate-700 text-white" : "bg-slate-900 text-green-400"}`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
