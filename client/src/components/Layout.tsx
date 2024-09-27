import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex w-full">
      <Sidebar />
      <div className="w-full overflow-y-auto h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
