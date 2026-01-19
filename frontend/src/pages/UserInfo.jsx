import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, CirclePlay, Shapes, History, Award } from "lucide-react";

import { useUser } from "../contexts/UserContext";
import headshotImg from "../assets/headshot.jpg";

function formatGameDate(dateString, t) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return t("userInfo.yesterday");
  } else if (diffDays < 7) {
    return `${diffDays} ${t("userInfo.daysAgo")}`;
  } else {
    return date.toLocaleDateString("zh-TW", {
      month: "short",
      day: "numeric",
    });
  }
}

function UserInfo() {
  const { t } = useTranslation();
  const {
    nickname,
    totalGameSessions,
    totalScore,
    avgAccuracy,
    updateUserInfo,
    gameSessions,
  } = useUser();

  useEffect(() => {
    updateUserInfo();
  }, []);

  return (
    <div className="center h-screen">
      <div className="flex overflow-hidden w-7/10 min-w-230 h-9/10 bg-white rounded-4xl shadow-2xl border-5 border-white">
        <div className="flex-1 bg-darker-accent">
          <div className="center flex-col gap-3 h-5/10">
            <div className="overflow-hidden h-1/2 aspect-square bg-white rounded-full shadow-lg border-4 border-white">
              <img
                src={headshotImg}
                alt="User Profile"
                className="w-full h-full object-center object-cover"
              />
            </div>
            <p className="text-white text-2xl font-semibold">{nickname}</p>
          </div>
          <div className="text-center px-8">
            <h2 className="text-xl font-bold text-darker-primary">
              {t("userInfo.achievements")}
            </h2>
            <h3 className="mb-5 text-white/50 font-semibold">
              {t("userInfo.achievementsSubtitle")}
            </h3>
            <div className="center flex-col gap-4">
              <div className="flex gap-4">
                <div className="center flex-col gap-1 w-50 py-4 bg-gray-100 rounded-xl">
                  <Trophy className="size-8 mb-2 text-darker-primary" />
                  <h3 className="text-brown/50 text-sm">{t("userInfo.totalScore")}</h3>
                  <p className="text-brown text-xl font-semibold">
                    {totalScore}
                  </p>
                </div>
                <div className="center flex-col gap-1 w-50 py-4 bg-gray-100 rounded-xl">
                  <CirclePlay className="size-8 mb-2 text-darker-accent" />
                  <h3 className="text-brown/50 text-sm">{t("userInfo.gamesPlayed")}</h3>
                  <p className="text-brown text-xl font-semibold">
                    {totalGameSessions}
                  </p>
                </div>
              </div>
              <div className="center flex-col gap-1 w-50 py-4 bg-gray-100 rounded-xl">
                <Shapes className="size-8 mb-2 text-green-400" />
                <h3 className="text-brown/50 text-sm">{t("userInfo.avgAccuracy")}</h3>
                <p className="text-brown text-xl font-semibold">
                  {avgAccuracy}%
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 bg-white h-full">
          <div className="center text-center gap-2 text-darker-accent font-semibold pt-4">
            <History className="size-6" />
            <h2 className="text-xl">{t("userInfo.recentMatches")}</h2>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto flex-1 px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gameSessions.length !== 0 ? (
              gameSessions.map((session) => (
                <div className="flex justify-between items-center shrink-0 gap-4 h-30 p-6 border-2 border-gray-200 rounded-xl">
                  <div className="flex flex-col gap-2 text-left">
                    <p className="text-brown/20 text-xs">
                      {formatGameDate(session.started_at, t)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="bg-darker-accent px-2 py-1 text-white font-semibold rounded-md">
                        {t("userInfo.totalScoreLabel")}
                      </p>
                      <p className="text-brown font-semibold">
                        {session.score}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-right ml-auto">
                    <p className="text-brown/20 text-xs">{t("userInfo.correctRate")}</p>
                    <p className="bg-darker-primary ml-auto px-2 py-1 text-white font-semibold rounded-md">
                      {session.avg_accuracy}%
                    </p>
                  </div>
                  <div className="center h-full aspect-square bg-gray-100 rounded-2xl">
                    <Award className="size-8 text-yellow-400" />
                  </div>
                </div>
              ))
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
