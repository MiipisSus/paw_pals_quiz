import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, History, Award, Globe, Dog, Users, Star } from "lucide-react";

import { fetchGlobalStats } from "../services/apiService";

function GlobalStatics() {
  const { t, i18n } = useTranslation();
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    fetchGlobalStats().then(data => setGlobalStats(data));
  }, []);

  useEffect(() => {
    fetchGlobalStats().then(data => setGlobalStats(data));
  }, [i18n.language]);

  return (
    <div className="center h-screen">
      <div className="flex overflow-hidden w-7/10 min-w-230 h-9/10 bg-white rounded-4xl shadow-2xl border-5 border-white">
        <div className="flex-1 bg-darker-primary">
          <div className="center flex-col text-center h-full px-8">
            <div className="p-4 mb-5 bg-white/40 rounded-3xl">
              <Globe className="size-16 text-darker-accent" />
            </div>
            <h2 className="text-4xl font-bold text-darker-accent">
              Global Data
            </h2>
            <h3 className="mb-5 text-white/50 font-semibold">
              Cumulative efforts of all players
            </h3>
            <div className="center flex-col w-full gap-4">
              <div className="flex items-center justify-between gap-1 w-full p-4 bg-gray-100 rounded-xl">
                <div className="text-left">
                  <p className="text-xs">Dogs Identified</p>
                  <h1 className="text-brown text-4xl font-bold">{globalStats?.total_rounds || 0}</h1>
                </div>
                <div className="center p-4 bg-gray-200 rounded-2xl">
                  <Dog className="size-10 text-darker-accent" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 w-full p-4 bg-gray-100 rounded-xl">
                <div className="center p-4 bg-gray-200 rounded-2xl">
                  <Users className="size-10 text-darker-primary" />
                </div>
                <div className="text-right">
                  <p className="text-xs">Active Players</p>
                  <h1 className="text-brown text-4xl font-bold">{globalStats?.total_players || 0}</h1>
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 w-full p-4 bg-gray-100 rounded-xl">
                <div className="text-left">
                  <p className="text-xs">Avg. Accuracy</p>
                  <h1 className="text-brown text-4xl font-bold">{ globalStats?.avg_accuracy || 0}</h1>
                </div>
                <div className="center p-4 bg-gray-200 rounded-2xl">
                  <Trophy className="size-10 text-darker-accent" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 bg-white h-full">
          <div className="center flex-col text-center text-darker-accent font-semibold pt-4">
            <div className="flex gap-2">
              <Star fill="#6d8ef2" className="size-6" />
              <h2 className="text-xl">Trickiest Breeds</h2>
            </div>
            <h3 className="text-gray-300 font-medium">
              The hardest breeds to identify
            </h3>
          </div>
          <div className="flex flex-col gap-4 flex-1 mx-8 mb-8 overflow-y-scroll bg-gray-100 border-2 border-gray-200 rounded-4xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {
              globalStats ? globalStats.hardest_breeds.map((breed, index) => (
                <div
                key={index}
                className={`flex justify-between items-center shrink-0 gap-4 h-30 p-4 mx-6 ${
                  index < 9 ? "border-b-2 border-gray-300" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <p
                    className={`center ${
                      index === 0 ? "bg-darker-primary" : "bg-darker-accent"
                    } size-10 text-white font-semibold rounded-full shrink-0`}
                  >
                    {index + 1}
                  </p>
                  <p className="text-brown font-semibold">{breed.name}</p>
                </div>
                <div className="flex flex-col gap-1 text-right ml-auto">
                  <div className="center">
                    <progress
                      value={breed.correct_rate}
                      max="100"
                      className={`h-3 bg-white rounded-md ${
                        index === 0 ? "progress-bar-first" : "progress-bar"
                      }`}
                    ></progress>
                  </div>
                  <p className="mt-2 text-brown/20 text-xs">
                    CORRECT RATE<span className="ml-2">{breed.correct_rate}%</span>
                  </p>
                </div>
              </div>
              )): null
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalStatics;
