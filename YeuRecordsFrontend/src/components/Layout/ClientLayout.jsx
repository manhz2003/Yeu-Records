import { Header, Footer } from "..";
import { Outlet } from "react-router-dom";

const ClientLayout = () => {
  return (
    <main>
      <Header />
      <div>
        <Outlet />
      </div>
      <Footer />
    </main>
  );
};

export default ClientLayout;
