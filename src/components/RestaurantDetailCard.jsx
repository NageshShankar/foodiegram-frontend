import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getAssetUrl } from '../config';
import { IoCheckmarkCircle } from "react-icons/io5";
import '../styles/RestaurantDetailCard.css';

const RestaurantDetailCard = ({ restaurantId, onClose }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);
    const [activeMenuSlide, setActiveMenuSlide] = useState(0);

    const nextSlide = () => {
        if (!details?.ambienceImages) return;
        setActiveSlide(prev => (prev + 1) % details.ambienceImages.length);
    };

    const prevSlide = () => {
        if (!details?.ambienceImages) return;
        setActiveSlide(prev => (prev - 1 + details.ambienceImages.length) % details.ambienceImages.length);
    };

    const nextMenuSlide = () => {
        if (!details?.menuImages) return;
        setActiveMenuSlide(prev => (prev + 1) % details.menuImages.length);
    };

    const prevMenuSlide = () => {
        if (!details?.menuImages) return;
        setActiveMenuSlide(prev => (prev - 1 + details.menuImages.length) % details.menuImages.length);
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/restaurants/${restaurantId}/details`);
                setDetails(res.data.data);
            } catch (err) {
                console.error("Error fetching restaurant details:", err);
            } finally {
                setLoading(false);
            }
        };
        if (restaurantId) fetchDetails();
    }, [restaurantId]);

    if (loading) return (
        <div className="restaurant-detail-overlay" onClick={onClose}>
            <div className="restaurant-detail-card loading" onClick={e => e.stopPropagation()}>
                <div className="shimmer-title"></div>
                <div className="shimmer-gallery"></div>
            </div>
        </div>
    );

    if (!details) return null;

    return (
        <div className="restaurant-detail-overlay" onClick={onClose}>
            <div className="restaurant-detail-card" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                <div className="card-scroll-content">
                    {/* 1) Restaurant Name (+ verified badge) */}
                    <div className="detail-header">
                        <h2 className="detail-name">
                            {details.name}
                            {details.isVerified && (
                                <span className="verified-badge-pill-mini">
                                    <IoCheckmarkCircle />
                                </span>
                            )}
                        </h2>
                    </div>

                    {/* 2) Ambience Photos Slideshow */}
                    <div className="detail-section">
                        <p className="section-label">AMBIENCE</p>
                        {details.ambienceImages?.length > 0 ? (
                            <div className="detail-slideshow">
                                <div className="slideshow-main-mini">
                                    <img
                                        src={getAssetUrl(details.ambienceImages[activeSlide])}
                                        alt="Ambience"
                                        className="detail-slide-image"
                                    />
                                    {details.ambienceImages.length > 1 && (
                                        <>
                                            <button className="mini-nav prev" onClick={(e) => { e.stopPropagation(); prevSlide(); }}>‹</button>
                                            <button className="mini-nav next" onClick={(e) => { e.stopPropagation(); nextSlide(); }}>›</button>
                                        </>
                                    )}
                                </div>
                                <div className="mini-dots">
                                    {details.ambienceImages.map((_, i) => (
                                        <span
                                            key={i}
                                            className={`mini-dot ${i === activeSlide ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setActiveSlide(i); }}
                                        ></span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="no-data">No ambience photos available</p>
                        )}
                    </div>

                    {/* 3) Short Description */}
                    <div className="detail-section bio-section">
                        <p className="detail-description">{details.description || "No description provided."}</p>
                    </div>

                    {/* 4) Menu Images */}
                    <div className="detail-section">
                        <p className="section-label">MENU</p>
                        {details.menuImages?.length > 0 ? (
                            <div className="detail-slideshow">
                                <div className="slideshow-main-mini">
                                    <img
                                        src={getAssetUrl(details.menuImages[activeMenuSlide])}
                                        alt="Menu"
                                        className="detail-slide-image"
                                    />
                                    {details.menuImages.length > 1 && (
                                        <>
                                            <button className="mini-nav prev" onClick={(e) => { e.stopPropagation(); prevMenuSlide(); }}>‹</button>
                                            <button className="mini-nav next" onClick={(e) => { e.stopPropagation(); nextMenuSlide(); }}>›</button>
                                        </>
                                    )}
                                </div>
                                <div className="mini-dots">
                                    {details.menuImages.map((_, i) => (
                                        <span
                                            key={i}
                                            className={`mini-dot ${i === activeMenuSlide ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setActiveMenuSlide(i); }}
                                        ></span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="no-data">No menu images available</p>
                        )}
                    </div>
                </div>

                {/* 5) Zomato & Swiggy Buttons */}
                <div className="detail-actions">
                    {details.zomatoLink && (
                        <a href={details.zomatoLink.startsWith('http') ? details.zomatoLink : `https://${details.zomatoLink}`}
                            target="_blank" rel="noopener noreferrer" className="platform-btn zomato">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png" alt="Zomato" />
                            Order on Zomato
                        </a>
                    )}
                    {details.swiggyLink && (
                        <a href={details.swiggyLink.startsWith('http') ? details.swiggyLink : `https://${details.swiggyLink}`}
                            target="_blank" rel="noopener noreferrer" className="platform-btn swiggy">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png" alt="Swiggy" />
                            Order on Swiggy
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetailCard;
