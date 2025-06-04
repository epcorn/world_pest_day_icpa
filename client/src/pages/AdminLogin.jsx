import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/api/admin/login`, { email, password });
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      // More specific error message for invalid credentials
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
      console.error("Admin Login Error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-200 animate-fade-in-up"
      >
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 sm:mb-8 text-center text-gray-800">
          Admin Login
        </h2>
        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm sm:text-base mb-4 text-center border border-red-200 animate-pulse-once">
            {error}
          </p>
        )}
        <div className="mb-4 sm:mb-5">
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 sm:p-3.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-base sm:text-lg"
            required
            autoComplete="username" // Helps browser autofill
          />
        </div>
        <div className="mb-6 sm:mb-8">
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 sm:p-3.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-base sm:text-lg"
            required
            autoComplete="current-password" // Helps browser autofill
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-3 sm:p-3.5 rounded-lg font-bold text-lg sm:text-xl shadow-md hover:from-blue-700 hover:to-indigo-800 transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Login
        </button>
      </form>

      {/* Global CSS for animations (consider moving to App.css or a dedicated style file) */}
      <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInScale 0.7s ease-out forwards;
        }

        @keyframes pulse-once {
          0% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-pulse-once {
          animation: pulse-once 1.5s forwards;
        }
      `}</style>
    </div>
  );
}