import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./RegisterPage.css";

export default function RegisterPage() {
  const location = useLocation();
  const [userType, setUserType] = useState(location.state?.role || "user");
  const showRoleButtons = !location.state?.role;

  // Basic Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [demoOtp, setDemoOtp] = useState(""); // Demo mode OTP
  const { user, register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleFinalSubmit = async () => {
    setError("");

    if (!fullName || !email || !username || !password || !confirmPassword) {
      setError("Please fill all account details");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await register(fullName, email, username, password, confirmPassword, userType.toUpperCase());
    if (result.success) {
      if (result.pending) {
        if (result.demoOtp) {
          setDemoOtp(result.demoOtp);
        } else {
          navigate("/verify-otp", { state: { email, role: userType } });
        }
      } else {
        navigate("/home");
      }
    } else {
      setError(result.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="registration-header">
          <div className="registration-logo-container">
            <img src="/assets/logo_new.png" alt="Foodiegram Logo" className="registration-brand-logo" />
          </div>
          <h2>Join Foodiegram</h2>
          {userType === 'creator' && <p style={{ color: 'var(--color-primary)', marginTop: '8px' }}>Partner Registration</p>}
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="step-content">
            <h3 className="section-title">Account Details</h3>
            <div className="input-group">
              <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            {showRoleButtons && (
              <div className="user-type-selector">
                <label>Register as:</label>
                <div className="role-toggle">
                  <button
                    type="button"
                    className={userType === "user" ? "active" : ""}
                    onClick={() => setUserType("user")}
                  >
                    Foodie
                  </button>
                  <button
                    type="button"
                    className={userType === "creator" ? "active" : ""}
                    onClick={() => setUserType("creator")}
                  >
                    Creator / Restaurant
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          {demoOtp && (
            <div className="demo-otp-box" style={{
              marginTop: "25px",
              padding: "20px",
              background: "rgba(250, 204, 21, 0.05)",
              border: "1px dashed var(--color-primary)",
              borderRadius: "16px",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                right: 0,
                padding: "4px 12px",
                background: "var(--color-primary)",
                color: "#000",
                fontSize: "10px",
                fontWeight: "900",
                textTransform: "uppercase",
                borderRadius: "0 0 0 12px"
              }}>Demo Environment</div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "24px" }}>🔑</span>
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#333" }}>Action Required</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>Use the auto-generated code below</p>
                </div>
              </div>

              <div style={{
                background: "#fff",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #eee",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}>
                <span style={{
                  color: "var(--color-primary)",
                  fontSize: "2rem",
                  fontWeight: "900",
                  letterSpacing: "8px",
                  fontFamily: "monospace"
                }}>{demoOtp}</span>
              </div>

              <button
                type="button"
                className="submit-btn"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#000",
                  color: "#fff",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onClick={() => navigate("/verify-otp", { state: { email, role: userType, demoOtp } })}
              >
                Continue to Verification <span>→</span>
              </button>
            </div>
          )}

          <div className="auth-actions">
            {!demoOtp && (
              <button type="button" className="submit-btn" onClick={handleFinalSubmit}>
                {userType === 'creator' ? 'Next: Verify Email →' : 'Send Verification OTP'}
              </button>
            )}
          </div>
        </form>


        <p className="auth-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
