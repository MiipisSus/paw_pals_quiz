import { Outlet } from "react-router-dom";
import LanguageButton from "../components/LanguageButton.jsx";
import StatesViewSwitcher from "../components/StatesViewSwitcher.jsx";

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
    </>
  );
}

export default HomeLayout;
