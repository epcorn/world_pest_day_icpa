// In frontend/src/App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

// Import your components
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PrizingPage from './pages/PrizingPage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import VideoSubmissionPage from './pages/VideoSubmissionPage.jsx';

import './App.css';

function App() {
  // --- UNIQUE WEBSITE VISITOR TRACKING (NOW COOKIE/LOCALSTORAGE-BASED) ---
  useEffect(() => {
    const trackWebsiteVisit = async () => {
      let visitorId = localStorage.getItem('visitorId');

      if (!visitorId) {
        // If no visitorId exists, generate a new one
        visitorId = uuidv4();
        localStorage.setItem('visitorId', visitorId);
        // console.log('Generated new visitorId:', visitorId);
      } else {
        // console.log('Using existing visitorId:', visitorId);
      }

      try {
        // Send a POST request with the visitorId
        // We're changing this to POST because we're sending data in the body
        await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/api/track-visit`, {
          visitorId: visitorId
        });
        // console.log('Website visit tracked successfully with visitorId.');
      } catch (err) {
        console.error('Failed to track website visit:', err);
      }
    };

    trackWebsiteVisit();
  }, []); // Empty dependency array ensures this runs only once on initial app load

  // --- END UNIQUE WEBSITE VISITOR TRACKING ---

  return (
    <Router>
      <Navbar />
      <div className="container mx-auto mt-4 px-4">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/prizing" element={<PrizingPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/video-submission" element={<VideoSubmissionPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<div className="text-center text-2xl mt-10">404: Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;