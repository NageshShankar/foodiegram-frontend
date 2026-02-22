import React from "react";
import "../../styles/SearchPage.css";

export default function SearchRightPanel({ dish }) {
  // Empty state (when nothing is selected)
  if (!dish) {
    return (
      <div className="search-right">
        <div className="empty-content animate-blur">
          <div className="empty-icon">🍱</div>
          <h2 className="empty-title">Discover Something Great</h2>
          <p className="empty-subtitle">
            Search for your favorite dishes or explore top-rated restaurants to see their details here.
          </p>
        </div>
      </div>
    );
  }

  const isVideo = dish.image?.match(/\.(mp4|mov|avi|wmv|mkv)$/) || dish.type === 'dish';

  const ensureProtocol = (url) => {
    if (!url) return "";
    return (url.startsWith('http://') || url.startsWith('https://')) ? url : `https://${url}`;
  };

  return (
    <div className="search-right">
      <div className="dish-card animate-up">
        {/* MEDIA SECTION */}
        <div className="dish-image-wrapper">
          {isVideo ? (
            <video
              src={dish.image}
              className="dish-image-large"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={dish.image}
              alt={dish.dishName}
              className="dish-image-large"
            />
          )}
          <div className="dish-image-overlay" />
          <div className="dish-tag-pill">
            {dish.rating >= 4.5 ? "Chef's Choice" : "Top Rated"}
          </div>
          {dish.restaurantName && (
            <div className="dish-image-source-pill">
              By {dish.restaurantName}
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="dish-content">
          <div className="dish-header-main">
            <h1 className="dish-name">{dish.dishName}</h1>
            {dish.restaurantName && <p className="dish-restaurant-sub">Available at {dish.restaurantName}</p>}
          </div>

          <div className="dish-meta-row">
            <div className="dish-rating-chip">
              <span className="dish-rating-star">★</span>
              <span className="dish-rating-value">{dish.rating}</span>
            </div>

            {!dish.isRestaurant && (
              <div className="dish-price">
                <span>Avg. price</span>
                <span className="dish-price-value">{dish.price || "₹199"}</span>
              </div>
            )}
          </div>

          <div style={{
            marginTop: '20px',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <p style={{ fontSize: '11px', fontWeight: '900', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Order Online</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Zomato Row */}
              {(dish.prices?.zomatoPrice || dish.zomatoLink) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png" alt="Zomato" style={{ width: '100%' }} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '600' }}>Zomato</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-primary)' }}>
                      {dish.prices?.zomatoPrice ? `₹${dish.prices.zomatoPrice}` : 'Menu'}
                    </span>
                    {dish.zomatoLink && (
                      <a href={ensureProtocol(dish.zomatoLink)} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '8px 16px', background: '#e03546', color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: '800', textDecoration: 'none' }}>
                        GO
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Swiggy Row */}
              {(dish.prices?.swiggyPrice || dish.swiggyLink) && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png" alt="Swiggy" style={{ width: '100%' }} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '600' }}>Swiggy</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-primary)' }}>
                      {dish.prices?.swiggyPrice ? `₹${dish.prices.swiggyPrice}` : 'Menu'}
                    </span>
                    {dish.swiggyLink && (
                      <a href={ensureProtocol(dish.swiggyLink)} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '8px 16px', background: '#fc8019', color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: '800', textDecoration: 'none' }}>
                        GO
                      </a>
                    )}
                  </div>
                </div>
              )}

              {!dish.zomatoLink && !dish.swiggyLink && !dish.prices?.zomatoPrice && !dish.prices?.swiggyPrice && (
                <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.3)', textAlign: 'center', padding: '10px' }}>
                  Order links unavailable
                </span>
              )}
            </div>
          </div>

          <button
            className="open-app-btn btn-primary"
            style={{ marginTop: '24px' }}
            onClick={() => {
              const link = ensureProtocol(dish.zomatoLink || dish.swiggyLink);
              if (link) window.open(link, '_blank');
              else alert("Opening restaurant details...");
            }}
          >
            ORDER FROM {dish.restaurantName || "RESTAURANT"}
          </button>
        </div>
      </div>
    </div>
  );
}

