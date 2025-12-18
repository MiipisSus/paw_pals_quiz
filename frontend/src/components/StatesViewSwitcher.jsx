import { useNavigate, useLocation } from "react-router-dom";
import { Globe, User, ChartBar } from "lucide-react";

function StatesViewSwitcher() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <button
        className="size-fit p-3 text-white bg-darker-accent rounded-full cursor-pointer"
        onClick={() => navigate("/")}
      >
        <User className="size-7" />
      </button>
      <button
        className="size-fit p-3 text-white bg-darker-primary rounded-full cursor-pointer"
        onClick={() => navigate("/")}
      >
        <ChartBar className="size-7" />
      </button>
    </div>
  );
}

export default StatesViewSwitcher;
