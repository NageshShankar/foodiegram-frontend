import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from backend/localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /* ======================================================
       LOGIN
     ====================================================== */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedInUser, nextStep } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return { success: true, nextStep };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  /* ======================================================
       REGISTER
     ====================================================== */
  /* ======================================================
       REGISTER
     ====================================================== */
  /* ======================================================
       REGISTER
     ====================================================== */
  const register = async (fullName, email, username, password, confirmPassword, role) => {
    try {
      const payload = { fullName, email, username, password, confirmPassword, role };
      const response = await api.post('/auth/register', payload);

      if (response.data.status === 'pending') {
        return { success: true, pending: true, email: response.data.email };
      }

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed"
      };
    }
  };

  /* ======================================================
     LOGOUT
   ====================================================== */
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  /* ======================================================
       GOOGLE LOGIN
     ====================================================== */
  const googleLogin = async (credential) => {
    try {
      const response = await api.post('/auth/google', { credential });
      const { token, user: loggedInUser, nextStep } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      return { success: true, nextStep };
    } catch (error) {
      console.error("Google Login error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Google Login failed",
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to send reset email",
      };
    }
  };

  const verifyRegistrationOTP = async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      const { token, user: newUser, nextStep } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);

      return { success: true, nextStep };
    } catch (error) {
      console.error("OTP Verification error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "OTP Verification failed",
      };
    }
  };


  const resetPassword = async (token, password) => {
    try {
      await api.post('/auth/reset-password', { token, password });
      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to reset password",
      };
    }
  };


  const value = {
    user,
    isLoggedIn: !!user,
    loading,
    login,
    register,
    verifyRegistrationOTP,
    googleLogin,
    forgotPassword,
    resetPassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
