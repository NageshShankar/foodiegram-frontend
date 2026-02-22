import React, { useState } from "react";
import "../styles/LoginPage.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const { user, login, googleLogin, forgotPassword } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  /* =======================
       LOGIN HANDLER
     ======================= */
  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Please fill all fields");
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      if (result.nextStep === "RESTAURANT_DETAILS") {
        navigate("/creator/setup-restaurant");
      } else if (result.nextStep === "VERIFICATION_PENDING") {
        navigate("/creator/verification-pending");
      } else {
        navigate("/home");
      }
    } else {
      setMessage(result.error);
    }
  };

  /* =========================
       FORGOT PASSWORD HANDLER
     ========================= */
  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("Please enter your email");
      return;
    }
    const result = await forgotPassword(email);
    if (result.success) {
      setMessage("Password reset link sent to your email!");
      setIsForgotPassword(false);
    } else {
      setMessage(result.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google User:", decoded);

      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        if (result.nextStep === "RESTAURANT_DETAILS") {
          navigate("/creator/setup-restaurant");
        } else if (result.nextStep === "VERIFICATION_PENDING") {
          navigate("/creator/verification-pending");
        } else {
          navigate("/home");
        }
      } else {
        setMessage(result.error);
      }
    } catch (err) {
      setMessage("Failed to process Google login.");
    }
  };

  const handleGoogleError = () => {
    setMessage("Google Login Failed. Please try again.");
  };

  return (
    <div className="login-page-wrapper">
      {/* Decorative Background Elements */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* LEFT SIDE - FOOD SHOWCASE */}
      <div className="left-section">
        <div className="food-showcase">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"
            alt="Premium Dish 1"
            className="food-image food-image-1"
          />
          <img
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"
            alt="Premium Dish 2"
            className="food-image food-image-2"
          />
          <div className="brand-badge">FOODIEGRAM</div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="right-section">
        <div className="form-container">
          <div className="form-content">
            <div className="header-group">
              <h1 className="form-title">Foodiegram</h1>
            </div>

            {/* Role Selector */}
            <div className="role-toggle">
              <button
                className={role === "user" ? "active" : ""}
                onClick={() => {
                  setRole("user");
                  setMessage("");
                }}
              >
                Foodie
              </button>
              <button
                className={role === "creator" ? "active" : ""}
                onClick={() => {
                  setRole("creator");
                  setMessage("");
                }}
              >
                Creator
              </button>
            </div>

            {message && (
              <div className={`error-message ${message.includes('sent') ? 'success' : ''}`}>
                {message}
              </div>
            )}

            {isForgotPassword ? (
              /* FORGOT PASSWORD FORM */
              <div className="form-group animate-blur">
                <p className="form-subtitle">Recover your account</p>
                <div className="input-field">
                  <input
                    type="email"
                    placeholder="Enter your Email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button className="submit-btn" onClick={handleForgotPassword}>
                  Send Reset Link
                </button>
                <p className="toggle-link">
                  Remember password?{" "}
                  <Link to="#" onClick={() => setIsForgotPassword(false)}>Back to Login</Link>
                </p>
              </div>
            ) : (
              /* LOGIN FORM */
              <div className="form-group animate-blur">
                <div className="input-field">
                  <input
                    type="text"
                    placeholder="Email or Username"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="input-field">
                  <input
                    type="password"
                    placeholder="Password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="forgot-link">
                  <Link to="#" onClick={() => setIsForgotPassword(true)}>Forgot password?</Link>
                </div>
                <button className="submit-btn" onClick={handleLogin}>
                  Sign In
                </button>
              </div>
            )}

            <div className="divider">
              <span>Secure Access</span>
            </div>

            {role === 'user' && (
              <div className="social-login-container">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  width="100%"
                />
              </div>
            )}

            {!isForgotPassword && (
              <p className="toggle-link">
                New to Foodiegram?{" "}
                <Link to="/register" state={{ role: role }}>Join Now</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
