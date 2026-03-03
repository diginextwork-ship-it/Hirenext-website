import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Contact from "./pages/contact";
import JobSearch from "./pages/JobSearch";
import JobApplication from "./pages/JobApplication";
import RecruiterLogin from "./pages/RecruiterLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminCreateRecruiter from "./pages/admin/AdminCreateRecruiter";
import AdminRidPerformance from "./pages/admin/AdminRidPerformance";
import AdminCandidateSubmissions from "./pages/admin/AdminCandidateSubmissions";
import AdminTopResumes from "./pages/admin/AdminTopResumes";
import AdminResumeUploads from "./pages/admin/AdminResumeUploads";
import AdminManualSelection from "./pages/admin/AdminManualSelection";
import AdminRevenue from "./pages/admin/AdminRevenue";
import ErrorPage from "./pages/ErrorPage";
import ScheduleCall from "./pages/ScheduleCall";

const PAGE_TO_PATH = {
  home: "/",
  jobs: "/jobs",
  applyjob: "/jobs/apply",
  contactus: "/contactus",
  schedulecall: "/schedule-call",
  recruiterlogin: "/recruiter-login",
  adminpanel: "/admin-panel",
  admincreate: "/admin-panel/create-recruiter",
  adminridstats: "/admin-panel/recruiter-performance",
  admincandidatestats: "/admin-panel/candidate-submissions",
  admintopresumes: "/admin-panel/top-resumes",
  adminuploads: "/admin-panel/recruiter-uploads",
  adminmanualselection: "/admin-panel/manual-selection",
  adminrevenue: "/admin-panel/revenue",
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
  if (normalizedPath === "/schedule-call") return "schedulecall";
  if (normalizedPath === "/recruiter-login") return "recruiterlogin";
  if (normalizedPath === "/admin-panel") return "adminpanel";
  if (normalizedPath === "/admin-panel/create-recruiter") return "admincreate";
  if (normalizedPath === "/admin-panel/recruiter-performance") return "adminridstats";
  if (normalizedPath === "/admin-panel/candidate-submissions") return "admincandidatestats";
  if (normalizedPath === "/admin-panel/top-resumes") return "admintopresumes";
  if (normalizedPath === "/admin-panel/recruiter-uploads") return "adminuploads";
  if (normalizedPath === "/admin-panel/manual-selection") return "adminmanualselection";
  if (normalizedPath === "/admin-panel/revenue") return "adminrevenue";
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
      case "schedulecall":
        return <ScheduleCall />;
      case "recruiterlogin":
        return <RecruiterLogin />;
      case "adminpanel":
        return <AdminPanel setCurrentPage={setCurrentPage} />;
      case "admincreate":
        return <AdminCreateRecruiter setCurrentPage={setCurrentPage} />;
      case "adminridstats":
        return <AdminRidPerformance setCurrentPage={setCurrentPage} />;
      case "admincandidatestats":
        return <AdminCandidateSubmissions setCurrentPage={setCurrentPage} />;
      case "admintopresumes":
        return <AdminTopResumes setCurrentPage={setCurrentPage} />;
      case "adminuploads":
        return <AdminResumeUploads setCurrentPage={setCurrentPage} />;
      case "adminmanualselection":
        return <AdminManualSelection setCurrentPage={setCurrentPage} />;
      case "adminrevenue":
        return <AdminRevenue setCurrentPage={setCurrentPage} />;
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
