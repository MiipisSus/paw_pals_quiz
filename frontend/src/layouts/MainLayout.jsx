import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";

function MainLayout() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
