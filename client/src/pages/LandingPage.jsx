import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';

// Array of provided image URLs for the slider
const bannerImages = [
  'https://res.cloudinary.com/dbzucdgf0/image/upload/v1748863391/ChatGPT_Image_Jun_2_2025_04_52_08_PM_ezkvai.png',
  'https://res.cloudinary.com/dbzucdgf0/image/upload/v1748865050/ChatGPT_Image_Jun_2_2025_05_20_37_PM_gothn9.png',
  'https://res.cloudinary.com/dbzucdgf0/image/upload/v1748863746/ChatGPT_Image_Jun_2_2025_04_58_51_PM_j82oex.png',
];

const LandingPage = () => {
  console.log('API Base URL:', import.meta.env.VITE_APP_API_BASE_URL);

  const [formData, setFormData] = useState({
    annotation: 'Mr',
    name: '',
    companyName: '',
    email: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(false);
  const [mainFormError, setMainFormError] = useState('');
  const [statusCheckError, setStatusCheckError] = useState('');
  const [existingUser, setExistingUser] = useState(null);
  const navigate = useNavigate();

  const [showStatusCheckForm, setShowStatusCheckForm] = useState(false);
  const [statusCheckEmail, setStatusCheckEmail] = useState('');
  const [statusCheckPasscode, setStatusCheckPasscode] = useState('');

  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [showCustomAlert, setShowCustomAlert] = useState(false);

  // State for the image slider
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // IPCA Logo URL for this page
  const WorldPestDay = 'https://res.cloudinary.com/dbzucdgf0/image/upload/v1748861419/wpd_logo_gobnep.png';

  const showMessage = (message) => {
    setCustomAlertMessage(message);
    setShowCustomAlert(true);
    setTimeout(() => {
      setShowCustomAlert(false);
      setCustomAlertMessage('');
    }, 5000);
  };

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
    // Apply main-content-fade animation to the slogan only
    gsap.fromTo(
      '.main-slogan-fade', // Changed selector
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 1.5, ease: 'power2.out' }
    );
    // Animation for the slider images
    gsap.fromTo(
      '.slider-image',
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' }
    );
  }, [currentImageIndex]);

  // Slider effect: Change image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMainFormError('');
  };

  const handleStatusCheckChange = (e) => {
    if (e.target.name === 'statusCheckEmail') {
      setStatusCheckEmail(e.target.value);
    } else if (e.target.name === 'statusCheckPasscode') {
      setStatusCheckPasscode(e.target.value);
    }
    setStatusCheckError('');
  };

  const validateMainForm = ({ name, email, mobile }) => {
    if (!name.trim()) return 'Name is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (!mobile.trim()) return 'Mobile number is required';
    return '';
  };

  const handleSubmitMainForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMainFormError('');
    setExistingUser(null);

    const { annotation, name, companyName, email, mobile } = formData;
    const validationError = validateMainForm({ name, email, mobile });
    if (validationError) {
      setMainFormError(validationError);
      setLoading(false);
      return;
    }

    const payload = { annotation, name, companyName, email, mobile };

    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/api/users/register`, payload);

      showMessage(response.data.message);

      localStorage.setItem('userEmail', email);
      localStorage.setItem('isVerified', 'false');
      navigate('/video-submission');

    } catch (err) {
      console.error('Registration/Check error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to submit form. Please try again.';
      setMainFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStatusCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusCheckError('');
    setExistingUser(null);

    if (!statusCheckEmail.trim() || !statusCheckPasscode.trim()) {
      setStatusCheckError('Email and 6-digit passcode are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/api/users/check`, {
        email: statusCheckEmail,
        passcode: statusCheckPasscode
      });
      const user = response.data;

      setExistingUser(user);
      setShowStatusCheckForm(false);

      localStorage.setItem('userEmail', statusCheckEmail);
      localStorage.setItem('isVerified', user.isVerified ? 'true' : 'false');

    } catch (err) {
      console.error('Status Check Error:', err);
      setStatusCheckError(err.response?.data?.message || 'Failed to check status. Please check your email and passcode.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatusCheckForm = () => {
    setShowStatusCheckForm(prev => !prev);
    setMainFormError('');
    setStatusCheckError('');
    setExistingUser(null);
    setFormData({
      annotation: 'Mr',
      name: '',
      companyName: '',
      email: '',
      mobile: '',
    });
    setStatusCheckEmail('');
    setStatusCheckPasscode('');
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-blue-100 overflow-hidden">
      {/* Animated Banner for Prizing with Sliding Images */}
      <div
        className="relative w-full max-w-6xl h-64 md:h-80 lg:h-96 bg-cover bg-center rounded-2xl shadow-xl overflow-hidden flex items-center justify-center animate-fade-in-up mb-8 md:mb-12"
      >
        {/* Sliding Images */}
        <div className="absolute inset-0">
          {bannerImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Banner ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover slider-image transition-opacity duration-1000 ease-in-out ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/1200x400/138808/FFFFFF?text=Image+Not+Found';
              }}
            />
          ))}
        </div>
        {/* Overlay and Text */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-4 sm:p-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg animate-scale-in">
            Submit Your Videos & Win Amazing Prizes!
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mt-2 sm:mt-4 text-white max-w-2xl animate-fade-in delay-200">
            Showcase your contributions to public health and earn recognition.
          </p>
          <Link
            to="/prizing"
            className="mt-4 sm:mt-8 px-6 py-2 sm:px-8 sm:py-3 bg-yellow-400 text-blue-900 font-bold text-base sm:text-xl rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-300"
          >
            View Prizes & Recognition
          </Link>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center mb-8 md:mb-16 px-4">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 leading-tight flex flex-col sm:flex-row justify-center items-center space-x-0 sm:space-x-8">
          <img
            src={WorldPestDay}
            alt="IPCA Logo"
            className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full border-4 border-blue-200 shadow-lg flex-shrink-0 mb-4 sm:mb-0 sm:mr-4"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/003366/FFFFFF?text=IPCA"; }}
          />
          <span className="worlds-text text-green-700 drop-shadow-lg mb-2 sm:mb-0">World</span>
          <span className="pestday-text text-blue-700 drop-shadow-lg">Pest Day 2025</span>
        </h1>
        <p className="text-lg md:text-xl lg:text-3xl text-gray-700 font-semibold mt-4 tracking-wide main-slogan-fade px-2"> {/* Changed class here */}
          Come celebrate with us and win exciting rewards!
        </p>
      </div>

      <div className="relative z-10 bg-white bg-opacity-95 p-6 md:p-12 rounded-xl shadow-2xl ring-4 ring-green-300 ring-opacity-50 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out w-11/12 max-w-md mx-auto">
        {showCustomAlert && (
          <div className="bg-blue-100 text-blue-700 p-3 rounded-lg text-center font-medium border border-blue-200 mb-6 animate-pulse-once">
            {customAlertMessage}
          </div>
        )}

        {existingUser ? (
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-200">Your Submitted Video</h2>
            <div className="text-left space-y-2 text-base sm:text-lg text-gray-700">
              <p><strong>Name:</strong> <span className="font-medium text-gray-900">{existingUser.name}</span></p>
              <p><strong>Company:</strong> <span className="font-medium text-gray-900">{existingUser.companyName || 'N/A'}</span></p>
              <p><strong>Mobile:</strong> <span className="font-medium text-gray-900">{existingUser.mobile}</span></p>
            </div>
            {existingUser.videoUrl ? (
              <>
                <div className="mt-6 sm:mt-8 rounded-lg overflow-hidden border border-gray-300 shadow-md">
                  <video
                    controls
                    src={existingUser.videoUrl}
                    className="w-full h-auto object-cover"
                  />
                </div>
                {existingUser.isApproved ? (
                  <p className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-green-600">
                    Your video has been approved! 🎉
                    {existingUser.approvedAt && (
                      <span className="block text-sm sm:text-lg font-medium text-green-700 mt-1">
                        Approved on: {new Date(existingUser.approvedAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-yellow-600">
                    Your video is pending approval.⏳
                  </p>
                )}
              </>
            ) : (
              <p className="mt-4 sm:mt-6 text-lg sm:text-xl font-bold text-red-600">
                No video submitted yet. Please submit your video!
                <button
                  onClick={() => navigate('/video-submission')}
                  className="block mx-auto mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                >
                  Go to Video Submission
                </button>
              </p>
            )}
            <p className={`mt-2 text-sm sm:text-md font-semibold ${existingUser.isVerified ? 'text-blue-600' : 'text-red-600'}`}>
              {existingUser.isVerified ? 'Email is verified.' : 'Email is not yet verified. Please check your inbox!'}
            </p>
            <button
              onClick={toggleStatusCheckForm}
              className="mt-6 sm:mt-8 text-blue-600 hover:text-blue-800 font-semibold transition duration-200"
            >
              Go Back / Register New
            </button>
          </div>
        ) : (
          <>
            {showStatusCheckForm ? (
              <form onSubmit={handleSubmitStatusCheck} className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
                  Check Video Status
                </h2>

                {statusCheckError && (
                  <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-medium border border-red-200 animate-pulse-once text-sm sm:text-base">
                    {statusCheckError}
                  </p>
                )}

                <div className="relative">
                  <label htmlFor="statusCheckEmail" className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Email Address<span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    id="statusCheckEmail"
                    name="statusCheckEmail"
                    value={statusCheckEmail}
                    onChange={handleStatusCheckChange}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 text-sm sm:text-base"
                    required
                    placeholder="Enter your email..."
                  />
                </div>

                <div className="relative">
                  <label htmlFor="statusCheckPasscode" className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">6-Digit Passcode<span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="statusCheckPasscode"
                    name="statusCheckPasscode"
                    value={statusCheckPasscode}
                    onChange={handleStatusCheckChange}
                    maxLength="6"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 text-sm sm:text-base"
                    required
                    placeholder="Enter your 6-digit passcode..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-green-500 to-blue-600 text-white p-2 sm:p-3 rounded-lg font-bold text-base sm:text-lg shadow-md hover:from-green-600 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 ${
                    loading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Checking Status...' : 'Check Status'}
                </button>
                <button
                  type="button"
                  onClick={toggleStatusCheckForm}
                  className="w-full mt-3 sm:mt-4 text-blue-600 hover:text-blue-800 font-semibold transition duration-200 text-sm sm:text-base"
                >
                  Back to Registration
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitMainForm} className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
                  Join the Celebration
                </h2>

                {mainFormError && (
                  <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-medium border border-red-200 animate-pulse-once text-sm sm:text-base">
                    {mainFormError}
                  </p>
                )}

                <div className="relative">
                  <label htmlFor="annotation" className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Annotation</label>
                  <div className="relative">
                    <select
                      id="annotation"
                      name="annotation"
                      value={formData.annotation}
                      onChange={handleChange}
                      className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 sm:py-3 px-3 sm:px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition duration-200 text-sm sm:text-base"
                      required
                    >
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                      <option value="Dr.HC">Dr.HC</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.57 4.57.707.707z"/></svg>
                    </div>
                  </div>
                </div>

                {['name', 'companyName', 'email', 'mobile'].map((field) => (
                  <div key={field} className="relative">
                    <label htmlFor={field} className="block text-gray-700 font-semibold mb-1 sm:mb-2 capitalize text-sm sm:text-base">
                      {field === 'companyName' ? 'Company Name' : field === 'mobile' ? 'Mobile Number' : field}
                      {field !== 'companyName' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
                      id={field}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900 text-sm sm:text-base"
                      required={field !== 'companyName'}
                      placeholder={`Enter your ${field === 'companyName' ? 'company name' : field === 'mobile' ? 'mobile number' : field}...`}
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-green-500 to-blue-600 text-white p-2 sm:p-3 rounded-lg font-bold text-base sm:text-lg shadow-md hover:from-green-600 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 ${
                    loading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Registering...' : 'Register / Continue'}
                </button>
                <button
                  type="button"
                  onClick={toggleStatusCheckForm}
                  className="w-full mt-3 sm:mt-4 text-blue-600 hover:text-blue-800 font-semibold transition duration-200 text-sm sm:text-base"
                >
                  Already registered? Check the status of your video
                </button>
              </form>
            )}
          </>
        )}
      </div>

      <div className="relative z-10 mt-6 text-center text-gray-700 text-base sm:text-lg px-4">
        For any query contact <a href="mailto:webconnectipca@gmail.com" className="text-blue-600 hover:underline font-semibold">webconnectipca@gmail.com</a>
      </div>

      <div className="relative z-10 mt-12 sm:mt-16 text-gray-600 text-xs sm:text-sm opacity-80 text-center px-4">
        © {new Date().getFullYear()} Indian Pest Control Association. All rights reserved.
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite cubic-bezier(0.6, 0.4, 0.4, 0.8);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animate-pulse-once {
          animation: pulse-once 1.5s forwards;
        }
        @keyframes pulse-once {
          0% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.7s ease-out forwards;
        }
        .delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};

export default LandingPage;