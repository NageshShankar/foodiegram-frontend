import React from "react";

export default function Loader() {
  return (
    <>
      <div
        style={{
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#ffffff",
        }}
      >
        <div className="spinner"></div>
      </div>

      {/* Inline CSS for spinner */}
      <style>
        {`
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #eee;
            border-top-color: #ff7a2f;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}
