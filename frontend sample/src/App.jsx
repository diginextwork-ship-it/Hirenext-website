import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/contact";
import JobSearch from "./pages/JobSearch";
import JobApplication from "./pages/JobApplication";
import RecruiterLogin from "./pages/RecruiterLogin";
import AdminPanel from "./pages/AdminPanel";
import ErrorPage from "./pages/ErrorPage";

const PAGE_TO_PATH = {
  home: "/",
  jobs: "/jobs",
  applyjob: "/jobs/apply",
  contactus: "/contactus",
  recruiterlogin: "/recruiter-login",
  adminpanel: "/admin-panel",
};

const normalizePath = (pathname) => {
  if (!pathname) return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
};

const getPageFromPath = (pathname) => {
  const normalizedPath = normalizePath(pathname);
  if (normalizedPath === "/") return "home";
  if (normalizedPath === "/jobs") return "jobs";
  if (normalizedPath === "/jobs/apply") return "applyjob";
  if (normalizedPath === "/contactus") return "contactus";
  if (normalizedPath === "/recruiter-login") return "recruiterlogin";
  if (normalizedPath === "/admin-panel") return "adminpanel";
  return "notfound";
};

export default function App() {
  const [currentPage, setCurrentPageState] = useState(() =>
    getPageFromPath(window.location.pathname)
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPageState(getPageFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const setCurrentPage = (page) => {
    const nextPath = PAGE_TO_PATH[page] || "/";
    const activePath = normalizePath(window.location.pathname);

    setCurrentPageState(page);

    if (activePath !== nextPath) {
      window.history.pushState({ page }, "", nextPath);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "contactus":
        return <Contact setCurrentPage={setCurrentPage} />;
      case "jobs":
        return <JobSearch setCurrentPage={setCurrentPage} />;
      case "applyjob":
        return <JobApplication setCurrentPage={setCurrentPage} />;
      case "recruiterlogin":
        return <RecruiterLogin />;
      case "adminpanel":
        return <AdminPanel />;
      case "notfound":
        return (
          <ErrorPage
            code={404}
            title="Page not found"
            message="The page you requested does not exist or has been moved."
            onRetry={() => setCurrentPage("home")}
          />
        );
      default:
        return <Home setCurrentPage={setCurrentPage} />;
    }
  };

  if (currentPage === "notfound") {
    return renderPage();
  }

  return (
    <div className="app">
      {currentPage === "home" ? (
        <Navbar setCurrentPage={setCurrentPage} currentPage={currentPage} />
      ) : null}
      {renderPage()}
      <Footer setCurrentPage={setCurrentPage} minimal={currentPage !== "home"} />
    </div>
  );
}
