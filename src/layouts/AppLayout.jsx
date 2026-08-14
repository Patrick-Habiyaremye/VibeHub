import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";
import RightSidebar from "../components/layout/RightPanel";
import Footer from "../components/layout/Footer";


export default function AppLayout() {
  const location = useLocation();

  const isFeed = location.pathname.startsWith("/feed");
  const routesWithSidebar = ["/feed"];
  const isChallenge = location.pathname.startsWith("/challenges")

const showExtras = routesWithSidebar.some(route =>
  location.pathname.startsWith(route)
);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />

      <div className="flex flex-1">
        {!isChallenge && (<Sidebar />)}

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {isFeed && <RightSidebar />}
      </div>

      {isFeed && <Footer />}
    </div>
  );
}