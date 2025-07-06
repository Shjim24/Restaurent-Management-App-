"use client";

import { useState } from "react";

export default function ResetPasswordPage() {
  // State for token input, new password, messages, error, and loading indicator
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submission to reset password
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();      
    setError("");            
    setMessage("");          
    setLoading(true);        

    try {
      // Call reset-password API endpoint with token and new password
      const res = await fetch("http://localhost:3001/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Throw error if response is not ok
        throw new Error(data.message || "Reset failed");
      }

      // Show success message and clear inputs on success
      setMessage("Password reset successful! You can now log in.");
      setToken("");
      setNewPassword("");
    } catch (err: any) {
      // Show error message if reset fails
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);  // Hide loading state
    }
  };

  return (
    // Center the form on screen with background gradient
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-orange-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 text-pink-600 text-center">
          Reset Password
        </h2>

        {/* Show success message */}
        {message && (
          <p className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">
            {message}
          </p>
        )}

        {/* Show error message */}
        {error && (
          <p className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </p>
        )}

        {/* Form for entering reset token and new password */}
        <form onSubmit={handleReset}>
          {/* Reset Token input */}
          <label className="block mb-2 text-gray-700">Reset Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            placeholder="Enter reset token"
            className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
          />

          {/* New Password input */}
          <label className="block mb-2 text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Enter new password"
            className="w-full border border-gray-300 rounded px-4 py-2 mb-6"
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
