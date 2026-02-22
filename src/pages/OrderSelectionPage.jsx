import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './orderSelection.css';

const OrderSelectionPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useCart();
  const [selections, setSelections] = useState({});

  // App data with high-quality logos and mock data
  const apps = {
    zomato: {
      name: 'Zomato',
      logo: 'https://logos-world.net/wp-content/uploads/2020/11/Zomato-Logo.png',
      baseUrl: 'https://www.zomato.com'
    },
    swiggy: {
      name: 'Swiggy',
      logo: 'https://logos-world.net/wp-content/uploads/2020/11/Swiggy-Logo.png',
      baseUrl: 'https://www.swiggy.com'
    },
    blinkit: {
      name: 'Blinkit',
      logo: 'https://logos-world.net/wp-content/uploads/2020/11/Blinkit-Logo.png',
      baseUrl: 'https://blinkit.com'
    }
  };

  // SVG Icons
  const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FACC15">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#A3A3A3">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
    </svg>
  );

  const TruckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#A3A3A3">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
  );

  const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444">
      <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" />
    </svg>
  );

  // Generate mock data for each item-app combination
  const getAppData = (itemId, appKey) => {
    const basePrice = cartItems.find(item => item.id === itemId)?.price || 0;
    const variations = {
      zomato: { price: basePrice + Math.floor(Math.random() * 50), rating: (4.2 + Math.random() * 0.8).toFixed(1), deliveryTime: '25-35 min', deliveryCharge: '₹40' },
      swiggy: { price: basePrice + Math.floor(Math.random() * 50), rating: (4.0 + Math.random() * 0.8).toFixed(1), deliveryTime: '20-30 min', deliveryCharge: '₹35' },
      blinkit: { price: basePrice + Math.floor(Math.random() * 50), rating: (4.1 + Math.random() * 0.8).toFixed(1), deliveryTime: '15-25 min', deliveryCharge: '₹30' }
    };
    return variations[appKey];
  };

  const handleAppSelection = (itemId, appKey) => {
    setSelections(prev => ({
      ...prev,
      [itemId]: appKey
    }));
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
    setSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[itemId];
      return newSelections;
    });
  };

  const handleProceedToOrder = () => {
    const selectedApps = Object.values(selections);
    if (selectedApps.length !== cartItems.length) {
      alert('Please select an app for all items');
      return;
    }

    // Open each selected app in new tab
    cartItems.forEach(item => {
      const selectedApp = selections[item.id];
      if (selectedApp) {
        window.open(apps[selectedApp].baseUrl, '_blank');
      }
    });
  };

  const allItemsSelected = Object.keys(selections).length === cartItems.length;

  if (cartItems.length === 0) {
    return (
      <div className="order-selection-page">
        <div className="empty-selection">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-selection-page">
      <button className="back-button" onClick={() => navigate('/')}>
        ←
      </button>
      <div className="page-header">
        <h1>Choose Where You Want to Order From</h1>
        <p>Select the best app for each item</p>
      </div>

      <div className="items-section">
        {cartItems.map(item => (
          <div key={item.id} className="item-card">
            <div className="item-info">
              <img src={item.image} alt={item.name} className="item-image" />
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="restaurant">{item.restaurant}</p>
                <div className="item-meta">
                  <div className="rating">
                    <StarIcon />
                    <span>{item.rating || '4.5'}</span>
                  </div>
                  <span className="price">₹{item.price}</span>
                </div>
              </div>
              <button
                className="remove-item-btn"
                onClick={() => handleRemoveItem(item.id)}
                title="Remove item"
              >
                <TrashIcon />
              </button>
            </div>

            <div className="apps-comparison">
              {Object.entries(apps).map(([appKey, app]) => {
                const appData = getAppData(item.id, appKey);
                const isSelected = selections[item.id] === appKey;

                return (
                  <div
                    key={appKey}
                    className={`app-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleAppSelection(item.id, appKey)}
                  >
                    <div className="app-header">
                      <img src={app.logo} alt={app.name} className="app-logo" />
                      <span className="app-name">{app.name}</span>
                    </div>
                    <div className="app-details">
                      <div className="price">₹{appData.price}</div>
                      <div className="rating">
                        <StarIcon />
                        <span>{appData.rating}</span>
                      </div>
                      <div className="delivery-time">
                        <ClockIcon />
                        <span>{appData.deliveryTime}</span>
                      </div>
                      <div className="delivery-charge">
                        <TruckIcon />
                        <span>{appData.deliveryCharge}</span>
                      </div>
                    </div>
                    <div className="selection-indicator">
                      {isSelected && <div className="selected-check">✓</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {allItemsSelected && (
        <div className="selection-summary">
          <h2>Your Selected Apps</h2>
          <div className="summary-list">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <span className="item-name">{item.name}</span>
                <span className="arrow">→</span>
                <span className="selected-app">{apps[selections[item.id]].name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="action-section">
        <button
          className="proceed-btn"
          onClick={handleProceedToOrder}
          disabled={!allItemsSelected}
        >
          Proceed to Order on Selected Apps
        </button>
      </div>
    </div>
  );
};

export default OrderSelectionPage;
