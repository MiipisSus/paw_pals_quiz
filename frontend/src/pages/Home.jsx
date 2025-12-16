import { useNavigate } from "react-router-dom";
import { PawPrint } from "lucide-react";

import { useGame } from "../contexts/GameContext.jsx";
import { startGameSession } from "../services/apiService";

function Home() {
  const navigate = useNavigate();
  const { setGameSessionId, setTotalRounds, startNewGame } = useGame();

  const handleStartGame = async () => {
    try {
      await startNewGame();
      navigate("/game");
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  return (
    <div className="center h-screen">
      <div className="center flex-col gap-2 w-3/10 h-7/10 py-10 bg-white rounded-4xl shadow-2xl">
        <div className="center flex-col gap-2 mt-auto mb-10">
          <PawPrint className="size-20 p-3 mb-5 bg-accent text-primary rounded-full shadow-inner" />
          <h1 className="text-4xl font-extrabold text-center text-darker-primary">
            PAW PALS
            <br />
            <span className="text-darker-accent">QUIZ</span>
          </h1>
          <h2 className="font-medium text-light-brown">
            WHO is the real "Dogge" master?
          </h2>
        </div>
        <div className="center flex-col w-full gap-4">
          <button className="w-1/2 py-3 bg-darker-primary text-brown font-bold rounded-3xl cursor-pointer">
            Login
          </button>
          <button
            className="w-1/2 py-3 bg-darker-accent text-white font-bold rounded-3xl cursor-pointer"
            onClick={handleStartGame}
          >
            Play as Guest
          </button>
        </div>
        <p className="mt-auto text-sm text-light-brown font-bold">
          PAW PALS QUIZ ・ 2025
        </p>
      </div>
    </div>
  );
}

export default Home;
