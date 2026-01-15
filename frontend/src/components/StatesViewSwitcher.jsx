import { useNavigate } from "react-router-dom";
import { User, ChartBar } from "lucide-react";
import { tokenManager } from "../services/apiService";

function StatesViewSwitcher() {
  const navigate = useNavigate();

  const handleUserButtonClick = () => {
    if (tokenManager.isAuthenticated()) {
      navigate("/user-info");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        className="size-fit p-3 text-white bg-darker-accent rounded-full cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 hover:bg-darker-accent/90"
        onClick={handleUserButtonClick}
      >
        <User className="size-7" />
      </button>
      <button
        className="size-fit p-3 text-white bg-darker-primary rounded-full cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 hover:bg-darker-primary/90"
        onClick={() => navigate("/global-statics")}
      >
        <ChartBar className="size-7" />
      </button>
    </div>
  );
}

export default StatesViewSwitcher;
