import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import HomeLayout from "./layouts/HomeLayout.jsx";
import Home from "./pages/Home.jsx";
import Game from "./pages/Game.jsx";
import GameResult from "./pages/GameResult.jsx";
import Login from "./pages/Login.jsx";
import UserInfo from "./pages/UserInfo.jsx";
import { GameProvider } from "./contexts/GameContext.jsx";

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/" element={<MainLayout />}>
            <Route path="/game" element={<Game />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user-info" element={<UserInfo />} />
          </Route>
          <Route path="/game-result" element={<GameResult />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
