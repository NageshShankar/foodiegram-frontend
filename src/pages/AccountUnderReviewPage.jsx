import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css'; // Reuse auth styles

export default function AccountUnderReviewPage() {
    const { logout } = useAuth();

    return (
        <div className="auth-container" style={{ background: '#f8fafc' }}>
            <div className="auth-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>🛡️</div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
                    Account Under Review
                </h2>
                <div style={{ height: '4px', width: '60px', background: '#FACC15', margin: '0 auto 24px' }}></div>

                <p style={{ color: '#475569', fontSize: '18px', lineHeight: '1.6', marginBottom: '32px' }}>
                    Your account is under verification.<br />
                    This may take <strong>1-3 hours</strong>.<br />
                    You will gain full access after approval.
                </p>

                <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
                    <p style={{ color: '#854d0e', fontSize: '14px', margin: 0 }}>
                        Our team is checking your restaurant details to ensure a safe experience for everyone.
                    </p>
                </div>

                <div className="auth-actions">
                    <button
                        onClick={() => window.location.reload()}
                        className="submit-btn"
                        style={{ marginBottom: '12px' }}
                    >
                        Check Status Again
                    </button>
                    <button
                        onClick={logout}
                        style={{
                            background: 'transparent',
                            border: '1px solid #e2e8f0',
                            color: '#64748b',
                            padding: '12px',
                            borderRadius: '8px',
                            width: '100%',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
