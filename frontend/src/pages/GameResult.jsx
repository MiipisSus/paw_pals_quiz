import { useNavigate } from "react-router-dom";
import { Trophy, House, RotateCcw } from "lucide-react";
import { useGame } from "../contexts/GameContext";

function GameResult() {
  const { score, totalRounds, roundRecords, startNewGame } = useGame();
  const navigate = useNavigate();

  const handlePlayAgain = async () => {
    try {
      await startNewGame();
      navigate("/game");
    } catch (error) {
      console.error("Failed to start new game:", error);
    }
  };

  return (
    <div className="center w-screen h-screen">
      <div className="relative flex flex-col w-6/10 min-w-220 h-9/10 bg-gray-100 rounded-4xl shadow-2xl overflow-hidden border-3 border-gray-100">
        <div className="center flex-col gap-4 relative bg-darker-primary w-full h-4/10">
          <div className="p-4 bg-white rounded-full shadow-md">
            <Trophy className="text-darker-primary size-10" />
          </div>
          <h1 className="text-4xl font-bold text-brown">Game Result</h1>
          <div className="flex gap-4 mt-2">
            <div className="text-center p-4 bg-primary/40 rounded-lg">
              <p className="text-sm font-semibold text-brown/80">TOTAL SCORE</p>
              <p className="text-2xl text-white">{score}</p>
            </div>
            <div className="text-center p-4 bg-primary/40 rounded-lg">
              <p className="text-sm font-semibold text-brown/80">
                TOTAL ROUNDS
              </p>
              <p className="text-2xl text-white">{totalRounds}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-3 overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {roundRecords.length > 0
            ? roundRecords.map((record, index) => (
                <div className="flex items-center gap-2 bg-white h-30 p-3 rounded-lg shadow-sm overflow-hidden">
                  <img
                    src={record.image_url}
                    alt=""
                    className="object-cover object-center bg-primary h-full aspect-square rounded-lg"
                  />
                  <div className="flex-1 grid grid-cols-2 h-full gap-2">
                    {record.choices.length > 0
                      ? record.choices.map((choice, idx) => (
                          <p
                            key={idx}
                            className={`center px-2 text-sm border border-gray-300 rounded-md ${
                              choice.slug === record.correct_slug
                                ? "bg-green-200 text-green-600 border-0"
                                : choice.slug === record.selected_slug
                                ? "bg-red-200 text-red-600 border-0"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {choice.name}
                          </p>
                        ))
                      : null}
                  </div>
                  <p
                    className={`text-center w-1/10 p-2 ${
                      record.is_correct
                        ? "text-green-600 bg-green-200"
                        : "text-red-600 bg-red-200"
                    } text-sm font-semibold rounded-md`}
                  >
                    {record.score > 0 ? `+${record.score}` : "-"}
                  </p>
                </div>
              ))
            : null}
        </div>
        <div className="center gap-10 mt-auto px-10 py-3 w-full h-1/10 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button
            className="center flex-1 gap-2 py-3 font-semibold text-brown bg-white border-2 border-darker-primary rounded-2xl btn-animate hover:bg-gray-50"
            onClick={() => navigate("/")}
          >
            <House className="inline-block size-6" /> HOME
          </button>
          <button
            className="center flex-1 gap-2 py-3 font-semibold text-white bg-darker-primary border-2 border-darker-primary rounded-2xl btn-animate hover:brightness-110"
            onClick={handlePlayAgain}
          >
            <RotateCcw className="inline-block size-6" /> PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameResult;
