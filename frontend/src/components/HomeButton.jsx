import { useNavigate, useLocation } from "react-router-dom";
import { House, Globe, User } from "lucide-react";

function HomeButton() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <button
      className="size-fit p-3 text-white bg-darker-accent rounded-full cursor-pointer"
      onClick={() => navigate("/")}
    >
      <House className="size-7" />
    </button>
  );
}

export default HomeButton;
