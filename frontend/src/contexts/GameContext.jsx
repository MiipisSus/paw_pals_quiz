import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameSessionId, setGameSessionId] = useState(null);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState(1);

  const value = {
    gameSessionId,
    setGameSessionId,
    score,
    setScore,
    rounds,
    setRounds,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
