import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trophy, ArrowRight } from "lucide-react";
import { OrbitProgress } from "react-loading-indicators";

import {
  fetchQuestion,
  submitAnswer,
  endGameSession,
} from "../services/apiService";
import { useGame } from "../contexts/GameContext";

function Game() {
  const {
    gameSessionId,
    setScore,
    score,
    setRounds,
    rounds,
    totalRounds,
    setRoundRecords,
  } = useGame();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [questionId, setQuestionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [currentIntroduction, setCurrentIntroduction] = useState(null);
  const [currentOrigin, setCurrentOrigin] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (gameSessionId) {
      handleQuestionFetch();
    }
  }, [gameSessionId]);

  async function handleQuestionFetch() {
    try {
      setIsLoading(true);
      setSelectedChoice(null);
      setCorrectAnswer(null);
      setIsAnswerCorrect(null);

      const question = await fetchQuestion(gameSessionId);
      setCurrentImage(question.image_url);
      setCurrentChoices(question.choices);
      setQuestionId(question.id);
      setRounds(question.current_round);
    } catch (error) {
      console.error(t("game.fetchQuestionFailed"), error);
      setIsLoading(false);
    }
  }

  async function handleSubmitAnswer(choice) {
    setSelectedChoice(choice);

    try {
      const answerData = {
        game_session_id: gameSessionId,
        question_id: questionId,
        selected_slug: choice.slug,
        choices: currentChoices,
      };
      const response = await submitAnswer(answerData);
      setIsAnswerCorrect(response.is_correct);
      setCorrectAnswer(response.correct_slug);
      setCurrentIntroduction(response.breed.introduction);
      setCurrentOrigin(response.breed.origin);
      setScore((prevScore) => prevScore + response.score);
      console.log(rounds, totalRounds);
      if (rounds >= totalRounds) {
        setIsGameOver(true);
      }
      console.log(isGameOver);
    } catch (error) {
      console.error(t("game.submitAnswerFailed"), error);
    }
  }

  async function handleEndGame() {
    const response = await endGameSession(gameSessionId);
    setRoundRecords(response.round_records);
    navigate("/game-result");
  }

  return (
    <div className="center h-screen">
      <div className="flex w-[clamp(60rem,70%,75rem)] h-7/10 overflow-hidden bg-white rounded-4xl shadow-2xl">
        <div className="relative w-1/2 bg-tetariary">
          {isLoading && (
            <div className="absolute inset-0 center flex-col text-center gap-2 bg-secondary z-10">
              <OrbitProgress
                dense
                color="#6d8ef2"
                size="medium"
                text=""
                textColor=""
              />
              <p className="text-sm font-medium text-light-brown">
                {t("game.loadingDoggo")}
              </p>
            </div>
          )}
          <img
            src={currentImage}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            className="w-full h-full object-cover object-center bg-primary text-white"
          />
          {isAnswerCorrect === null ? (
            <div className="center z-2 absolute bottom-6 right-6 size-12 bg-white rounded-full">
              <div className="flex items-center gap-2">
                <i className="ri-question-line text-3xl mr-left text-darker-accent shrink-0"></i>
              </div>
            </div>
          ) : (
            <div className="flex flex-col z-2 absolute bottom-6 right-6 p-4 bg-white rounded-lg max-w-80 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-question-line text-3xl mr-left text-darker-accent shrink-0"></i>
                <p className="px-2 py-1 bg-darker-accent text-white text-xs rounded-lg whitespace-nowrap">
                  FROM &nbsp;
                  <span className="text-primary font-medium text-sm">
                    {currentOrigin}
                  </span>
                </p>
              </div>
              <p className="text-brown text-sm leading-relaxed wrap-break-word hyphens-auto">
                {currentIntroduction
                  ?.split("。")
                  .map((sentence, index, array) => (
                    <span key={index}>
                      {sentence}
                      {index < array.length - 1 && sentence.trim() && (
                        <>
                          。
                          <br />
                        </>
                      )}
                    </span>
                  ))}
              </p>
            </div>
          )}
        </div>
        <div className="center flex-col w-1/2">
          <div className="flex gap-4 px-6 my-6 mb-auto ml-auto">
            <p className="center px-2 py-1 bg-darker-accent text-white font-bold rounded-lg">
              {t("game.round")}
              <span className="ml-3">{rounds}</span>
              <span className="text-white/50 text-sm">/{totalRounds}</span>
            </p>
            <p className="center px-2 py-1 bg-white text-darker-primary border font-bold rounded-lg">
              <Trophy className="inline-block size-5" />
              <span className="ml-3">{score}</span>
            </p>
          </div>
          <div className="w-8/10 mb-10">
            <h2 className="mb-2 text-3xl text-brown font-bold">
              {t("game.whoIsTheDog")}{" "}
              <span className="text-darker-accent">{t("game.dog")}</span>
            </h2>
            <h3 className="text-md text-gray-400 font-semibold">
              {t("game.instruction")}
            </h3>
          </div>
          <ul className="grid grid-cols-2 grid-rows-2 text-center gap-3 w-8/10 p-0 list-none">
            {currentChoices.length > 0
              ? currentChoices.map((choice, index) => (
                  <button
                    key={index}
                    disabled={isAnswerCorrect !== null}
                    className={`text-white font-semibold p-3 rounded-lg shadow-sm ${
                      isAnswerCorrect !== null
                        ? choice.slug === correctAnswer
                          ? "bg-green-500"
                          : choice.slug === selectedChoice?.slug
                          ? "bg-red-500"
                          : "bg-gray-200 cursor-not-allowed"
                        : "bg-darker-primary cursor-pointer"
                    }`}
                    onClick={() =>
                      isAnswerCorrect === null && handleSubmitAnswer(choice)
                    }
                  >
                    {choice.name}
                  </button>
                ))
              : Array.from({ length: 4 }, (_, index) => (
                  <button
                    key={index}
                    disabled
                    className="bg-secondary text-gray-500 font-semibold p-3 rounded-lg shadow-sm cursor-not-allowed"
                  >
                    &nbsp;
                  </button>
                ))}
          </ul>
          <div
            className={`flex justify-between items-center text-center p-4 mt-auto mb-6 bg-secondary border-2 border-darker-secondary rounded-xl w-7/10 ${
              isAnswerCorrect === null ? "invisible" : "visible"
            }`}
          >
            {isAnswerCorrect ? (
              <p className="text-sm font-semibold text-green-500">
                {t("game.correctAnswer")}
              </p>
            ) : (
              <p className="text-sm font-semibold text-red-500">
                {t("game.wrongAnswer")}
              </p>
            )}
            {isGameOver ? (
              <button
                className="center gap-2 px-4 py-1 text-sm font-semibold bg-darker-accent text-white rounded-2xl"
                onClick={() => handleEndGame()}
              >
                {t("game.seeResult")}
              </button>
            ) : (
              <button
                className="center gap-2 px-4 py-1 text-sm font-semibold bg-brown text-white rounded-2xl"
                onClick={() => handleQuestionFetch()}
              >
                {t("game.nextRound")}
                <ArrowRight className="size-4 font-semibold" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;
