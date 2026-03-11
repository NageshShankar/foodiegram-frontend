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
            <div style={{
              marginTop: "20px",
              padding: "15px",
              background: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "10px",
              textAlign: "center"
            }}>
              <p style={{ margin: 0, fontWeight: "bold", color: "#2d3436" }}>
                Demo Mode: Your OTP is <span style={{ color: "var(--color-primary)", fontSize: "1.2rem" }}>{demoOtp}</span>
              </p>
              <p style={{ fontSize: "12px", color: "#636e72", marginTop: "5px" }}>
                OTP displayed for demo/testing purposes.
              </p>
              <button
                type="button"
                className="submit-btn"
                style={{ marginTop: "10px", padding: "8px 15px", fontSize: "14px" }}
                onClick={() => navigate("/verify-otp", { state: { email, role: userType, demoOtp } })}
              >
                Go to Verification →
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
