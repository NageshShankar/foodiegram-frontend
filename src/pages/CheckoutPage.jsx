import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar/Sidebar';
import Snackbar from '../components/Snackbar';
import '../styles/checkout.css';

const CheckoutPage = () => {
  const [groupedData, setGroupedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCheckout = async () => {
      try {
        const res = await api.get('/cart/checkout');
        setGroupedData(res.data.data);
      } catch (err) {
        console.error("Checkout fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCheckout();
  }, []);

  const openApp = (url, platform, available) => {
    if (!available || !url) {
      setSnackbar({
        show: true,
        message: `This restaurant has not provided a ${platform} link yet.`
      });
      setTimeout(() => setSnackbar({ show: false, message: '' }), 3000);
      return;
    }
    const safeUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(safeUrl, '_blank');
  };

  if (loading) {
    return <div className="checkout-page"><div className="loading">Preparing your order...</div></div>;
  }

  if (groupedData.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1>Checkout</h1>
        </div>
        <div className="empty-checkout">
          <div className="empty-icon">🛒</div>
          <h2>No items for checkout</h2>
          <p>Go back and add some items to your cart!</p>
          <button onClick={() => navigate("/home")} className="browse-btn">Browse Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-layout-wrapper" style={{ display: 'flex' }}>
      <Sidebar />
      <div className="checkout-page" style={{ flex: 1 }}>
        <div className="checkout-header">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1>Complete Your Order</h1>
          <p className="checkout-subtitle">We've grouped your items by restaurant for easy ordering</p>
        </div>

        <div className="checkout-content">
          {groupedData.map((group, gIndex) => (
            <div key={gIndex} className="restaurant-group-card">
              <h2 className="restaurant-name">{group.restaurantName}</h2>

              <div className="grouped-items">
                {group.items.map((item, iIndex) => (
                  <div key={iIndex} className="grouped-item">
                    <div className="item-main">
                      <span className="item-name">{item.foodName}</span>
                      <span className="item-platform-tag">{item.platform}</span>
                    </div>
                    <div className="item-price-info">
                      <span className="item-qty">x{item.quantity}</span>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="checkout-actions">
                <button
                  className={`platform-checkout-btn zomato ${!group.checkoutLinks.zomatoAvailable ? 'disabled' : ''}`}
                  onClick={() => openApp(group.checkoutLinks.zomato, 'Zomato', group.checkoutLinks.zomatoAvailable)}
                  title={!group.checkoutLinks.zomatoAvailable ? "Link not available" : ""}
                >
                  Checkout on Zomato
                </button>
                <button
                  className={`platform-checkout-btn swiggy ${!group.checkoutLinks.swiggyAvailable ? 'disabled' : ''}`}
                  onClick={() => openApp(group.checkoutLinks.swiggy, 'Swiggy', group.checkoutLinks.swiggyAvailable)}
                  title={!group.checkoutLinks.swiggyAvailable ? "Link not available" : ""}
                >
                  Checkout on Swiggy
                </button>
              </div>
            </div>
          ))}
        </div>
        <Snackbar show={snackbar.show} message={snackbar.message} />
      </div>
    </div>
  );
}

export default CheckoutPage;
