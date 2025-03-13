import { HeaderAdmin, Sidebar } from "..";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <>
      <main>
        <div className=" relative h-screen w-screen">
          <div className="fixed w-full top-0 z-40">
            <HeaderAdmin />
          </div>
          <div className="fixed w-[16%] top-0 z-50">
            <Sidebar />
          </div>
          <div className="md:w-[84%] ml-auto mt-[60px] text-[#000] bg-[#f1f1f1]">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminLayout;
