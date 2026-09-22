import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Matchmaking from "./pages/Matchmaking";
import ChatPage from "./pages/ChatPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matchmaking" element={<Matchmaking />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
