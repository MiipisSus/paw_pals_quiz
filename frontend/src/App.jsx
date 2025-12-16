import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import Home from "./pages/Home.jsx";
import Game from "./pages/Game.jsx";
import GameResult from "./pages/GameResult.jsx";
import { GameProvider } from "./contexts/GameContext.jsx";

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/game" element={<MainLayout />}>
            <Route index element={<Game />} />
          </Route>
          <Route path="/game-result" element={<GameResult />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
