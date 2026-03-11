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
    const demoOtp = location.state?.demoOtp || "";

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
                        <div className="input-group" style={{ gridTemplateColumns: '1fr', marginBottom: '20px' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    maxLength={6}
                                    style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        fontSize: '42px',
                                        letterSpacing: '20px',
                                        fontWeight: '900',
                                        padding: '25px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '20px',
                                        color: 'var(--color-primary)',
                                        fontFamily: "'Courier New', Courier, monospace",
                                        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.2)'
                                    }}
                                    required
                                    autoFocus
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    color: '#555',
                                    fontWeight: '800'
                                }}>Enter 6-Digit Code</div>
                            </div>
                        </div>

                        {demoOtp && (
                            <div className="demo-otp-box" style={{
                                marginTop: "25px",
                                padding: "15px",
                                background: "#000",
                                border: "1px solid var(--color-primary)",
                                borderRadius: "14px",
                                position: "relative",
                                overflow: "hidden"
                            }}>
                                <div style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    padding: "2px 10px",
                                    background: "var(--color-primary)",
                                    color: "#000",
                                    fontSize: "9px",
                                    fontWeight: "900",
                                    textTransform: "uppercase",
                                    borderRadius: "0 0 0 10px"
                                }}>Dev Config</div>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{
                                        width: "40px",
                                        height: "40px",
                                        background: "rgba(250, 204, 21, 0.1)",
                                        borderRadius: "10px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "20px"
                                    }}>🛡️</div>
                                    <div style={{ textAlign: "left" }}>
                                        <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>Auto-filled code:</p>
                                        <p style={{
                                            margin: 0,
                                            fontSize: "20px",
                                            fontWeight: "900",
                                            color: "var(--color-primary)",
                                            letterSpacing: "4px",
                                            fontFamily: "monospace"
                                        }}>{demoOtp}</p>
                                    </div>
                                </div>
                            </div>
                        )}
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
            </div >
        </div >
    );
}
