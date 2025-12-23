import { UserProvider } from "./UserContext.jsx";
import { GameProvider } from "./GameContext.jsx";

export function AppProvider({ children }) {
  return (
    <UserProvider>
      <GameProvider>{children}</GameProvider>
    </UserProvider>
  );
}
