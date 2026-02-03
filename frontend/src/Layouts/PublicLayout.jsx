import { Outlet, useLocation } from "react-router-dom";
import Topbar from "../Components/Topbar";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const PublicLayout = () => {
  const location = useLocation();

  // Pages where Topbar/Navbar/Footer should be hidden
  const hiddenRoutes = ["/login", "/signup"];

  const showLayout = !hiddenRoutes.includes(location.pathname);

  return (
    <>
      {showLayout && (
        <>
          <Topbar />
          <Navbar />
        </>
      )}

      <Outlet />

      {showLayout && <Footer />}
    </>
  );
};

export default PublicLayout;
