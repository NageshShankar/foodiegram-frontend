import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ ADD THIS
import { useCart } from "../context/CartContext";
import { IoCartOutline, IoClose, IoAdd, IoRemove, IoTrashOutline, IoFastFoodOutline } from "react-icons/io5";
import "./CartPanel.css";

const Cart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart
  } = useCart();

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;

    navigate("/compare", {
      state: { cart: cartItems },
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cart-panel-overlay" onClick={onClose}>
      <div className="cart-panel glass" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="cart-panel-header">
          <div className="header-left">
            <div className="icon-container-glow">
              <IoCartOutline />
            </div>
            <div className="header-text">
              <h2>Your Cart</h2>
              <p className="cart-item-count">{cartItems.length} items</p>
            </div>
          </div>
          <button className="close-btn-minimal" onClick={onClose} aria-label="Close cart">
            <IoClose />
          </button>
        </div>

        {/* BODY */}
        <div className="cart-panel-body">
          {cartItems.length > 0 ? (
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div key={`${item.reelId}-${item.platform}-${index}`} className="cart-item-card">
                  <div className="item-main-info">
                    <div className="item-image-container">
                      {item.image ? (
                        <img src={item.image} alt={item.foodName} />
                      ) : (
                        <div className="item-placeholder">
                          <IoFastFoodOutline />
                        </div>
                      )}
                    </div>

                    <div className="item-content">
                      <div className="item-header">
                        <h3 className="item-name">{item.foodName}</h3>
                        <p className="item-restaurant">{item.restaurantName}</p>
                      </div>

                      <div className="platform-comparison">
                        {item.comparisonPrices?.zomato > 0 && (
                          <div className={`price-pill zomato ${item.platform === 'ZOMATO' ? 'active' : ''}`}>
                            <span className="platform-name">Zomato</span>
                            <span className="platform-price">₹{item.comparisonPrices.zomato}</span>
                          </div>
                        )}
                        {item.comparisonPrices?.swiggy > 0 && (
                          <div className={`price-pill swiggy ${item.platform === 'SWIGGY' ? 'active' : ''}`}>
                            <span className="platform-name">Swiggy</span>
                            <span className="platform-price">₹{item.comparisonPrices.swiggy}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="item-actions-row">
                    <div className="quantity-stepper">
                      <button
                        className="stepper-btn"
                        onClick={() => decreaseQuantity(item.reelId, item.platform)}
                        disabled={item.quantity <= 1}
                      >
                        <IoRemove />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="stepper-btn"
                        onClick={() => increaseQuantity(item.reelId, item.platform)}
                      >
                        <IoAdd />
                      </button>
                    </div>

                    <div className="item-price-total">
                      <span className="subtotal">₹{item.price * item.quantity}</span>
                      <button
                        className="item-remove-link"
                        onClick={() => removeFromCart(item.reelId, item.platform)}
                        title="Remove item"
                      >
                        <IoTrashOutline />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-cart-state">
              <div className="empty-icon-wrapper">
                <IoCartOutline />
              </div>
              <h3>Your cart is empty</h3>
              <p>Add some delicious dishes from your favorite reels!</p>
              <button className="browse-btn" onClick={onClose}>Browse Reels</button>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-panel-footer glass">
            <div className="footer-actions">
              <button className="checkout-cta" onClick={handleProceedToCheckout}>
                Proceed to Checkout
                <span className="btn-arrow">→</span>
              </button>
              <button className="clear-cart-link" onClick={clearCart}>
                Clear All Items
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
