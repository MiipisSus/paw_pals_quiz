import { Outlet } from "react-router-dom";
import LanguageButton from "../components/LanguageButton.jsx";
import StatesViewSwitcher from "../components/StatesViewSwitcher.jsx";
import { APP_VERSION } from "../config/version.js";
import BuyMeACoffee from "../components/BuyMeACoffee";

function HomeLayout() {
  return (
    <>
      <div className="fixed flex justify-between w-full p-4 bg-transparent">
        <StatesViewSwitcher />
        <LanguageButton />
      </div>
      <main className="">
        <Outlet />
      </main>
      <div className="fixed bottom-0 left-0 p-3 z-50">
        <BuyMeACoffee />
      </div>
      <div className="fixed bottom-0 right-0 p-3 text-sm text-gray-500 opacity-50">
        <p>
          <v>v{APP_VERSION}</v>
          <span>・</span>
          <a href="/about">About Pal Paws Quiz</a>
        </p>
      </div>
    </>
  );
}

export default HomeLayout;
