import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CartProvider, CartContext } from "./context/CartContext";
import { LikeProvider } from "./context/LikeContext";
import { CommentProvider } from "./context/CommentContext";
import { FollowProvider } from "./context/FollowContext";
import { SearchProvider } from "./context/SearchContext";
import { SavedProvider } from "./context/SavedContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage/HomePage";
import SavedPage from "./pages/SavedPage";
import SearchPage from "./components/SearchPage/SearchPage";
import CheckoutPage from "./pages/CheckoutPage";
import PriceComparison from "./pages/PriceComparison";
import CartPage from "./pages/CartPage";

// Creator pages
import CreatorUploadPage from "./pages/CreatorUploadPage";
import CreatorProfilePage from "./pages/CreatorProfilePage";
import SetupRestaurantPage from "./pages/SetupRestaurantPage";
import PosSetupPage from "./pages/PosSetupPage";
import VerificationPendingPage from "./pages/VerificationPendingPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import CartPanel from "./components/CartPanel";
import ProfileRedirect from "./components/ProfileRedirect";
import "./styles/global.css";


const CartPanelWrapper = () => {
  const { cartPanelOpen, closeCartPanel } = useContext(CartContext);
  return <CartPanel isOpen={cartPanelOpen} onClose={closeCartPanel} />;
};

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <AuthProvider>
        <SearchProvider>
          <CartProvider>
            <LikeProvider>
              <CommentProvider>
                <FollowProvider>
                  <SavedProvider>
                    <Router>
                      <Routes>
                        {/* Auth */}
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify-otp" element={<VerifyOtpPage />} />
                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                        {/* Main Feed — all authenticated users + unverified creators */}
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/saved" element={<SavedPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/compare" element={<PriceComparison />} />

                        {/* Creator onboarding */}
                        <Route path="/creator/setup-restaurant" element={<SetupRestaurantPage />} />
                        <Route path="/creator/verification-pending" element={<VerificationPendingPage />} />
                        <Route path="/pos-setup" element={<PosSetupPage />} />

                        {/* Profile Redirect */}
                        <Route path="/profile" element={<ProfileRedirect />} />

                        {/* Creator features */}
                        <Route path="/upload" element={<CreatorUploadPage />} />
                        <Route path="/creator/:id" element={<CreatorProfilePage />} />

                      </Routes>

                      <CartPanelWrapper />
                    </Router>
                  </SavedProvider>
                </FollowProvider>
              </CommentProvider>
            </LikeProvider>
          </CartProvider>
        </SearchProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
