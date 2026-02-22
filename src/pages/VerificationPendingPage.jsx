import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import { useAuth } from '../context/AuthContext';
import '../styles/OnboardingPage.css';

export default function VerificationPendingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (user) {
                navigate(`/creator/${user.id || user._id}`);
            } else {
                navigate('/home');
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [navigate, user]);

    return (
        <div className="onboarding-layout-wrapper" style={{ display: 'flex' }}>
            <Sidebar />
            <div className="onboarding-container" style={{ flex: 1 }}>
                <div className="onboarding-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div className="success-icon" style={{ fontSize: '64px', marginBottom: '24px' }}>⏳</div>
                    <h2 style={{ marginBottom: '16px' }}>Verification in Progress</h2>
                    <p style={{ color: '#64748b', fontSize: '18px', lineHeight: '1.6', marginBottom: '32px' }}>
                        Your account is under verification. It may take up to <strong>1 hour</strong>.<br />
                        You will be redirected to your profile page.
                    </p>
                    <div className="info-box" style={{ background: '#fefce8', color: '#854d0e', padding: '20px', borderRadius: '12px', marginBottom: '40px', border: '1px solid #fef08a' }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            Our team is currently reviewing your restaurant details. You'll have full access once approved.
                        </p>
                    </div>
                    <button onClick={() => navigate(`/creator/${user.id || user._id}`)} className="btn-primary" style={{ padding: '12px 40px' }}>
                        Go to Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
