import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/CartPage.css";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, totalPrice, fetchCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchCart();
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="cart-layout-wrapper">
        <Sidebar />
        <div className="cart-page" style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-in'
        }}>
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some delicious food to your cart!</p>
            <button onClick={() => navigate("/home")} className="browse-btn">
              Browse Food
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-layout-wrapper">
      <Sidebar />
      <div className="cart-page">
        <div className="cart-header">
          <h1>Your Cart</h1>
          <span className="cart-count">{cartItems.length} items</span>
        </div>

        <div className="cart-items">
          {cartItems.map((item, index) => (
            <div key={`${item.reelId}-${index}`} className="cart-item">
              <div className="item-details">
                <h3>{item.foodName}</h3>
                <p className="restaurant">{item.restaurantName}</p>
                <div className="platform-tag" style={{
                  fontSize: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  width: 'fit-content',
                  marginBottom: '4px'
                }}>
                  {item.platform}
                </div>
                <div className="item-price">₹{item.price}</div>
              </div>

              <div className="quantity-controls">
                <button onClick={() => decreaseQuantity(item.reelId, item.platform)} className="quantity-btn">-</button>
                <span className="quantity">{item.quantity}</span>
                <button onClick={() => increaseQuantity(item.reelId, item.platform)} className="quantity-btn">+</button>
              </div>

              <button onClick={() => removeFromCart(item.reelId, item.platform)} className="remove-btn">Remove</button>
            </div>
          ))}
        </div>

        <div className="cart-footer">
          <div className="total-section">
            <button
              className="checkout-btn"
              onClick={() => navigate("/compare", { state: { cart: cartItems } })}
            >
              Compare Prices & Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
