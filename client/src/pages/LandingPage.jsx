import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

export default function LandingPage() {
  const API_BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;
  
  // Debug environment variables
  useEffect(() => {
    console.log('Current Environment:', {
      API_BASE_URL,
      NODE_ENV: import.meta.env.MODE
    });
  }, []);

  const [formData, setFormData] = useState({
    annotation: 'Mr',
    name: '',
    companyName: '',
    email: '',
    mobile: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingUser, setExistingUser] = useState(null);
  const navigate = useNavigate();

  // GSAP animations
  useEffect(() => {
    gsap.fromTo(
      '.worlds-text',
      { x: '-100vw', rotateY: -90, opacity: 0 },
      { x: 0, rotateY: 0, opacity: 1, duration: 1.5, ease: 'power2.out' }
    );
    gsap.fromTo(
      '.pestday-text',
      { x: '100vw', rotateY: 90, opacity: 0 },
      { x: 0, rotateY: 0, opacity: 1, duration: 1.5, ease: 'power2.out', delay: 0.5 }
    );
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = ({ name, email, mobile }) => {
    if (!name.trim()) return 'Username is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (!mobile.trim()) return 'Mobile number is required';
    return '';
  };

  const normalize = (str) => (str || '').trim().toLowerCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setExistingUser(null);

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to check user at:', `${API_BASE_URL}/api/users/check`);
      
      // 1. First try checking user existence
      const checkResponse = await axios.post(
        `${API_BASE_URL}/api/users/check`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      const user = checkResponse.data;
      console.log('User check response:', user);

      // Store user data
      localStorage.setItem('userData', JSON.stringify({
        email: formData.email,
        isVerified: user.isVerified
      }));

      // Compare normalized data
      if (
        normalize(user.name) === normalize(formData.name) &&
        normalize(user.companyName) === normalize(formData.companyName) &&
        normalize(user.mobile) === normalize(formData.mobile) &&
        normalize(user.annotation) === normalize(formData.annotation)
      ) {
        if (user.videoUrl) {
          setExistingUser(user);
        } else {
          navigate('/video-submission');
        }
      } else {
        setError('Details mismatch with our records.');
      }

    } catch (err) {
      console.error('API Error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });

      // Handle 404 - User not found
      if (err.response?.status === 404) {
        try {
          console.log('Attempting to register new user at:', `${API_BASE_URL}/api/users/register`);
          
          const registerResponse = await axios.post(
            `${API_BASE_URL}/api/users/register`,
            formData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );

          localStorage.setItem('userData', JSON.stringify({
            email: formData.email,
            isVerified: false
          }));

          navigate('/video-submission');
        } catch (regErr) {
          setError(regErr.response?.data?.message || 'Registration failed. Please try again.');
        }
      } else {
        setError(err.response?.data?.message || 'Failed to submit form. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-green-800 flex justify-center space-x-4">
          <span className="worlds-text">World's</span>
          <span className="pestday-text">Pest Day</span>
        </h1>
        <p className="text-2xl text-gray-700 mt-4">
          Come celebrate with us and win exciting rewards!
        </p>
      </div>

      {existingUser ? (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">Your Submitted Video</h2>
          <div className="space-y-2 mb-4">
            <p><strong>Name:</strong> {existingUser.name}</p>
            <p><strong>Company:</strong> {existingUser.companyName}</p>
            <p><strong>Mobile:</strong> {existingUser.mobile}</p>
          </div>
          <div className="mt-4">
            <video
              controls
              src={`${API_BASE_URL}${existingUser.videoUrl}`}
              className="w-full rounded"
              onError={(e) => {
                console.error('Video load error:', e);
                setError('Failed to load video. Please try again later.');
              }}
            />
          </div>
          <p className={`mt-4 text-center font-semibold ${
            existingUser.isVerified ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {existingUser.isVerified 
              ? '✓ Your video is verified!' 
              : 'Your video is pending verification.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Join the Celebration
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Title</label>
              <select
                name="annotation"
                value={formData.annotation}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="Mr">Mr</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
                <option value="Dr.HC">Dr.HC</option>
              </select>
            </div>

            {['name', 'companyName', 'email', 'mobile'].map((field) => (
              <div key={field}>
                <label className="block text-gray-700 mb-2 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required={field !== 'companyName'}
                  placeholder={`Enter your ${field.replace('Name', ' Name')}`}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
}