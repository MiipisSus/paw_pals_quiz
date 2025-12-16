import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [questionId, setQuestionId] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
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
      console.error("Failed to fetch questions:", error);
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
      setScore((prevScore) => prevScore + response.score);
      console.log(rounds, totalRounds);
      if (rounds >= totalRounds) {
        setIsGameOver(true);
      }
      console.log(isGameOver);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  }

  async function handleEndGame() {
    const response = await endGameSession(gameSessionId);
    setRoundRecords(response.round_records);
    navigate("/game-result");
  }

  return (
    <div className="center h-[calc(100vh-4rem)]">
      <div className="flex w-8/10 h-7/10 overflow-hidden bg-white rounded-4xl shadow-2xl">
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
                SUMMONING DOGGO...
              </p>
            </div>
          )}
          <img
            src={currentImage}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            className="w-full h-full object-cover object-center text-white"
          />
          <i className="center ri-question-line z-2 absolute bottom-6 right-6 size-12 text-3xl text-darker-accent bg-white rounded-full"></i>
        </div>
        <div className="center flex-col w-1/2">
          <div className="flex gap-4 px-6 my-6 mb-auto ml-auto">
            <p className="px-2 py-1 bg-darker-primary text-white font-bold rounded-lg">
              Round<span className="ml-3">{rounds}</span>
            </p>
            <p className="center px-2 py-1 bg-white text-darker-primary border font-bold rounded-lg shadow-sm shadow-darker-primary/50">
              <Trophy className="inline-block size-5" />
              <span className="ml-3">{score}</span>
            </p>
          </div>
          <div className="w-8/10 mb-10">
            <h2 className="mb-2 text-3xl text-brown font-bold">
              Who's the <span className="text-darker-accent">Dog?</span>
            </h2>
            <h3 className="text-md text-light-brown font-semibold">
              Look at the photo and pick the breed!
            </h3>
          </div>
          <ul className="grid grid-cols-2 grid-rows-2 text-center gap-3 w-8/10 p-0 list-none">
            {currentChoices.length > 0
              ? currentChoices.map((choice, index) => (
                  <button
                    key={index}
                    className={`text-white font-semibold p-3 rounded-lg shadow-sm ${
                      isAnswerCorrect !== null
                        ? choice.slug === correctAnswer
                          ? "bg-green-500"
                          : choice.slug === selectedChoice?.slug
                          ? "bg-red-500"
                          : "bg-gray-200 cursor-not-allowed"
                        : "bg-darker-primary"
                    }`}
                    onClick={() => handleSubmitAnswer(choice)}
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
                BINGO! CORRECT!
              </p>
            ) : (
              <p className="text-sm font-semibold text-red-500">
                OOPS! WRONG...
              </p>
            )}
            {isGameOver ? (
              <button
                className="center gap-2 px-4 py-1 text-sm font-semibold bg-darker-accent text-white rounded-2xl"
                onClick={() => handleEndGame()}
              >
                SEE RESULT
              </button>
            ) : (
              <button
                className="center gap-2 px-4 py-1 text-sm font-semibold bg-brown text-white rounded-2xl"
                onClick={() => handleQuestionFetch()}
              >
                NEXT ROUND
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
