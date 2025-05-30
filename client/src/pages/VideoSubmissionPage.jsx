import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VideoSubmissionPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [userVideo, setUserVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserVideo = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
          setError('No user email found. Please register again.');
          return;
        }
        // Assumes /api/users/video?email=... exists
        const res = await axios.get(`http://localhost:5000/api/users/video?email=${encodeURIComponent(email)}`);
        setUserVideo(res.data);
      } catch (err) {
        console.error('Error fetching user video:', err.response?.data || err.message);
        setError('Failed to load video data. Please try again.');
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
      setError('Please select a valid video file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setError('No user email found. Please register again.');
        return;
      }
      const res = await axios.post(`http://localhost:5000/api/upload?email=${encodeURIComponent(email)}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUserVideo(res.data);
      setVideoFile(null);
      alert(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload video. Please try again.');
      console.error('Upload error:', err.response?.data);
    } finally {
      setUploading(false);
    }
  };

  const themes = [
    'Safety Practices in Pest Management',
    'Public Awareness & Education',
    'Social Contributions by the Pest Control Industry',
    'Knowledge Sharing with Industry Peers',
  ];

  const prizes = [
    'Showcased at Indiapest 2025 in Kathmandu',
    'Couple pass for a scenic panoramic flight over Mount Everest',
    'Featured on IPCA’s social media and website on World Pest Day',
  ];

  const dos = [
    'Be creative and focus on pest control themes.',
    'Keep your video concise (max 2 minutes).',
    'Ensure high-quality audio and visuals.',
    'Highlight the importance of pest management.',
  ];

  const donts = [
    'Do not use plagiarized videos.',
    'Do not use AI-generated videos.',
    'Do not mention any brand names or individual names.',
    'Avoid offensive or inappropriate content.',
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-green-800 text-center mb-8">
          Submit Your World Pest Day Video
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Video Themes</h2>
          <ul className="list-disc pl-6 text-gray-700">
            {themes.map((theme, idx) => (
              <li key={idx}>{theme}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Prizes for Top 3 Videos</h2>
          <ul className="list-disc pl-6 text-gray-700">
            {prizes.map((prize, idx) => (
              <li key={idx}>{prize}</li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Do’s & Don’ts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-green-600">Do’s</h3>
              <ul className="list-disc pl-6 text-gray-700">
                {dos.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-600">Don’ts</h3>
              <ul className="list-disc pl-6 text-gray-700">
                {donts.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Your Video</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="mb-4 p-2 border rounded w-full"
            />
            <button
              type="submit"
              disabled={uploading}
              className={`w-full bg-green-600 text-white p-2 rounded hover:bg-green-500 transition ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? 'Uploading...' : 'Submit Video'}
            </button>
          </form>
          <p className="text-red-500 text-sm mt-2 font-medium">
            Note: If you have not verified through the email link, your submission will not be considered valid.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-600 text-center">Loading...</p>
        ) : userVideo ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Submission</h2>
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
              <video
                src={`http://localhost:5000${userVideo.videoUrl}`}
                controls
                className="rounded-md w-full md:w-1/2"
              >
                Your browser does not support the video tag.
              </video>
              <div>
                <p className="text-gray-700">Uploaded by: {userVideo.name}</p>
                <p className="text-gray-500 text-sm">
                  Status: {userVideo.isVerified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>
            <p className="text-red-500 text-sm mt-2 font-medium">
              Note: If you have not verified through the email link, your submission will not be considered valid.
            </p>
          </div>
        ) : (
          <p className="text-gray-600 text-center">No video submitted yet.</p>
        )}
      </div>
    </div>
  );
}