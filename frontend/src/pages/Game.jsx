import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

import { fetchQuestion, submitAnswer } from "../services/apiService";
import { useGame } from "../contexts/GameContext";

function Game() {
  const { gameSessionId, setScore, score, setRounds, rounds } = useGame();
  const [currentImage, setCurrentImage] = useState(null);
  const [currentChoices, setCurrentChoices] = useState([]);
  const [questionId, setQuestionId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const question = await fetchQuestion(gameSessionId);
        setCurrentImage(question.image_url);
        setCurrentChoices(question.choices);
        setQuestionId(question.id);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };

    fetchData();
  }, [gameSessionId]);

  async function handleQuestionFetch() {
    try {
      const question = await fetchQuestion(gameSessionId);
      setCurrentImage(question.image_url);
      setCurrentChoices(question.choices);
      setQuestionId(question.id);
      setRounds(question.current_round);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  }

  async function handleSubmitAnswer(choice) {
    try {
      const answerData = {
        game_session_id: gameSessionId,
        question_id: questionId,
        selected_slug: choice.slug,
      };
      const response = await submitAnswer(answerData);
      setScore((prevScore) => prevScore + response.score);
      // Check if is correct and update score/rounds accordingly
      await handleQuestionFetch();
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  }

  return (
    <div className="center h-[calc(100vh-4rem)]">
      <div className="flex w-6/10 h-7/10 overflow-hidden bg-white rounded-4xl shadow-2xl">
        <div className="relative w-1/2 bg-black">
          <img
            src={currentImage}
            alt="Image"
            className="w-full h-full object-cover object-center text-white"
          />
          <i className="center ri-question-line z-2 absolute bottom-6 right-6 size-12 text-3xl text-darker-accent bg-white rounded-full"></i>
        </div>
        <div className="center flex-col w-1/2">
          <div className="flex gap-4 px-6 my-6 ml-auto mb-auto">
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
          <ul className="flex flex-col text-center gap-3 w-8/10 p-0 mb-auto list-none">
            {currentChoices.map((choice, index) => (
              <button
                key={index}
                className="bg-darker-primary text-white font-semibold p-3 rounded-lg shadow-sm cursor-pointer"
                onClick={() => handleSubmitAnswer(choice)}
              >
                {choice.name}
              </button>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Game;
