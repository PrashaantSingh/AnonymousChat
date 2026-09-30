import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Matchmaking from "./pages/Matchmaking";
import ChatPage from "./pages/ChatPage";
import ChatRooms from "./pages/ChatRooms";
import RoomChatPage from "./pages/RoomChatPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matchmaking" element={<Matchmaking />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
          <Route path="/rooms" element={<ChatRooms />} />
          <Route path="/rooms/:roomId" element={<RoomChatPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
