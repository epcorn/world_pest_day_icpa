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
    const [error, setError] = useState('');
    const [existingUser, setExistingUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Existing GSAP animations for the title
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

        // Optional: Add a subtle fade-in for the main content after title
        gsap.fromTo(
            '.main-content-fade',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, delay: 1.5, ease: 'power2.out' }
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
        console.log('Submitting to:', `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/check`);

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
            const response = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/api/users/check`, payload);
            const user = response.data;

            localStorage.setItem('userEmail', email);
            localStorage.setItem('isVerified', user.isVerified ? 'true' : 'false');

            if (
                normalize(user.name) === normalize(name) &&
                normalize(user.companyName) === normalize(companyName) &&
                normalize(user.mobile) === normalize(mobile) &&
                normalize(user.annotation) === normalize(annotation)
            ) {
                console.log('User videoUrl:', user.videoUrl);

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
                    await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/api/users/register`, payload);
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
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4 border-gray-200">Your Submitted Video</h2>
                        <div className="text-left space-y-2 text-lg text-gray-700">
                            <p><strong>Name:</strong> <span className="font-medium text-gray-900">{existingUser.name}</span></p>
                            <p><strong>Company:</strong> <span className="font-medium text-gray-900">{existingUser.companyName || 'N/A'}</span></p>
                            <p><strong>Mobile:</strong> <span className="font-medium text-gray-900">{existingUser.mobile}</span></p>
                        </div>
                        <div className="mt-8 rounded-lg overflow-hidden border border-gray-300 shadow-md">
                            <video
                                controls
                                src={`${import.meta.env.VITE_APP_API_BASE_URL}${existingUser.videoUrl}`}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <p className={`mt-6 text-xl font-bold ${existingUser.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                            {existingUser.isVerified ? 'Your video is verified! 🎉' : 'Your video is pending verification.⏳'}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            Join the Celebration
                        </h2>

                        {error && (
                            <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-medium border border-red-200 animate-pulse-once">
                                {error}
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
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.57 4.57.707.707z"/></svg>
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
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                )}
            </div>

            {/* A simple footer for balance */}
            <div className="relative z-10 mt-16 text-gray-600 text-sm opacity-80">
                &copy; {new Date().getFullYear()} World Pest Day. All rights reserved.
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