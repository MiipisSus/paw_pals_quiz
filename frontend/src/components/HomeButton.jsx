import { useNavigate, useLocation } from "react-router-dom";
import { House, Globe, User } from "lucide-react";
import { useGame } from "../contexts/GameContext";

function HomeButton({ onClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { onHomeButtonClick } = useGame();

  const handleClick = () => {
    // 優先使用傳入的 onClick prop
    if (onClick) {
      onClick();
    }
    // 其次使用 GameContext 中的 onHomeButtonClick
    else if (onHomeButtonClick) {
      onHomeButtonClick();
    }
    // 最後使用默認導航
    else {
      navigate("/");
    }
  };

  return (
    <button
      className="size-fit p-3 text-white bg-darker-accent rounded-full cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 hover:bg-darker-accent/90"
      onClick={handleClick}
    >
      <House className="size-7" />
    </button>
  );
}

export default HomeButton;
