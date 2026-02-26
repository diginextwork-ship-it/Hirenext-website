import { useState, useEffect } from "react";

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(28,25,23,0.72)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    animation: "fadeIn 0.3s ease",
  },
  modal: {
    background: "var(--warm-white)",
    borderRadius: "20px",
    maxWidth: "560px",
    width: "100%",
    overflow: "hidden",
    boxShadow: "0 32px 80px rgba(28,25,23,0.3)",
    animation: "scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
    position: "relative",
  },
  header: {
    background: "linear-gradient(135deg, var(--red) 0%, #A01E1E 100%)",
    padding: "36px 36px 28px",
    position: "relative",
    overflow: "hidden",
  },
  headerBg: {
    position: "absolute",
    inset: 0,
    background:
      "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
    pointerEvents: "none",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "100px",
    padding: "5px 14px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#fff",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "14px",
    position: "relative",
    zIndex: 1,
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#fff",
    animation: "pulse 2s infinite",
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: "28px",
    fontWeight: 900,
    color: "#fff",
    lineHeight: 1.15,
    marginBottom: "8px",
    position: "relative",
    zIndex: 1,
  },
  subtitle: {
    fontSize: "14px",
    fontWeight: 300,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.6,
    position: "relative",
    zIndex: 1,
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    width: "32px",
    height: "32px",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "50%",
    color: "#fff",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 2,
    transition: "background 0.2s",
  },
  body: {
    padding: "28px 36px 32px",
  },
  formLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--brown-gray)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "12px",
    display: "block",
  },
  inputRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid var(--warm-tan)",
    borderRadius: "10px",
    fontSize: "14px",
    color: "var(--charcoal)",
    background: "var(--warm-cream)",
    outline: "none",
    transition: "border-color 0.2s",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    border: "1.5px solid var(--warm-tan)",
    borderRadius: "10px",
    fontSize: "14px",
    color: "var(--charcoal)",
    background: "var(--warm-cream)",
    outline: "none",
    marginBottom: "20px",
  },
  submitBtn: {
    width: "100%",
    padding: "15px",
    background: "var(--red)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    transition: "background 0.2s, transform 0.15s",
    boxShadow: "var(--shadow-red)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  skipText: {
    textAlign: "center",
    marginTop: "14px",
    fontSize: "12px",
    color: "var(--muted)",
  },
  skipLink: {
    color: "var(--red)",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
  },
  perks: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  perk: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    color: "var(--green)",
    background: "var(--green-pale)",
    border: "1px solid rgba(42,125,79,0.15)",
    borderRadius: "100px",
    padding: "4px 10px",
    fontWeight: 500,
  },
};

export default function JobSeekerPopup({ onClose }) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [domain, setDomain] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(handleClose, 2200);
  };

  if (!visible) return null;

  return (
    <div
      style={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerBg} />
          <button style={styles.closeBtn} onClick={handleClose}>
            ×
          </button>
          <div style={styles.eyebrow}>
            <span style={styles.dot} />
            500+ Jobs Added This Month
          </div>
          <div style={styles.title}>
            Your Next Big Role
            <br />
            <em>Starts Right Here</em>
          </div>
          <div style={styles.subtitle}>
            Tell us a little about yourself and get matched with curated
            opportunities — free, fast, and human.
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "52px", marginBottom: "12px" }}>🎉</div>
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                You're on the list!
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "var(--brown-gray)",
                  fontWeight: 300,
                }}
              >
                Our team will reach out within 24 hours with matched
                opportunities.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={styles.perks}>
                <span style={styles.perk}>✓ Free</span>
                <span style={styles.perk}>✓ Confidential</span>
                <span style={styles.perk}>✓ No Spam</span>
                <span style={styles.perk}>✓ Human Recruiter</span>
              </div>
              <div style={styles.inputRow}>
                <input
                  style={styles.input}
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  onFocus={(e) => (e.target.style.borderColor = "var(--red)")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--warm-tan)")
                  }
                />
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  onFocus={(e) => (e.target.style.borderColor = "var(--red)")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--warm-tan)")
                  }
                />
              </div>
              <select
                style={styles.select}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              >
                <option value="">Select Your Domain / Industry</option>
                <option>Tech & IT</option>
                <option>BFSI & Finance</option>
                <option>Sales & Marketing</option>
                <option>Operations & Logistics</option>
                <option>Engineering & Core</option>
                <option>Healthcare & Pharma</option>
                <option>Human Resources</option>
                <option>Executive & Leadership</option>
              </select>
              <button
                type="submit"
                style={styles.submitBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--red-dark)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--red)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                🚀 Get Matched with Jobs
              </button>
              <div style={styles.skipText}>
                Just browsing?{" "}
                <span style={styles.skipLink} onClick={handleClose}>
                  Skip for now
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
