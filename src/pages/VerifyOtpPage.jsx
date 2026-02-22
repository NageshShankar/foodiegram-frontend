import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./RegisterPage.css"; // Reuse styling

export default function VerifyOtpPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyRegistrationOTP } = useAuth();

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const email = location.state?.email || "";

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp || otp.length < 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        setError("");

        const result = await verifyRegistrationOTP(email, otp);
        if (result.success) {
            if (result.nextStep === "RESTAURANT_DETAILS") {
                navigate("/creator/setup-restaurant");
            } else {
                navigate("/home");
            }
        } else {
            setError(result.error || "Verification failed. Please check the code.");
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="registration-header">
                    <h2>Verify Your Email</h2>
                    <p style={{ color: "var(--color-text-secondary)", marginTop: "10px" }}>
                        We've sent a code to <strong>{email || "your email"}</strong>
                    </p>
                </div>

                <form onSubmit={handleVerify}>
                    <div className="step-content animate-blur">
                        <div className="input-group" style={{ gridTemplateColumns: '1fr' }}>
                            <input
                                type="text"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                maxLength={6}
                                style={{
                                    textAlign: 'center',
                                    fontSize: '32px',
                                    letterSpacing: '12px',
                                    fontWeight: 'bold',
                                    padding: '15px'
                                }}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <div className="auth-actions">
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Verifying..." : "Verify & Continue →"}
                        </button>
                    </div>
                </form>

                <p className="auth-footer">
                    Didn't receive the code? <Link to="/register">Register again</Link>
                </p>
            </div>
        </div>
    );
}
