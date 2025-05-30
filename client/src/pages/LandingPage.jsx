import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

export default function LandingPage() {
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

    const { annotation, name, companyName, email, mobile } = formData;
    const validationError = validateForm({ name, email, mobile });
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const payload = { annotation, name, companyName, email, mobile };

    try {
      const response = await axios.post('http://localhost:5000/api/users/check', payload);
      const user = response.data;

      localStorage.setItem('userEmail', email);
      localStorage.setItem('isVerified', user.isVerified ? 'true' : 'false');

      if (
        normalize(user.name) === normalize(name) &&
        normalize(user.companyName) === normalize(companyName) &&
        normalize(user.mobile) === normalize(mobile) &&
        normalize(user.annotation) === normalize(annotation)
      ) 
      {
       
             console.log('User videoUrl:', user.videoUrl);  // <-- Log videoUrl here

        if (user.videoUrl) {
          setExistingUser(user);
        } else {
          navigate('/video-submission');
        }
      } else {
        setError('Details mismatch with our records.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        try {
          await axios.post('http://localhost:5000/api/users/register', payload);
          localStorage.setItem('userEmail', email);
          localStorage.setItem('isVerified', 'false');
          navigate('/video-submission');
        } catch (regErr) {
          setError(regErr.response?.data?.message || 'Failed to register new user.');
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
          <p><strong>Name:</strong> {existingUser.name}</p>
          <p><strong>Company:</strong> {existingUser.companyName}</p>
          <p><strong>Mobile:</strong> {existingUser.mobile}</p>
          <div className="mt-4">
<video
  controls
  src={`http://localhost:5000${existingUser.videoUrl}`}
  className="w-full rounded"
/>
          </div>
          <p className="mt-2 text-green-700 font-semibold">
            {existingUser.isVerified ? 'Your video is verified!' : 'Your video is pending verification.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Join the Celebration
          </h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Annotation</label>
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
            <div key={field} className="mb-4">
              <label className="block text-gray-700 mb-2 capitalize">{field.replace('Name', ' Name')}</label>
              <input
                type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                required={field !== 'companyName'}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-green-600 text-white p-2 rounded hover:bg-green-500 transition ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  );
}
