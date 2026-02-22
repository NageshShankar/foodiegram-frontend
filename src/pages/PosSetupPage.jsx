import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar/Sidebar';
import '../styles/OnboardingPage.css';

export default function PosSetupPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [posData, setPosData] = useState({
        posProvider: 'PETPOOJA',
        apiKey: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await api.post('/creator/pos/connect', posData);
            await api.post('/creator/pos/complete');
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || "Failed to connect POS");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-layout-wrapper" style={{ display: 'flex' }}>
            <Sidebar />
            <div className="onboarding-container" style={{ flex: 1 }}>
                <div className="onboarding-card">
                    <div className="params-header">
                        <h2>POS Setup</h2>
                        <p>Connect your point-of-sale system</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="onboarding-form">
                        <div className="input-field">
                            <label>POS Provider</label>
                            <select
                                name="posProvider"
                                value={posData.posProvider}
                                onChange={(e) => setPosData({ ...posData, posProvider: e.target.value })}
                                style={{ width: '100%', padding: '14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            >
                                <option value="PETPOOJA">Petpooja</option>
                                <option value="POSIST">Posist</option>
                            </select>
                        </div>

                        <div className="input-field">
                            <label>API Key / Merchant ID</label>
                            <input
                                type="password"
                                value={posData.apiKey}
                                onChange={(e) => setPosData({ ...posData, apiKey: e.target.value })}
                                placeholder="Enter your API key"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? "Connecting..." : "Connect & Complete Setup →"}
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="btn-secondary" style={{ marginTop: '10px', width: '100%' }}>
                            Back
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
