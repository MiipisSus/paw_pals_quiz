import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout.jsx";
import HomeLayout from "./layouts/HomeLayout.jsx";
import Home from "./pages/Home.jsx";
import Game from "./pages/Game.jsx";
import GameResult from "./pages/GameResult.jsx";
import Login from "./pages/Login.jsx";
import UserInfo from "./pages/UserInfo.jsx";
import Register from "./pages/Register.jsx";
import GlobalStatics from "./pages/GlobalStatics.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AppProvider } from "./contexts/AppProvider.jsx";

function AppRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleTokenExpired = () => {
      // 導向登入頁面
      navigate("/login");
    };

    // 監聽 token 過期事件
    window.addEventListener("token-expired", handleTokenExpired);

    return () => {
      window.removeEventListener("token-expired", handleTokenExpired);
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Home />} />
      </Route>
      <Route path="/" element={<MainLayout />}>
        <Route path="/game" element={<Game />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/user-info"
          element={
            <ProtectedRoute>
              <UserInfo />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/global-statics" element={<GlobalStatics />} />
      </Route>
      <Route path="/game-result" element={<GameResult />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
