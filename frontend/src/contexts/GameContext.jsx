import { createContext, useContext, useState } from "react";

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

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
