import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PawPrint } from "lucide-react";

import { useGame } from "../contexts/GameContext.jsx";
import { tokenManager, logoutUser } from "../services/apiService";

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setGameSessionId, setTotalRounds, startNewGame } = useGame();
  const [isLoggedIn, setIsLoggedIn] = useState(tokenManager.isAuthenticated());

  const handleStartGame = async () => {
    try {
      await startNewGame();
      navigate("/game");
    } catch (error) {
      console.error(t("game.startGameFailed"), error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
    } catch (error) {
      console.error(t("auth.logoutFailed"), error);
      setIsLoggedIn(false);
    }
  };

  return (
    <div className="center h-screen">
      <div className="center flex-col gap-2 w-3/10 min-w-100 h-7/10 py-10 bg-white rounded-4xl shadow-2xl relative">
        <div className="center flex-col gap-2 mt-auto mb-10">
          <PawPrint className="size-20 p-3 mb-5 bg-accent text-primary rounded-full shadow-inner" />
          <h1 className="text-4xl font-extrabold text-center text-darker-primary">
            {t("home.title")}
            <br />
            <span className="text-darker-accent">{t("home.subtitle")}</span>
          </h1>
          <h2 className="font-semibold text-brown/50">{t("home.slogan")}</h2>
        </div>
        <div className="center flex-col w-full gap-4">
          {isLoggedIn ? (
            <>
              <button
                className="w-1/2 py-3 bg-gray-200 text-gray-600 font-bold rounded-3xl cursor-pointer"
                onClick={handleLogout}
              >
                {t("home.buttons.logout")}
              </button>
              <button
                className="w-1/2 py-3 bg-darker-accent text-white font-bold rounded-3xl cursor-pointer"
                onClick={handleStartGame}
              >
                {t("home.buttons.play")}
              </button>
            </>
          ) : (
            <>
              <button
                className="w-1/2 py-3 bg-darker-primary text-brown font-bold rounded-3xl cursor-pointer"
                onClick={() => navigate("/login")}
              >
                {t("home.buttons.login")}
              </button>
              <button
                className="w-1/2 py-3 bg-darker-accent text-white font-bold rounded-3xl cursor-pointer"
                onClick={handleStartGame}
              >
                {t("home.buttons.playAsGuest")}
              </button>
            </>
          )}
        </div>
        <p className="mt-auto text-sm text-brown/30 font-bold">
          {t("home.footer")}
        </p>
      </div>
    </div>
  );
}

export default Home;
