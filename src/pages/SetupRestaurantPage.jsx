import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Sidebar from '../components/Sidebar/Sidebar';
import '../styles/OnboardingPage.css';

export default function SetupRestaurantPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        restaurantName: '',
        address: '',
        gstNumber: '',
        restaurantPhoto: null,
        zomatoLink: '',
        swiggyLink: '',
        priceMode: '' // POS or MANUAL
    });

    useEffect(() => {
        if (user && user.role !== 'CREATOR') {
            navigate('/home');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'restaurantPhoto') {
            setFormData({ ...formData, [name]: files[0] });
        } else if (name === 'gstNumber') {
            setFormData({ ...formData, [name]: value.slice(0, 15).toUpperCase() });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.priceMode) {
            setError("Please select a price mode (POS or MANUAL)");
            return;
        }

        if (!formData.restaurantPhoto) {
            setError("Please upload a store frontal photo");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = new FormData();
            data.append('restaurantName', formData.restaurantName);
            data.append('address', formData.address);
            data.append('gstNumber', formData.gstNumber);
            data.append('priceMode', formData.priceMode);
            data.append('zomatoLink', formData.zomatoLink);
            data.append('swiggyLink', formData.swiggyLink);
            data.append('restaurantPhoto', formData.restaurantPhoto);

            const response = await api.post('/creators/restaurant-details', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.nextStep === 'VERIFICATION_PENDING' || response.data.nextStep === 'READY') {
                const profileId = user.id || user._id;
                navigate(`/creator/${profileId}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit restaurant details");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-layout-wrapper" style={{ display: 'flex' }}>
            <Sidebar />
            <div className="onboarding-container" style={{ flex: 1, padding: '40px' }}>
                <div className="onboarding-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="params-header">
                        <h2>Restaurant Setup</h2>
                        <p>Complete your partner profile for verification</p>
                    </div>

                    {error && <div className="error-message" style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                    <form onSubmit={handleSubmit} className="onboarding-form">
                        <div className="onboarding-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="input-field">
                                <label>Restaurant Name</label>
                                <input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} required placeholder="AS PER GST/ZOMATO" />
                            </div>

                            <div className="input-field">
                                <label>GST Number (15 Digits)</label>
                                <input
                                    type="text"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                    required
                                    placeholder="27AAAAA0000A1Z5"
                                    maxLength={15}
                                />
                            </div>

                            <div className="input-field" style={{ gridColumn: 'span 2' }}>
                                <label>Full Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Building No, Street, Landmark, Pincode" />
                            </div>

                            <div className="input-field">
                                <label>Store Frontal Photo</label>
                                <input type="file" name="restaurantPhoto" onChange={handleChange} accept="image/*" required />
                                <small>Must show the restaurant signage clearly</small>
                            </div>

                            <div className="input-field" style={{ gridColumn: 'span 2' }}>
                                <label style={{ marginBottom: '12px', display: 'block', fontWeight: '800' }}>Ordering & Pricing System</label>
                                <div className="price-mode-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    {/* POS Card */}
                                    <div
                                        className={`mode-card ${formData.priceMode === 'POS' ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, priceMode: 'POS' })}
                                        style={{
                                            padding: '24px',
                                            borderRadius: '20px',
                                            border: formData.priceMode === 'POS' ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                            background: '#000',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            boxShadow: formData.priceMode === 'POS' ? '0 0 20px rgba(250, 204, 21, 0.15)' : 'none',
                                            transform: formData.priceMode === 'POS' ? 'translateY(-4px)' : 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '28px' }}>⚡</span>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                border: '2px solid rgba(255,255,255,0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: formData.priceMode === 'POS' ? 'var(--color-primary)' : 'transparent'
                                            }}>
                                                {formData.priceMode === 'POS' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000' }} />}
                                            </div>
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: formData.priceMode === 'POS' ? 'var(--color-primary)' : '#fff' }}>POS Sync</h4>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#999', lineHeight: '1.5' }}>
                                            Auto-sync prices from your Petpooja or Posist system.
                                        </p>
                                    </div>

                                    {/* MANUAL Card */}
                                    <div
                                        className={`mode-card ${formData.priceMode === 'MANUAL' ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, priceMode: 'MANUAL' })}
                                        style={{
                                            padding: '24px',
                                            borderRadius: '20px',
                                            border: formData.priceMode === 'MANUAL' ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)',
                                            background: '#000',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            boxShadow: formData.priceMode === 'MANUAL' ? '0 0 20px rgba(250, 204, 21, 0.15)' : 'none',
                                            transform: formData.priceMode === 'MANUAL' ? 'translateY(-4px)' : 'none'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '28px' }}>📝</span>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                border: '2px solid rgba(255,255,255,0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: formData.priceMode === 'MANUAL' ? 'var(--color-primary)' : 'transparent'
                                            }}>
                                                {formData.priceMode === 'MANUAL' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#000' }} />}
                                            </div>
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: formData.priceMode === 'MANUAL' ? 'var(--color-primary)' : '#fff' }}>Manual Entry</h4>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#999', lineHeight: '1.5' }}>
                                            Enter prices yourself for each item you upload.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="input-field">
                                <label>Zomato Link (Optional)</label>
                                <input type="url" name="zomatoLink" value={formData.zomatoLink} onChange={handleChange} placeholder="https://www.zomato.com/..." />
                            </div>

                            <div className="input-field">
                                <label>Swiggy Link (Optional)</label>
                                <input type="url" name="swiggyLink" value={formData.swiggyLink} onChange={handleChange} placeholder="https://www.swiggy.com/..." />
                            </div>
                        </div>

                        <div className="form-actions" style={{ marginTop: '30px', textAlign: 'right' }}>
                            <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 30px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                                {loading ? "Submitting..." : "Submit for Verification →"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
