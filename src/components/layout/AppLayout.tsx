import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MobileNav from "./MobileNav";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
