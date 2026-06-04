import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QuizPage from '../components/QuizPage';

export default function VideoSubmissionPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [userVideo, setUserVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserVideo = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
          setError('Oops! No user email found. Please head back to the landing page and register again. 😔');
          // navigate('/'); // Uncomment this line if you want to redirect
          return;
        }
        const res = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/users/video?email=${encodeURIComponent(email)}`);
        setUserVideo(res.data);
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
    } else if (file.type.startsWith('image/')) {
      setVideoFile(file);
      setError('');
    }
    else {
      setVideoFile(null); // Clear selected file if invalid
      setError('Please select a valid video file (e.g., MP4, MOV)! 🎥');
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
    formData.append('video', videoFile);
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setError('No user email found. Please register again. 😞');
        setUploading(false); // Ensure uploading state is reset
        return;
      }
      const res = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/api/upload?email=${encodeURIComponent(email)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
          // You could update a progress bar state here
        },
      });
      setUserVideo(res.data);
      setVideoFile(null);
      alert('your MasterPiece uploaded successfully! Please play a Quiz. 🎉');
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
    'Showcased at Indiapest 2026 in Kathmandu! ✈️🏔️',
    'Couple pass for a scenic panoramic flight over Mount Everest! 🏞️🚁',
    'Featured on IPCA’s social media and website on World Pest Day! 🌐✨',
    'Certificate of Participation from IPCA for all entries! 📜', // Added this line
  ];

  const dos = [
    'Be creative and focus on pest control themes. 🎨',
    'Keep your video concise (max 2 minutes). ⏱️',
    'Submit Photo in JPG, JPEG or PNG format 🖼️',
    'Ensure high-quality audio and visuals. 🎬🎤',
    'Highlight the importance of pest management. ✅',
  ];

  const donts = [
    'Do not use plagiarized videos & Photos. 🚫',
    'Do not use AI-generated videos & Photos. 🤖❌',
    'Do not mention any brand names or individual names. 🤫',
    'Avoid offensive or inappropriate content. 🛑',
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden">
      {/* Background Gradient & Animated Blobs */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="w-64 h-64 sm:w-80 sm:h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 absolute top-1/4 left-1/4 animate-blob"></div>
        <div className="w-64 h-64 sm:w-80 sm:h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 absolute bottom-1/4 right-1/4 animate-blob animation-delay-2000"></div>
      </div>

      <header className="text-center mb-10 md:mb-14 lg:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 drop-shadow-md leading-tight">
          Share Your Vision for <br className="sm:hidden" /> <span className="text-green-700">World Pest Day!</span> 🌍
        </h1>
        <p className="mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl text-gray-700 font-medium animate-pulse-fade max-w-3xl mx-auto">
          Your chance to shine and win incredible prizes! ✨
        </p>
      </header>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 xl:gap-2 h-fit">
          {/* Video Themes Card */}
          <div className="bg-white p-6 sm:py-8 rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-700 mb-5 flex items-center">
              <span className="mr-3 text-3xl sm:text-4xl">💡</span> Video Themes
            </h2>
            <ul className="space-y-2 sm:space-y-3 text-base sm:text-lg text-gray-700 list-none">
              {themes.map((theme, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">●</span> {theme}
                </li>
              ))}
            </ul>
          </div>

          {/* Prizes Card */}
          <div className="bg-white p-6 sm:py-8 rounded-2xl shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-5 flex items-center">
              <span className="mr-3 text-3xl sm:text-4xl">🏆</span> Prizes for Top 3 Videos!
            </h2>
            <ul className="space-y-2 sm:space-y-3 text-base sm:text-lg text-gray-700 list-none">
              {prizes.map((prize, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">★</span> {prize}
                </li>
              ))}
            </ul>
          </div>

          {/* Do's & Don'ts Card */}
          <div className="md:col-span-2 lg:col-span-1 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 text-center">Guidelines</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-green-600 mb-3 flex items-center">
                  <span className="mr-2 text-2xl sm:text-3xl">👍</span> Do's
                </h3>
                <ul className="space-y-2 text-base sm:text-lg text-gray-700 list-none">
                  {dos.map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✔️</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 md:mt-0">
                <h3 className="text-xl sm:text-2xl font-bold text-red-600 mb-3 flex items-center">
                  <span className="mr-2 text-2xl sm:text-3xl">👎</span> Don'ts
                </h3>
                <ul className="space-y-2 text-base sm:text-lg text-gray-700 list-none">
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
          <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-teal-50 to-cyan-50 p-6 sm:p-8 rounded-2xl shadow-xl border border-teal-200 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-teal-700 mb-6 text-center flex items-center justify-center">
              <span className="mr-3 text-3xl sm:text-4xl">⬆️</span> Upload Your Masterpiece!
            </h2>
            {error && (
              <p className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-medium border border-red-200 mb-4 animate-pulse-once text-sm sm:text-base">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <label
                htmlFor="video-upload"
                className="block text-gray-700 font-semibold mb-2 text-base sm:text-lg cursor-pointer"
              >
                Select your file <span className="text-sm font-normal text-gray-500">(Video max 100MB, or Image)</span>
              </label>

              <input
                id="video-upload"
                type="file"
                accept="video/*, image/*"
                onChange={handleFileChange}
                className="block w-full text-sm sm:text-lg text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-transparent focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm sm:file:text-base file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              {videoFile && (
                <p className="text-gray-600 text-sm mt-2">
                  Selected file: <span className="font-medium text-teal-700">{videoFile.name}</span>
                </p>
              )}
              <button
                type="submit"
                disabled={uploading}
                className={`w-full bg-gradient-to-r from-teal-600 to-cyan-700 text-white p-3 sm:p-4 rounded-lg font-bold text-lg sm:text-xl shadow-md hover:from-teal-700 hover:to-cyan-800 transition duration-300 ease-in-out transform hover:-translate-y-1 ${uploading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
              >
                {uploading ? 'Uploading... please wait! ⏳' : 'Submit Now! 🚀'}
              </button>
              <p className="text-gray-600 text-xs sm:text-sm mt-4 font-medium text-center">
                Note: Your submission will be valid only after email verification. Check your inbox! If not in inbox then chek spam folder 📧
              </p>
            </form>
          </div>

          {/* User Submission Display */}
          {loading ? (
            <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-2xl shadow-xl text-center flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12 sm:h-16 sm:w-16 mb-4"></div>
              <p className="text-gray-600 text-base sm:text-xl font-medium">Loading your video submission... 🔄</p>
            </div>
          ) : userVideo && userVideo.videoUrl || userVideo.imageUrl ? ( // Ensure videoUrl exists before rendering video player
            <div className="md:col-span-2 lg:col-span-3 bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-purple-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-6 text-center flex items-center justify-center">
                <span className="mr-3 text-3xl sm:text-4xl">🎬</span> Your Awesome Submission!
              </h2>
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="rounded-lg overflow-hidden border border-gray-300 shadow-md w-full md:w-1/2 flex-shrink-0">
                  {userVideo.videoUrl ?
                    <video
                      src={userVideo.videoUrl}
                      controls
                      className="w-full h-auto object-cover"
                      title="Your Submitted Video"
                    >
                      Your browser does not support the video tag.
                    </video>
                    : <img src={userVideo?.imageUrl} className='max-h-60 mx-auto  aspect-auto' alt="" />}
                </div>
                <div className="flex-grow text-base sm:text-lg text-gray-700 space-y-3 text-center md:text-left">
                  <p><strong>Uploader:</strong> <span className="font-medium text-gray-900">{userVideo?.name}</span></p>
                  <p><strong>Company:</strong> <span className="font-medium text-gray-900">{userVideo?.companyName || 'N/A'}</span></p>
                  <p><strong>Mobile:</strong> <span className="font-medium text-gray-900">{userVideo?.mobile}</span></p>
                  <p className="flex items-center justify-center md:justify-start">
                    <strong>Email verify:</strong> &nbsp;
                    <span className={`font-semibold ${userVideo?.isVerified ? 'text-green-600' : 'text-orange-600'}`}>
                      {userVideo?.isVerified ? 'Approved! 🎉' : <button className='outline px-2 py-0.5 rounded-lg'>Pending</button>}
                    </span>
                  </p>
                  <p className="flex items-center justify-center md:justify-start">
                    <strong>Status:</strong> &nbsp;
                    <span className={`font-semibold ${userVideo?.isApproved ? 'text-green-600' : 'text-orange-600'}`}>
                      {userVideo.isApproved ? 'Approved! 🎉' : <button className='outline px-2 py-0.5 rounded-lg'>Pending</button>}
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm italic mt-4">
                    Thank you for your contribution! Please play World Pest Quiz and get Certificate.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="md:col-span-2 lg:col-span-3 bg-white p-6 sm:p-8 rounded-2xl shadow-xl text-center py-12 sm:py-16">
              <p className="text-gray-600 text-base sm:text-xl font-medium">
                It looks like you haven't submitted a video/image yet. Let's change that! ✨
              </p>
            </div>
          )}
          {userVideo?.isVerified && <div className="md:col-span-2 lg:col-span-3 bg-white p-6 sm:p-8 rounded-2xl shadow-xl text-center flex flex-col gap-5">
            {!userVideo.isApproved &&
              <>
                <p className="text-gray-600 text-base sm:text-xl font-medium">
                  Answer 2/3 Quiz Questions & get Approved
                </p>
                <QuizPage userVideo={userVideo} />
              </>
            }
            {userVideo.certificateUrl &&
              <a href={userVideo.certificateUrl} className='my-3  outline px-3 py-1 bg-gray-600 text-white w-fit mx-auto rounded-lg'>Certificate Url</a>
            }
          </div>}
        </div>

        {/* Footer */}
        <footer className="mt-12 sm:mt-16 text-center text-gray-600 text-xs sm:text-sm opacity-80">
          &copy; {new Date().getFullYear()} Indian Pest Control Association. All rights reserved.
        </footer>
      </div>


    </div>
  );
}