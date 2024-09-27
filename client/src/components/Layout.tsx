import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex w-full h-screen bg-gray-800">
      <Sidebar />
      <div className="bg-gray-900 h-full w-full overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
