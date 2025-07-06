"use client";

// React hook for state management
import { useState } from "react";

export default function ForgotPasswordPage() {
  // Step state controls whether we're in "send OTP" or "verify OTP" step
  const [step, setStep] = useState<"send" | "verify">("send");

  // Form fields for input
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback and UI state
  const [message, setMessage] = useState(""); // Success message
  const [error, setError] = useState("");     // Error message
  const [loading, setLoading] = useState(false); // Loading spinner flag

 
  //  Send OTP Handler
 
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }), // Send phone number to backend
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setMessage("OTP sent successfully.");
      setStep("verify"); 
    } catch (err: any) {
      setError(err.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

 
  //Verify OTP & Reset Password
 
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // Check if new password and confirm match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // First: Verify OTP
      const verifyRes = await fetch("http://localhost:3001/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.message || "Invalid OTP");
      }

      // Second: Reset password
      const resetRes = await fetch("http://localhost:3001/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, newPassword }),
      });

      const resetData = await resetRes.json();

      if (!resetRes.ok) {
        throw new Error(resetData.message || "Password reset failed");
      }

      // Reset all state and notify user
      setMessage("Password reset successfully!");
      setStep("send");
      setPhoneNumber("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Error verifying OTP or resetting password");
    } finally {
      setLoading(false);
    }
  };

  // JSX: UI Rendering Based on Step

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-orange-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-pink-600 text-center">
          Forgot Password
        </h2>

        {/* Success or error messages */}
        {message && (
          <p className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">
            {message}
          </p>
        )}
        {error && (
          <p className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </p>
        )}

        {/* ===== Step 1: Send OTP Form ===== */}
        {step === "send" ? (
          <form onSubmit={handleSendOtp}>
            <label className="block mb-2 text-gray-700">Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="Enter your phone number"
              className="w-full border border-gray-300 rounded px-4 py-2 mb-6"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          /*  Verify OTP and Reset Password Form */
          <form onSubmit={handleVerifyOtp}>
            <label className="block mb-2 text-gray-700">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Enter the OTP"
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
            />

            <label className="block mb-2 text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
            />

            <label className="block mb-2 text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              className="w-full border border-gray-300 rounded px-4 py-2 mb-6"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              {loading ? "Verifying..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
