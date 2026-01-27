import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import LanguageButton from "../components/LanguageButton.jsx";
import StatesViewSwitcher from "../components/StatesViewSwitcher.jsx";
import { APP_VERSION } from "../config/version.js";
import BuyMeACoffee from "../assets/yellow-button.png";

function HomeLayout() {
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed flex justify-between w-full p-4 bg-transparent">
        <StatesViewSwitcher />
        <LanguageButton />
      </div>
      <main className="">
        <Outlet />
      </main>
      <div className="fixed bottom-0 left-0 w-60 p-3 z-50">
        <img
          src={BuyMeACoffee}
          alt="Buy me a coffee"
          className="cursor-pointer"
          onClick={() =>
            window.open("https://www.buymeacoffee.com/miipissus", "_blank")
          }
        />
      </div>
      <div className="fixed bottom-0 right-0 p-3 text-sm text-gray-500 opacity-50">
        <p>
          <v>v{APP_VERSION}</v>
          <span>・</span>
          <button
            className="hover:underline"
            onClick={() => navigate("/about")}
          >
            About Pal Paws Quiz
          </button>
        </p>
      </div>
    </>
  );
}

export default HomeLayout;
