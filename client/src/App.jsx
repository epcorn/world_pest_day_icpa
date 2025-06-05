import React, { useEffect } from 'react'; // Make sure useEffect is imported
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios'; // Make sure axios is imported

// Import your components from their new locations
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PrizingPage from './pages/PrizingPage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import VideoSubmissionPage from './pages/VideoSubmissionPage.jsx';

import './App.css'; // Assuming this imports your Tailwind CSS setup

function App() {
  // --- UNIQUE WEBSITE VISITOR TRACKING ---
  // This useEffect hook will run once when the App component mounts.
  // It sends a signal to your backend to record a unique visit.
  useEffect(() => {
    const trackPageVisit = async () => {
      try {
        // Ensure your VITE_APP_API_BASE_URL is correctly set in your .env file
        // (e.g., VITE_APP_API_BASE_URL=http://localhost:5000)
        await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/track-visit`);
        // console.log('Website visit tracked successfully.'); // For debugging, you can remove this
      } catch (err) {
        console.error('Failed to track website visit:', err);
        // Do not block the user experience if tracking fails
      }
    };

    trackPageVisit();
  }, []); // The empty dependency array ensures this runs only once on initial app load

  // --- END UNIQUE WEBSITE VISITOR TRACKING ---


  return (
    <Router>
      {/* The Navbar will appear on all pages */}
      <Navbar />
      <div className="container mx-auto mt-4 px-4"> {/* Basic container for page content */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/prizing" element={<PrizingPage />} />
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