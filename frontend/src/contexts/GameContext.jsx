import { createContext, useContext, useState } from "react";
import { startGameSession } from "../services/apiService";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameSessionId, setGameSessionId] = useState(null);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(1);
  const [totalRounds, setTotalRounds] = useState(0);
  const [roundRecords, setRoundRecords] = useState([]);

  const value = {
    gameSessionId,
    setGameSessionId,
    score,
    setScore,
    rounds,
    setRounds,
    totalRounds,
    setTotalRounds,
    roundRecords,
    setRoundRecords,
  };

  const startNewGame = async () => {
    try {
      const response = await startGameSession();
      setGameSessionId(response.game_session_id);
      setTotalRounds(response.total_rounds);

      setScore(0);
      setRounds(1);
      setRoundRecords([]);
      return response;
    } catch (error) {
      console.error("Failed to start game:", error);
      throw error;
    }
  };

  return (
    <GameContext.Provider value={{ ...value, startNewGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
