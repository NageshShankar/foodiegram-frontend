import React from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import "../styles/CartNotification.css";

export default function CartNotification() {

  return (
    <div className="cart-notification">
      <div className="notification-icon">
        <IoCheckmarkCircle />
      </div>
      <span>Item added to bag</span>
    </div>
  );
}
