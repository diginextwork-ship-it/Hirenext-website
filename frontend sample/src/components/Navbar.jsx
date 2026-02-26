import { useState } from "react";
import logoImage from "../assets/Logo.png";
import "../styles/navbar.css";

export default function Navbar({ setCurrentPage, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStaffingOpen, setIsStaffingOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    setIsStaffingOpen(false);
    setIsInsightsOpen(false);
  };

  return (
    <nav className={`navbar ${currentPage === "home" ? "navbar-home" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo" onClick={() => handleNavClick("home")}>
            <img src={logoImage} alt="hirenext logo" className="logo-image" />
          </div>
        </div>

        <button
          className={`hamburger ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
          <div className="navbar-links">
            <div className="dropdown">
              <button
                className="nav-link dropdown-toggle"
                onClick={() => setIsStaffingOpen(!isStaffingOpen)}
              >
                Staffing Solutions
                <span className={`arrow ${isStaffingOpen ? "open" : ""}`}>
                  v
                </span>
              </button>
              {isStaffingOpen && (
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item">
                    Call Center Staffing
                  </a>
                  <a href="#" className="dropdown-item">
                    Customer Service
                  </a>
                  <a href="#" className="dropdown-item">
                    Technical Support
                  </a>
                </div>
              )}
            </div>

            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("jobs");
              }}
            >
              Search all jobs
            </a>

            <a href="#" className="nav-link">
              About Us
            </a>

            <div className="dropdown">
              <button
                className="nav-link dropdown-toggle"
                onClick={() => setIsInsightsOpen(!isInsightsOpen)}
              >
                Insights
                <span className={`arrow ${isInsightsOpen ? "open" : ""}`}>
                  v
                </span>
              </button>
              {isInsightsOpen && (
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item">
                    Blog
                  </a>
                  <a href="#" className="dropdown-item">
                    Case Studies
                  </a>
                </div>
              )}
            </div>

            <a
              href="/contactus"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("contactus");
              }}
            >
              Contact Us
            </a>
          </div>

          <div className="navbar-actions">
            
            <button
              className="btn btn-secondary"
              onClick={() => handleNavClick("contactus")}
            >
              Schedule A Call Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
