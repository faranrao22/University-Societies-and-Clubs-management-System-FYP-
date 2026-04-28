import { Outlet, useLocation } from "react-router-dom";
import Topbar from "../Components/Topbar";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import PublicPageBanner from "../Components/PublicPageBanner";
import ScrollToTopButton from "../Components/ScrollToTopButton";

function pageMeta(pathname) {
  if (pathname === "/") return null;
  if (pathname === "/contact") return { title: "Contact Us" };
  if (pathname === "/community") return { title: "Societies" };
  if (pathname === "/society-posts") return { title: "Society Posts" };
  if (pathname === "/events") return { title: "Events" };
  if (pathname.startsWith("/eventdetails/")) return { title: "Event Details" };
  if (pathname.startsWith("/society/") || pathname.startsWith("/societies/")) return { title: "Society Details" };
  if (pathname.startsWith("/join-society/")) return { title: "Join Society" };
  if (pathname === "/applyForElections") return { title: "Elections" };
  if (pathname.startsWith("/apply/")) return { title: "Election Application" };
  if (pathname.startsWith("/VoteNow/")) return { title: "Vote Now" };
  if (pathname.startsWith("/results/")) return { title: "Election Results" };
  return { title: "University Societies & Clubs" };
}

const PublicLayout = () => {
  const location = useLocation();

  const hiddenRoutes = [
    "/login",
    "/signup",
    "/profile",
    "/student/profile",
    "/student/profile/election-status",
    "/student/profile/elections",
    "/student/profile/societies",
    "/student/profile/society-posts",
    "/student/profile/volunteer-status",
    "/student/profile/volunteers",
    "/student/profile/applications",
  ];

  const showLayout = !hiddenRoutes.includes(location.pathname);
  const meta = pageMeta(location.pathname);

  const { pathname } = location;
  /** Detail pages: keep top nav chrome, only hide large title banner. */
  const hidePageBanner =
    pathname.startsWith("/eventdetails/") ||
    pathname.startsWith("/society/") ||
    pathname.startsWith("/societies/");

  return (
    <>
      {showLayout && (
        <>
          <Topbar />
          <Navbar />
          {!hidePageBanner && meta ? (
            <PublicPageBanner title={meta.title} subtitle={meta.subtitle} />
          ) : null}
        </>
      )}

      <div className="public-theme bg-slate-200">
        <Outlet />
      </div>

      {showLayout && <ScrollToTopButton />}
      {showLayout && <Footer />}
    </>
  );
};

export default PublicLayout;
