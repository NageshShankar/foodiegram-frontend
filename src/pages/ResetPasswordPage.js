import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LoginPage.css"; // Reuse login styles

export default function ResetPasswordPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !confirmPassword) {
            setMessage("Please fill all fields");
            return;
        }
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        setLoading(true);
        const result = await resetPassword(token, password);
        setLoading(false);

        if (result.success) {
            setMessage("Password successfully reset! Redirecting to login...");
            setTimeout(() => navigate("/login"), 3000);
        } else {
            setMessage(result.error);
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="bg-glow-1"></div>
            <div className="bg-glow-2"></div>

            <div className="right-section" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <div className="form-container" style={{ maxWidth: '450px' }}>
                    <div className="form-content">
                        <div className="header-group">
                            <h1 className="form-title">Reset Password</h1>
                        </div>

                        {message && (
                            <div className={`error-message ${message.includes('successfully') ? 'success' : ''}`}>
                                {message}
                            </div>
                        )}

                        <form className="form-group animate-blur" onSubmit={handleSubmit}>
                            <div className="input-field">
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="input-field">
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="form-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <button className="submit-btn" disabled={loading}>
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
