import { Outlet } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { Header } from "../components/shared/Header";
const MainLayout = () => {
  const currentUser = useAppSelector((state) => state.auth.user);
  return (
    <div className="min-h-full">
      <Header user={currentUser} />
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default MainLayout;
