import { Trophy, House, RotateCcw } from "lucide-react";
import { useGame } from "../contexts/GameContext";

function GameResult() {
  const { score, totalRounds } = useGame();

  return (
    <div className="center w-screen h-screen">
      <div className="relative w-8/10 h-9/10  bg-white rounded-4xl shadow-2xl overflow-hidden">
        <div className="center flex-col gap-4 relative bg-darker-primary w-full h-4/10 ">
          <div className="p-4 bg-white rounded-full shadow-md">
            <Trophy className="text-darker-primary size-10" />
          </div>
          {/* <div className="absolute left-1/2 -bottom-20 bg-darker-primary w-5/4 h-70 [clip-path:ellipse(50%_50%_at_50%_50%)] z-10 transform -translate-x-1/2"></div> */}
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
        <div className="grid grid-cols-2 gap-3 p-3 h-5/10 bg-gray-100 overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: 10 }).map((_, index) => (
            <div className="flex items-center gap-2 bg-white h-30 p-3 rounded-lg shadow-sm overflow-hidden">
              <img
                src="https://images.dog.ceo/breeds/terrier-dandie/n02096437_2890.jpg"
                alt=""
                className="object-cover object-center bg-primary h-full aspect-square rounded-lg"
              />
              <div className="flex-1 grid grid-cols-2 h-full gap-2">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <p className="center bg-gray-100 text-gray-400 text-sm border border-gray-300 rounded-md">
                    Dog1
                  </p>
                ))}
              </div>
              <p className="text-center w-1/10 p-2 bg-green-200 text-green-600 text-sm font-semibold rounded-md">
                +100
              </p>
            </div>
          ))}
        </div>
        <div className="center gap-10 px-10 w-full h-1/10">
          <button className="center flex-1 gap-2 py-3 font-semibold text-brown bg-white border-2 border-darker-primary rounded-2xl">
            <House className="inline-block size-6" /> HOME
          </button>
          <button className="center flex-1 gap-2 py-3 font-semibold text-white bg-darker-primary border-2 border-darker-primary rounded-2xl">
            <RotateCcw className="inline-block size-6" /> PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameResult;
