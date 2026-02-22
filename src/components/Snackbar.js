import React from "react";

export default function Snackbar({ message, show }) {
  if (!show) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "30px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#323232",
          color: "white",
          padding: "12px 20px",
          borderRadius: "10px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          zIndex: 2000,
          fontSize: "14px",
          animation: "snackFadeUp 0.35s ease-out",
        }}
      >
        {message}
      </div>

      {/* Smooth animation */}
      <style>
        {`
          @keyframes snackFadeUp {
            0% {
              opacity: 0;
              transform: translate(-50%, 10px);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0px);
            }
          }
        `}
      </style>
    </>
  );
}
