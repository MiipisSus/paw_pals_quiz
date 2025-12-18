import { useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";

function LanguageButton() {
  const navigate = useNavigate();

  return (
    <button className="center gap-2 size-fit px-5 py-3 bg-white rounded-3xl shadow-md">
      <Globe className="size-5 text-darker-accent" />
      <p className="text-brown font-medium">En</p>
    </button>
  );
}

export default LanguageButton;
