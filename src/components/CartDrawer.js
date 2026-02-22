import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/CartDrawer.css";

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, totalQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    const currentY = e.changedTouches[0].clientY;
    const deltaY = startY - currentY;
    if (deltaY < -50) {
      onClose();
    }
  };

  const getItemPrice = (item) => item.price;

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div
        className={`cart-drawer ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="cart-header">
          <div className="grab-bar"></div>
          <h2>Your Cart ({totalQuantity})</h2>
          {cartItems.length > 0 && (
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear All
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-content empty">
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <p>Your cart is empty</p>
              <span>Add some delicious food!</span>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-items-scroll">
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img
                        src={item.image || "https://cdn-icons-png.flaticon.com/512/1046/1046751.png"}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = "https://cdn-icons-png.flaticon.com/512/1046/1046751.png";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h3 className="item-title">{item.name}</h3>
                      <p className="item-restaurant">
                        <img
                          src={
                            item.restaurant?.toLowerCase().includes('swiggy')
                              ? "https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png"
                              : item.restaurant?.toLowerCase().includes('zomato')
                                ? "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png"
                                : item.restaurant?.toLowerCase().includes('blinkit')
                                  ? "https://seeklogo.com/images/B/blinkit-logo-9F1B8F5081-seeklogo.com.png"
                                  : "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png"
                          }
                          alt="Restaurant Logo"
                          className="restaurant-logo"
                        />
                        {item.restaurant}
                      </p>
                      <p className="item-price">₹{getItemPrice(item)}</p>
                    </div>
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn decrease"
                        onClick={() => decreaseQuantity(item.id)}
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        className="quantity-btn increase"
                        onClick={() => increaseQuantity(item.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cart-footer">
              <div className="cart-total">
                <div className="total-label">Total</div>
                <div className="total-amount">₹{totalPrice}</div>
              </div>
              <button className="checkout-btn" onClick={() => navigate('/compare')}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
