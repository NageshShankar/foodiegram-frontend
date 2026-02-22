import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import './priceComparison.css';

const PriceComparison = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize localCart from location.state.cart, ensuring it's an array
  const initialCart = Array.isArray(location.state?.cart) ? location.state.cart : [];
  const [localCart, setLocalCart] = useState(initialCart);

  // By default, select the platform with the lower price for each item
  const [selections, setSelections] = useState(() => {
    const initialSelections = {};
    initialCart.forEach(item => {
      const zomatoPrice = item.comparisonPrices?.zomato || Infinity;
      const swiggyPrice = item.comparisonPrices?.swiggy || Infinity;
      initialSelections[item.reelId] = zomatoPrice <= swiggyPrice ? 'zomato' : 'swiggy';
    });
    return initialSelections;
  });

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const getComparisonData = (item) => {
    const { comparisonPrices, links } = item;

    return {
      zomato: {
        name: 'Zomato',
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
        price: comparisonPrices?.zomato || 'N/A',
        link: links?.zomato || '#',
        color: '#E23744',
        delivery: 25,
        rating: '4.2',
        time: '25-35 min'
      },
      swiggy: {
        name: 'Swiggy',
        logo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png",
        price: comparisonPrices?.swiggy || 'N/A',
        link: links?.swiggy || '#',
        color: '#FC8019',
        delivery: 20,
        rating: '4.3',
        time: '20-30 min'
      }
    };
  };

  const handleAppSelection = (itemId, appKey) => {
    setSelections(prev => {
      const currentSelection = prev[itemId];
      // If clicking the same one, deselect it
      if (currentSelection === appKey) {
        const newSelections = { ...prev };
        delete newSelections[itemId];
        return newSelections;
      }
      // Otherwise select it
      return {
        ...prev,
        [itemId]: appKey
      };
    });
  };

  const handleRemoveItem = (itemId) => {
    const newCart = localCart.filter(item => item.reelId !== itemId);
    setLocalCart(newCart);

    setSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[itemId];
      return newSelections;
    });

    if (newCart.length === 0) {
      navigate('/home');
    }
  };

  if (localCart.length === 0) {
    return (
      <div className="price-comparison-layout">
        <Sidebar />
        <div className="price-comparison-container empty">
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h1>Your cart is empty</h1>
            <p>Add some delicious items to compare prices!</p>
            <button className="back-home-btn" onClick={() => navigate('/home')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="price-comparison-layout">
      <Sidebar />
      <div className="price-comparison-container">
        <header className="comparison-header">
          <button className="icon-btn back-btn" onClick={() => navigate(-1)}>
            <span className="material-icons">chevron_left</span>
          </button>
          <div className="header-content">
            <h1>Compare & Save</h1>
            <p>{localCart.length} {localCart.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>
        </header>

        <main className="comparison-main">
          {localCart.map((item) => {
            const comparison = getComparisonData(item);
            return (
              <section key={item.reelId} className="comparison-item-card">
                <div className="item-main-info">
                  <div className="item-text">
                    <h3>{item.foodName}</h3>
                    <p className="restaurant-name">
                      <span className="material-icons">restaurant</span>
                      {item.restaurantName}
                    </p>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemoveItem(item.reelId)}>
                    <span className="material-icons">delete_outline</span>
                  </button>
                </div>

                <div className="platforms-grid">
                  {Object.entries(comparison).map(([key, data]) => {
                    const isSelected = selections[item.reelId] === key;
                    const isNA = data.price === 'N/A' || data.price === 0;

                    return (
                      <div
                        key={key}
                        className={`platform-card ${key} ${isSelected ? 'selected' : ''} ${isNA ? 'disabled' : ''}`}
                        onClick={() => !isNA && handleAppSelection(item.reelId, key)}
                      >
                        <div className="platform-header">
                          <img src={data.logo} alt={data.name} className="platform-logo" />
                          <span className="platform-name">{data.name}</span>
                          {isSelected && <div className="check-mark">✓</div>}
                        </div>

                        <div className="price-section">
                          <div className="main-price">
                            {isNA ? 'Not Available' : `₹${data.price}`}
                          </div>
                          {!isNA && <div className="delivery-info">+ ₹{data.delivery} delivery fee</div>}
                        </div>

                        <div className="platform-footer">
                          <div className="meta">
                            <span className="rating">⭐ {data.rating}</span>
                            <span className="time">🕒 {data.time}</span>
                          </div>
                          <a
                            href={data.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-on-app"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Menu
                            <span className="material-icons">open_in_new</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}

export default PriceComparison;