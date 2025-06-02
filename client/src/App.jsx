import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your components from their new locations
import Navbar from './components/Navbar.jsx'; // New Navbar component
import LandingPage from './pages/LandingPage.jsx'; // Your existing LandingPage
import PrizingPage from './pages/PrizingPage.jsx';   // Renamed from PricesPage to PrizingPage
import AboutUsPage from './pages/AboutUsPage.jsx'; // New About Us page
import AdminLogin from './pages/AdminLogin';       // Existing AdminLogin
import AdminDashboard from './pages/AdminDashboard'; // Existing AdminDashboard
import VideoSubmissionPage from './pages/VideoSubmissionPage.jsx'; // Existing VideoSubmissionPage

import './App.css'; // Assuming this imports your Tailwind CSS setup
// If you have App.css with specific styles, ensure it's still imported or merged into index.css

function App() {
  return (
    <Router>
      {/* The Navbar will appear on all pages */}
      <Navbar /> 
      <div className="container mx-auto mt-4 px-4"> {/* Basic container for page content */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/prizing" element={<PrizingPage />} /> {/* Route updated to /prizing */}
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/video-submission" element={<VideoSubmissionPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* Catch-all route for 404 Not Found */}
          <Route path="*" element={<div className="text-center text-2xl mt-10">404: Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
