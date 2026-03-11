import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileRedirect = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login');
            } else if (user.role === 'CREATOR') {
                navigate(`/creator/${user.id || user._id}`);
            } else {
                // Standard users might not have a dedicated profile page yet, 
                // or they might have one. For now, redirect to home or a user profile if it exists.
                navigate('/home');
            }
        }
    }, [user, loading, navigate]);

    return <div style={{ padding: '20px', textAlign: 'center' }}>Redirecting to profile...</div>;
};

export default ProfileRedirect;
