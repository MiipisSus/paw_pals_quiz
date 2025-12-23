import { createContext, useContext, useState, useMemo } from "react";
import { startGameSession } from "../services/apiService";

const GameContext = createContext(undefined);

export function GameProvider({ children }) {
  const [gameSessionId, setGameSessionId] = useState(null);
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(0);
  const [roundRecords, setRoundRecords] = useState([]);

  const startNewGame = async () => {
    const res = await startGameSession();

    setGameSessionId(res.game_session_id);
    setTotalRounds(res.total_rounds);
    setScore(0);
    setCurrentRound(1);
    setRoundRecords([]);
  };

  const value = useMemo(
    () => ({
      gameSessionId,
      score,
      currentRound,
      totalRounds,
      roundRecords,
      startNewGame,
      setScore,
      setCurrentRound,
      setTotalRounds,
      setRoundRecords,
    }),
    [gameSessionId, score, currentRound, totalRounds, roundRecords]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame must be used within GameProvider");
  }
  return ctx;
}
