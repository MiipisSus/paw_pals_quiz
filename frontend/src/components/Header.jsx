import { useNavigate } from "react-router-dom";
import { House, Globe } from "lucide-react";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="fixed flex w-full p-4 h-16 bg-transparent">
      <button
        className="size-fit p-3 text-white bg-darker-accent rounded-full cursor-pointer"
        onClick={() => navigate("/")}
      >
        <House className="size-7" />
      </button>
      <div className="center gap-2 size-fit px-5 py-3 ml-auto bg-white rounded-3xl shadow-md">
        <Globe className="size-5 text-darker-accent" />
        <p className="text-brown font-medium">En</p>
      </div>
    </header>
  );
}

export default Header;
