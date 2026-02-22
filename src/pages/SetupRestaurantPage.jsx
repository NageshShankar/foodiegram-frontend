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

            if (response.data.nextStep === 'VERIFICATION_PENDING') {
                navigate('/creator/verification-pending');
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

                            <div className="input-field">
                                <label>Price Mode</label>
                                <div className="price-mode-selector" style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                    <button
                                        type="button"
                                        className={formData.priceMode === 'POS' ? 'btn-active' : 'btn-outline'}
                                        onClick={() => setFormData({ ...formData, priceMode: 'POS' })}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ddd' }}
                                    >
                                        POS Integration
                                    </button>
                                    <button
                                        type="button"
                                        className={formData.priceMode === 'MANUAL' ? 'btn-active' : 'btn-outline'}
                                        onClick={() => setFormData({ ...formData, priceMode: 'MANUAL' })}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #ddd' }}
                                    >
                                        Manual Entry
                                    </button>
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
