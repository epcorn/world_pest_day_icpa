import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

export default function LandingPage() {
    console.log('API Base URL:', import.meta.env.VITE_APP_API_BASE_URL);

    const [formData, setFormData] = useState({
        annotation: 'Mr',
        name: '',
        companyName: '',
        email: '',
        mobile: '',
    });
    const [loading, setLoading] = useState(false);
    const [mainFormError, setMainFormError] = useState(''); // Specific error for main form
    const [statusCheckError, setStatusCheckError] = useState(''); // Specific error for status check form
    const [existingUser, setExistingUser] = useState(null); // Used to display video status
    const navigate = useNavigate();

    const [showStatusCheckForm, setShowStatusCheckForm] = useState(false);
    const [statusCheckEmail, setStatusCheckEmail] = useState('');
    const [statusCheckPasscode, setStatusCheckPasscode] = useState('');

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
        gsap.fromTo(
            '.main-content-fade',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, delay: 1.5, ease: 'power2.out' }
        );
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setMainFormError(''); // Clear error on change
    };

    const handleStatusCheckChange = (e) => {
        if (e.target.name === 'statusCheckEmail') {
            setStatusCheckEmail(e.target.value);
        } else if (e.target.name === 'statusCheckPasscode') {
            setStatusCheckPasscode(e.target.value);
        }
        setStatusCheckError(''); // Clear error on change
    };

    const validateMainForm = ({ name, email, mobile }) => {
        if (!name.trim()) return 'Name is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        if (!mobile.trim()) return 'Mobile number is required';
        return '';
    };

    // This function will now be primarily for REGISTERING new users
    // or informing existing users who try to register again.
    const handleSubmitMainForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMainFormError('');
        setExistingUser(null); // Clear any previously displayed user status

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

            // Response for registration
            alert(response.data.message); // This alert will contain the message about email + passcode
            
            // Assuming successful registration means user can now go to submission
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isVerified', 'false'); // New user is initially unverified
            navigate('/video-submission');

        } catch (err) {
            console.error('Registration/Check error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to submit form. Please try again.';
            setMainFormError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // This function handles the "Check Status" form
    const handleSubmitStatusCheck = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusCheckError('');
        setExistingUser(null); // Clear previous status

        if (!statusCheckEmail.trim() || !statusCheckPasscode.trim()) {
            setStatusCheckError('Email and 6-digit passcode are required.');
            setLoading(false);
            return;
        }

        try {
            // Call the /api/users/check endpoint with email and passcode
            const response = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/api/users/check`, {
                email: statusCheckEmail,
                passcode: statusCheckPasscode
            });
            const user = response.data; // This 'user' object will contain all required details including videoUrl

            setExistingUser(user); // Display the user's video and status
            setShowStatusCheckForm(false); // Hide the status check form

            // Update localStorage for potential navigation or future use if needed
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
        // Clear all relevant states when toggling between forms
        setMainFormError('');
        setStatusCheckError('');
        setExistingUser(null); // Hide displayed video status
        setFormData({ // Reset main form
            annotation: 'Mr',
            name: '',
            companyName: '',
            email: '',
            mobile: '',
        });
        setStatusCheckEmail(''); // Reset status check form
        setStatusCheckPasscode('');
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-blue-100 overflow-hidden">
            {/* Background elements for visual flair */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 absolute top-0 left-0 animate-blob"></div>
                <div className="w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 absolute bottom-0 right-0 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl text-center mb-10 md:mb-16">
                <h1 className="text-7xl md:text-8xl font-extrabold text-gray-900 leading-tight flex flex-col sm:flex-row justify-center items-center space-x-0 sm:space-x-8">
                    <span className="worlds-text text-green-700 drop-shadow-lg mb-2 sm:mb-0">World</span>
                    <span className="pestday-text text-blue-700 drop-shadow-lg">Pest Day</span>
                </h1>
                <p className="text-xl md:text-3xl text-gray-700 font-semibold mt-4 tracking-wide main-content-fade">
                    Come celebrate with us and win exciting rewards!
                </p>
            </div>

            <div className="relative z-10 main-content-fade bg-white bg-opacity-95 p-8 md:p-12 rounded-xl shadow-2xl ring-4 ring-green-300 ring-opacity-50 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out w-full max-w-md">
                {existingUser ? (
                    // Display user's video and status if `existingUser` is set
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-200">Your Submitted Video</h2>
                        <div className="text-left space-y-2 text-lg text-gray-700">
                            <p><strong>Name:</strong> <span className="font-medium text-gray-900">{existingUser.name}</span></p>
                            <p><strong>Company:</strong> <span className="font-medium text-gray-900">{existingUser.companyName || 'N/A'}</span></p>
                            <p><strong>Mobile:</strong> <span className="font-medium text-gray-900">{existingUser.mobile}</span></p>
                        </div>
                        {existingUser.videoUrl ? (
                            <>
                                <div className="mt-8 rounded-lg overflow-hidden border border-gray-300 shadow-md">
                                    <video
                                        controls
                                        src={existingUser.videoUrl} // Use Cloudinary URL directly
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                                {existingUser.isApproved ? (
                                    <p className="mt-6 text-xl font-bold text-green-600">
                                        Your video has been approved! 🎉
                                        {existingUser.approvedAt && (
                                            <span className="block text-lg font-medium text-green-700 mt-1">
                                                Approved on: {new Date(existingUser.approvedAt).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        )}
                                    </p>
                                ) : (
                                    <p className="mt-6 text-xl font-bold text-yellow-600">
                                        Your video is pending approval.⏳
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="mt-6 text-xl font-bold text-red-600">
                                No video submitted yet. Please submit your video!
                                <button
                                    onClick={() => navigate('/video-submission')}
                                    className="block mx-auto mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                                >
                                    Go to Video Submission
                                </button>
                            </p>
                        )}
                        {/* Display email verification status */}
                        <p className={`mt-2 text-md font-semibold ${existingUser.isVerified ? 'text-blue-600' : 'text-red-600'}`}>
                            {existingUser.isVerified ? 'Email is verified.' : 'Email is not yet verified. Please check your inbox!'}
                        </p>
                        {/* Option to go back to main form / toggle view */}
                        <button
                            onClick={toggleStatusCheckForm}
                            className="mt-8 text-blue-600 hover:text-blue-800 font-semibold transition duration-200"
                        >
                            Go Back / Register New
                        </button>
                    </div>
                ) : (
                    <>
                        {showStatusCheckForm ? (
                            // --- NEW STATUS CHECK FORM ---
                            <form onSubmit={handleSubmitStatusCheck} className="space-y-6">
                                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                                    Check Video Status
                                </h2>

                                {statusCheckError && (
                                    <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-medium border border-red-200 animate-pulse-once">
                                        {statusCheckError}
                                    </p>
                                )}

                                <div className="relative">
                                    <label htmlFor="statusCheckEmail" className="block text-gray-700 font-semibold mb-2">Email Address<span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        id="statusCheckEmail"
                                        name="statusCheckEmail"
                                        value={statusCheckEmail}
                                        onChange={handleStatusCheckChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900"
                                        required
                                        placeholder="Enter your email..."
                                    />
                                </div>

                                <div className="relative">
                                    <label htmlFor="statusCheckPasscode" className="block text-gray-700 font-semibold mb-2">6-Digit Passcode<span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        id="statusCheckPasscode"
                                        name="statusCheckPasscode"
                                        value={statusCheckPasscode}
                                        onChange={handleStatusCheckChange}
                                        maxLength="6"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900"
                                        required
                                        placeholder="Enter your 6-digit passcode..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-gradient-to-r from-green-500 to-blue-600 text-white p-3 rounded-lg font-bold text-lg shadow-md hover:from-green-600 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 ${
                                        loading ? 'opacity-60 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? 'Checking Status...' : 'Check Status'}
                                </button>
                                <button
                                    type="button"
                                    onClick={toggleStatusCheckForm}
                                    className="w-full mt-4 text-blue-600 hover:text-blue-800 font-semibold transition duration-200"
                                >
                                    Back to Registration
                                </button>
                            </form>
                        ) : (
                            // --- EXISTING MAIN REGISTRATION FORM ---
                            <form onSubmit={handleSubmitMainForm} className="space-y-6">
                                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                                    Join the Celebration
                                </h2>

                                {mainFormError && (
                                    <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-medium border border-red-200 animate-pulse-once">
                                        {mainFormError}
                                    </p>
                                )}

                                <div className="relative">
                                    <label htmlFor="annotation" className="block text-gray-700 font-semibold mb-2">Annotation</label>
                                    <div className="relative">
                                        <select
                                            id="annotation"
                                            name="annotation"
                                            value={formData.annotation}
                                            onChange={handleChange}
                                            className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-900 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition duration-200"
                                            required
                                        >
                                            <option value="Mr">Mr</option>
                                            <option value="Ms">Ms</option>
                                            <option value="Dr">Dr</option>
                                            <option value="Dr.HC">Dr.HC</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                            <svg className="fill-current h-4 w-4" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.57 4.57.707.707z"/></svg>
                                        </div>
                                    </div>
                                </div>

                                {['name', 'companyName', 'email', 'mobile'].map((field) => (
                                    <div key={field} className="relative">
                                        <label htmlFor={field} className="block text-gray-700 font-semibold mb-2 capitalize">
                                            {field === 'companyName' ? 'Company Name' : field === 'mobile' ? 'Mobile Number' : field}
                                            {field !== 'companyName' && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type={field === 'email' ? 'email' : field === 'mobile' ? 'tel' : 'text'}
                                            id={field}
                                            name={field}
                                            value={formData[field]}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 text-gray-900"
                                            required={field !== 'companyName'}
                                            placeholder={`Enter your ${field === 'companyName' ? 'company name' : field === 'mobile' ? 'mobile number' : field}...`}
                                        />
                                    </div>
                                ))}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full bg-gradient-to-r from-green-500 to-blue-600 text-white p-3 rounded-lg font-bold text-lg shadow-md hover:from-green-600 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 ${
                                        loading ? 'opacity-60 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {loading ? 'Registering...' : 'Register / Continue'}
                                </button>
                                {/* --- NEW BUTTON FOR STATUS CHECK --- */}
                                <button
                                    type="button"
                                    onClick={toggleStatusCheckForm}
                                    className="w-full mt-4 text-blue-600 hover:text-blue-800 font-semibold transition duration-200"
                                >
                                    Already registered? Check the status of your video
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>

            {/* A simple footer for balance */}
            <div className="relative z-10 mt-16 text-gray-600 text-sm opacity-80">
                &copy; {new Date().getFullYear()} Indian Pest Control Association. All rights reserved.
            </div>

            {/* Basic CSS for the blob animation (can be in App.css or a separate style block) */}
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
            `}</style>
        </div>
    );
}