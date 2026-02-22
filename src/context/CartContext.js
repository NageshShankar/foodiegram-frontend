import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import api from "../utils/api";

const CartContext = createContext();
export { CartContext };
export const useCart = () => useContext(CartContext);

/* ===========================
   REDUCER
   =========================== */
const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return action.payload || [];

    case "ADD_TO_CART": {
      const existingItem = state.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }

    case "REMOVE_FROM_CART":
      return state.filter((item) => item.id !== action.payload);

    case "INCREASE_QUANTITY":
      return state.map((item) =>
        item.id === action.payload
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );

    case "DECREASE_QUANTITY":
      return state
        .map((item) =>
          item.id === action.payload
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        )
        .filter((item) => item.quantity > 0);

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
};

/* ===========================
   PROVIDER
   =========================== */
export const CartProvider = ({ children }) => {
  const [cartItems, dispatch] = useReducer(cartReducer, [], () => {
    try {
      const stored = localStorage.getItem("foodiegramCart");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Cart data corruption:", err);
      return [];
    }
  });

  // 🔑 SINGLE SOURCE OF TRUTH FOR CART VISIBILITY
  const [cartPanelOpen, setCartPanelOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("foodiegramCart", JSON.stringify(cartItems));
  }, [cartItems]);

  /* ===========================
     CART ACTIONS
     =========================== */

  const addToCart = (item) => {
    dispatch({ type: "ADD_TO_CART", payload: item });
    setCartPanelOpen(true);
  };

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      dispatch({ type: "SET_CART", payload: res.data.data.items });
    } catch (err) {
      console.error("Fetch cart error:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCartFromReel = async (reelId, platform = 'ZOMATO') => {
    try {
      console.log("Adding to cart:", { reelId, platform });
      const res = await api.post('/cart/add', { reelId, platform });

      if (res.data.success) {
        await fetchCart();
        setCartPanelOpen(true);
      } else {
        alert("[DEBUG] " + (res.data.message || "Failed to add item to cart"));
      }
    } catch (err) {
      console.error("ADD TO CART FRONTEND ERROR:", err);

      // Detailed error breakdown
      if (err.response) {
        // The server responded with a status code that falls out of the range of 2xx
        const msg = err.response.data?.message || err.response.data?.error || "Server error occurred";
        alert(`[DEBUG] Failed to add: ${msg}`);
      } else if (err.request) {
        // The request was made but no response was received
        alert("[DEBUG] No response from server. Check backend terminal.");
      } else {
        // Something happened in setting up the request that triggered an Error
        alert("[DEBUG] Error: " + err.message);
      }
    }
  };

  const openCartPanel = () => setCartPanelOpen(true);
  const closeCartPanel = () => setCartPanelOpen(false);

  const removeFromCart = async (reelId, platform) => {
    try {
      await api.delete('/cart/remove', { data: { reelId, platform } });
      fetchCart();
    } catch (err) { console.error(err); }
  };

  const increaseQuantity = async (reelId, platform) => {
    const item = cartItems.find(i => i.reelId === reelId && i.platform === platform);
    if (!item) return;
    try {
      await api.patch('/cart/update', { reelId, platform, quantity: item.quantity + 1 });
      fetchCart();
    } catch (err) { console.error(err); }
  };

  const decreaseQuantity = async (reelId, platform) => {
    const item = cartItems.find(i => i.reelId === reelId && i.platform === platform);
    if (!item || item.quantity <= 1) return;
    try {
      await api.patch('/cart/update', { reelId, platform, quantity: item.quantity - 1 });
      fetchCart();
    } catch (err) { console.error(err); }
  };

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price || item.totalPrice || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,

        /* actions */
        fetchCart,
        addToCart,
        addToCartFromReel,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,

        /* totals */
        totalQuantity,
        totalPrice,

        /* 🔑 CART VISIBILITY (FIX) */
        cartPanelOpen,
        isCartOpen: cartPanelOpen, // 👈 IMPORTANT
        openCartPanel,
        closeCartPanel,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
