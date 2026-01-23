import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { fetchUserInfo } from "../services/apiService";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [nickname, setNickname] = useState("");
  const [totalGameSessions, setTotalGameSessions] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0.0);
  const [gameSessions, setGameSessions] = useState([]);

  const refreshUserData = useCallback(async () => {
    try {
      const userInfo = await fetchUserInfo();
      setNickname(userInfo.nickname);
      setTotalGameSessions(userInfo.total_game_sessions);
      setTotalScore(userInfo.total_score);
      setAvgAccuracy(userInfo.avg_accuracy);
      setGameSessions(userInfo.game_sessions);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      nickname,
      totalGameSessions,
      totalScore,
      avgAccuracy,
      gameSessions,
      setNickname,
      setTotalGameSessions,
      setTotalScore,
      setAvgAccuracy,
      setGameSessions,
      refreshUserData: refreshUserData,
    }),
    [
      nickname,
      totalGameSessions,
      totalScore,
      avgAccuracy,
      gameSessions,
      refreshUserData,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
