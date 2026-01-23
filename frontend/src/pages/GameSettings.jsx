import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings, Play, ArrowLeft } from "lucide-react";
import { useGame } from "../contexts/GameContext";

function GameSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { startNewGame } = useGame();
  
  const [selectedRounds, setSelectedRounds] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const roundOptions = [3, 5, 10, 15, 20];

  const handleStartGame = async () => {
    setIsLoading(true);
    try {
      await startNewGame(selectedRounds);
      navigate("/game");
    } catch (error) {
      console.error(t("game.startGameFailed"), error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="center h-screen">
      <div className="flex justify-between items-center flex-col gap-8 w-3/10 min-w-120 h-8/10 px-10 py-10 bg-white rounded-4xl shadow-2xl">
        <div className="center flex-col gap-2">
          <div className="center size-20 mb-4 bg-darker-accent/10 rounded-full">
            <Settings className="size-10 text-darker-accent" />
          </div>
          <h1 className="text-brown text-3xl font-bold text-center">
            {t("gameSettings.title")}&nbsp;
            <span className="text-darker-accent">{t("gameSettings.titleHighlight")}</span>
          </h1>
          <h2 className="text-brown/50 font-semibold text-center">
            {t("gameSettings.subtitle")}
          </h2>
        </div>

        <div className="flex flex-col gap-6 w-full">
          {/* 回合數選擇 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-brown text-lg font-bold">
                {t("gameSettings.rounds")}
              </h3>
              <span className="text-darker-accent text-2xl font-bold">
                {selectedRounds}
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {roundOptions.map((rounds) => (
                <button
                  key={rounds}
                  onClick={() => setSelectedRounds(rounds)}
                  className={`
                    center py-3 px-2 font-bold rounded-xl transition-all duration-200
                    ${
                      selectedRounds === rounds
                        ? "bg-darker-accent text-white shadow-lg scale-105"
                        : "bg-secondary text-brown hover:bg-darker-primary/20 hover:scale-105"
                    }
                  `}
                >
                  {rounds}
                </button>
              ))}
            </div>
          </div>

          {/* 難度選擇 (未來功能，目前禁用) */}
          <div className="flex flex-col gap-3 opacity-50">
            <div className="flex items-center justify-between">
              <h3 className="text-brown text-lg font-bold">
                {t("gameSettings.difficulty")}
              </h3>
              <span className="text-brown/50 text-sm">
                {t("gameSettings.comingSoon")}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled
                className="py-3 px-4 bg-secondary text-brown font-bold rounded-xl cursor-not-allowed"
              >
                {t("gameSettings.easy")}
              </button>
              <button
                disabled
                className="py-3 px-4 bg-secondary text-brown font-bold rounded-xl cursor-not-allowed"
              >
                {t("gameSettings.medium")}
              </button>
              <button
                disabled
                className="py-3 px-4 bg-secondary text-brown font-bold rounded-xl cursor-not-allowed"
              >
                {t("gameSettings.hard")}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleStartGame}
            disabled={isLoading}
            className={`
              center gap-3 w-full py-4 text-white text-lg font-bold rounded-3xl btn-animate
              ${
                isLoading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-darker-accent hover:brightness-110"
              }
            `}
          >
            <Play className="size-5" />
            {isLoading ? t("gameSettings.starting") : t("gameSettings.startGame")}
          </button>

          <button
            onClick={() => navigate("/")}
            className="center gap-2 w-full py-3 text-darker-primary font-semibold btn-text-animate hover:text-darker-accent"
          >
            <ArrowLeft className="size-4" />
            {t("gameSettings.backToHome")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameSettings;
