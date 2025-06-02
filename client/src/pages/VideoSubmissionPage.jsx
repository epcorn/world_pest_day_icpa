import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Keep navigate in case it's used elsewhere for routing, though not in this specific logic.

export default function VideoSubmissionPage() {
    const [videoFile, setVideoFile] = useState(null);
    const [userVideo, setUserVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);

    // This is a placeholder for the navigate hook, as it's imported but not directly used in the provided logic snippet.
    // If you plan to redirect users away from this page based on certain conditions, you'd use it here.
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserVideo = async () => {
            try {
                const email = localStorage.getItem('userEmail');
                if (!email) {
                    setError('Oops! No user email found. Please head back to the landing page and register again. 😔');
                    // Optionally redirect to landing page if no email
                    // navigate('/');
                    return;
                }
                const res = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/users/video?email=${encodeURIComponent(email)}`);
                setUserVideo(res.data);
                console.log(res.data); // This will now show the Cloudinary URL and publicId
            } catch (err) {
                console.error('Error fetching user video:', err.response?.data || err.message);
                setError('Failed to load your video data. Please refresh or try again later. 🚧');
            } finally {
                setLoading(false);
            }
        };
        fetchUserVideo();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            setError('');
        } else {
            setError('Please select a valid video file! 🎥');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) {
            setError('Please select a video file before submitting! 👆');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('video', videoFile); // 'video' matches the field name in multer setup on backend

        try {
            const email = localStorage.getItem('userEmail');
            if (!email) {
                setError('No user email found. Please register again. 😞');
                return;
            }
            // Send the video file to your backend /api/upload endpoint
            const res = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/api/upload?email=${encodeURIComponent(email)}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUserVideo(res.data); // Backend will send back the user object with new Cloudinary videoUrl and publicId
            setVideoFile(null); // Clear selected file after successful upload
            alert('Video uploaded successfully! We\'ll review it soon. 🎉'); // Use a more exciting alert
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload video. Please try again. 😢');
            console.error('Upload error:', err.response?.data);
        } finally {
            setUploading(false);
        }
    };

    const themes = [
        'Safety Practices in Pest Management 🛡️',
        'Public Awareness & Education 💡',
        'Social Contributions by the Pest Control Industry 🤝',
        'Knowledge Sharing with Industry Peers 📚',
    ];

    const prizes = [
        'Showcased at Indiapest 2025 in Kathmandu! ✈️🏔️',
        'Couple pass for a scenic panoramic flight over Mount Everest! 🏞️🚁',
        'Featured on IPCA’s social media and website on World Pest Day! 🌐✨',
    ];

    const dos = [
        'Be creative and focus on pest control themes. 🎨',
        'Keep your video concise (max 2 minutes). ⏱️',
        'Ensure high-quality audio and visuals. 🎬🎤',
        'Highlight the importance of pest management. ✅',
    ];

    const donts = [
        'Do not use plagiarized videos. 🚫',
        'Do not use AI-generated videos. 🤖❌',
        'Do not mention any brand names or individual names. 🤫',
        'Avoid offensive or inappropriate content. 🛑',
    ];

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6 flex flex-col items-center justify-center overflow-hidden">
            {/* Background Gradient & Animated Blobs */}
            <div className="absolute inset-0 z-0 opacity-30">
                <div className="w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 absolute top-1/4 left-1/4 animate-blob"></div>
                <div className="w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 absolute bottom-1/4 right-1/4 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 drop-shadow-md leading-tight">
                        Share Your Vision for <br className="sm:hidden"/> <span className="text-green-700">World Pest Day!</span> 🌍
                    </h1>
                    <p className="mt-4 text-xl md:text-2xl text-gray-700 font-medium animate-pulse-fade">
                        Your chance to shine and win incredible prizes! ✨
                    </p>
                </header>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Video Themes Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <h2 className="text-3xl font-bold text-green-700 mb-6 flex items-center">
                            <span className="mr-3 text-4xl">💡</span> Video Themes
                        </h2>
                        <ul className="space-y-3 text-lg text-gray-700 list-none">
                            {themes.map((theme, idx) => (
                                <li key={idx} className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">●</span> {theme}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Prizes Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <h2 className="text-3xl font-bold text-blue-700 mb-6 flex items-center">
                            <span className="mr-3 text-4xl">🏆</span> Prizes for Top 3 Videos!
                        </h2>
                        <ul className="space-y-3 text-lg text-gray-700 list-none">
                            {prizes.map((prize, idx) => (
                                <li key={idx} className="flex items-start">
                                    <span className="text-blue-500 mr-2 mt-1">★</span> {prize}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Do's & Don'ts Card */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Guidelines</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-2xl font-bold text-green-600 mb-4 flex items-center">
                                    <span className="mr-2 text-3xl">👍</span> Do's
                                </h3>
                                <ul className="space-y-3 text-lg text-gray-700 list-none">
                                    {dos.map((item, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <span className="text-green-500 mr-2 mt-1">✔️</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                                    <span className="mr-2 text-3xl">👎</span> Don'ts
                                </h3>
                                <ul className="space-y-3 text-lg text-gray-700 list-none">
                                    {donts.map((item, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <span className="text-red-500 mr-2 mt-1">❌</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Video Upload Section */}
                    <div className="lg:col-span-2 bg-gradient-to-r from-teal-50 to-cyan-50 p-8 rounded-2xl shadow-xl border border-teal-200 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
                        <h2 className="text-3xl font-bold text-teal-700 mb-6 text-center flex items-center justify-center">
                            <span className="mr-3 text-4xl">⬆️</span> Upload Your Masterpiece!
                        </h2>
                        {error && (
                            <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-medium border border-red-200 mb-4 animate-pulse-once">
                                {error}
                            </p>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <label htmlFor="video-upload" className="block text-gray-700 font-semibold mb-2 text-lg">
                                Select your video file (MP4, MOV, etc.)
                            </label>
                            <input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="block w-full text-lg text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                            />
                            {videoFile && (
                                <p className="text-gray-600 text-sm mt-2">
                                    Selected file: <span className="font-medium text-teal-700">{videoFile.name}</span>
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={uploading}
                                className={`w-full bg-gradient-to-r from-teal-600 to-cyan-700 text-white p-3 rounded-lg font-bold text-xl shadow-md hover:from-teal-700 hover:to-cyan-800 transition duration-300 ease-in-out transform hover:-translate-y-1 ${
                                    uploading ? 'opacity-60 cursor-not-allowed' : ''
                                }`}
                            >
                                {uploading ? 'Uploading... please wait! ⏳' : 'Submit Video Now! 🚀'}
                            </button>
                            <p className="text-gray-600 text-sm mt-4 font-medium text-center">
                                Note: Your submission will be valid only after email verification. Check your inbox! 📧
                            </p>
                        </form>
                    </div>

                    {/* User Submission Display */}
                    {loading ? (
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl text-center flex flex-col items-center justify-center py-16">
                            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16 mb-4"></div>
                            <p className="text-gray-600 text-xl font-medium">Loading your video submission... 🔄</p>
                        </div>
                    ) : userVideo ? (
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl border border-purple-200">
                            <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center flex items-center justify-center">
                                <span className="mr-3 text-4xl">🎬</span> Your Awesome Submission!
                            </h2>
                            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                                <div className="rounded-lg overflow-hidden border border-gray-300 shadow-md w-full md:w-1/2 flex-shrink-0">
                                    <video
                                        src={userVideo.videoUrl} // MODIFIED LINE HERE
                                        controls
                                        className="w-full h-auto object-cover"
                                        title="Your Submitted Video"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                <div className="flex-grow text-lg text-gray-700 space-y-3">
                                    <p><strong>Uploader:</strong> <span className="font-medium text-gray-900">{userVideo.name}</span></p>
                                    <p><strong>Company:</strong> <span className="font-medium text-gray-900">{userVideo.companyName || 'N/A'}</span></p>
                                    <p className="flex items-center">
                                        <strong>Status:</strong> &nbsp;
                                        <span className={`font-semibold ${userVideo.isVerified ? 'text-green-600' : 'text-orange-600'}`}>
                                            {userVideo.isVerified ? 'Verified! 🎉' : 'Pending Review ⏳'}
                                        </span>
                                    </p>
                                    <p className="text-gray-500 text-sm italic mt-4">
                                        Thank you for your contribution! We appreciate your patience while we review your video.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl text-center py-16">
                            <p className="text-gray-600 text-xl font-medium">
                                It looks like you haven't submitted a video yet. Let's change that! ✨
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="mt-16 text-center text-gray-600 text-sm opacity-80">
                    &copy; {new Date().getFullYear()} Indian Pest Control Association. All rights reserved.
                </footer>
            </div>

            {/* Global CSS for animations (consider moving to App.css or a dedicated style file) */}
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

                @keyframes pulse-fade {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-pulse-fade {
                    animation: pulse-fade 1s ease-out forwards;
                }

                @keyframes pulse-once {
                    0% { opacity: 0; transform: scale(0.9); }
                    50% { opacity: 1; transform: scale(1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-pulse-once {
                    animation: pulse-once 1.5s forwards;
                }

                /* Basic Loader Styling */
                .loader {
                    border-top-color: #3498db;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}