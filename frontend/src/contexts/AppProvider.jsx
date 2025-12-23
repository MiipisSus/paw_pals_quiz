import { UserProvider } from "./UserContext.jsx";
import { GameProvider } from "./GameContext.jsx";
import { AuthProvider } from "./AuthContext.jsx";

export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <UserProvider>
        <GameProvider>{children}</GameProvider>
      </UserProvider>
    </AuthProvider>
  );
}
