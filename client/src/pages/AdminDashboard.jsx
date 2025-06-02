import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate("/admin/login");
          throw new Error("No admin token found. Please log in.");
        }
        const res = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/admin/submissions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Submissions data:", res.data);
        setSubmissions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError(err.message || "Failed to load submissions.");
        if (err.response && err.response.status === 401) {
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [navigate]);

  const handleApprove = async (userId) => {
    setApproving((prev) => ({ ...prev, [userId]: true }));
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        alert("Admin not authenticated. Please log in.");
        navigate("/admin/login");
        return;
      }
      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/api/admin/approve/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update the submission status in the local state
      setSubmissions((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isApproved: true, certificateUrl: res.data.certificateUrl } // Capture the certificate URL
            : user
        )
      );
      alert(
        res.data.message ||
          "User approved and certificate generation initiated. Certificate will be available for download."
      );
    } catch (err) {
      console.error("Error approving user:", err);
      alert(err.response?.data?.message || "Failed to approve the user. Please try again.");
      if (err.response && err.response.status === 401) {
        alert("Session expired or unauthorized. Please log in again.");
        navigate("/admin/login");
      }
    } finally {
      setApproving((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleDownloadVideo = (videoUrl, username) => {
    if (!videoUrl) {
      alert("No video available for download.");
      return;
    }
    // Cloudinary URLs are directly downloadable.
    console.log("Attempting to download video from:", videoUrl);

    const link = document.createElement("a");
    link.href = videoUrl; // Use the Cloudinary URL directly
    link.download = `${username}_video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVideoError = (e, username) => {
    console.error(`Video failed to load for ${username}:`, e);
    console.error(`Attempted URL: ${e.target.src}`);
    alert(`Failed to load video for ${username}. Check the console for details.`);
  };

  const handleDownloadCertificate = (certificateUrl, username) => {
    if (!certificateUrl) {
      alert("No certificate available for download.");
      return;
    }
    const link = document.createElement("a");
    link.href = certificateUrl; // This should be the direct URL to the static certificate
    link.download = `${username}_certificate.png`; // Or .pdf, depending on your generation
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600 text-lg text-center mt-10">Loading submissions...</p>
        ) : error ? (
          <p className="text-red-600 text-lg text-center mt-10 font-semibold">{error}</p>
        ) : (
          <div className="space-y-4">
            {Array.isArray(submissions) && submissions.length > 0 ? (
              submissions.map((submission) => {
                const {
                  _id,
                  name = "N/A",
                  companyName = "N/A",
                  email = "N/A",
                  mobile = "N/A",
                  videoUrl = "",
                  isVerified = false, // Email verification status
                  isApproved = false, // Video approval status
                  certificateUrl = "", // Destructure certificateUrl
                } = submission;

                console.log(`Rendering Submission ${_id}:`, { name, email, videoUrl, isVerified, isApproved, certificateUrl });

                const fullVideoUrl = videoUrl; // No need for base URL, it's a direct Cloudinary URL

                return (
                  <div
                    key={_id}
                    className="bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6"
                  >
                    <div className="flex-1 w-full md:w-1/2"> {/* Adjusted width for better layout */}
                      <div className="flex items-center space-x-3 mb-3">
                        <h2 className="font-bold text-xl text-gray-900">{name}</h2>
                        {/* Video approval status */}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {isApproved ? "Video Approved" : "Video Pending"}
                        </span>
                        {/* Email verification status */}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isVerified ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                            {isVerified ? "Email Verified" : "Email Unverified"}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2 text-md">Email: {email}</p>
                      <p className="text-gray-600 mb-2 text-md">Company: {companyName}</p>
                      <p className="text-gray-600 mb-4 text-md">Mobile: {mobile}</p>

                      {fullVideoUrl ? (
                        <div className="mt-4">
                          <video
                            src={fullVideoUrl}
                            controls
                            className="rounded-lg w-full max-w-md border border-gray-300"
                            onError={(e) => handleVideoError(e, name)}
                            type="video/mp4"
                          >
                            Your browser does not support the video tag.
                          </video>
                          <p className="text-sm text-gray-500 mt-2">
                            Video Path: {videoUrl}
                          </p>
                        </div>
                      ) : (
                        <p className="italic text-gray-500 mt-4">No video uploaded</p>
                      )}
                    </div>

                    <div className="md:ml-auto self-stretch md:self-center flex flex-col space-y-3 w-full md:w-auto">
                      <button
                        onClick={() => handleApprove(_id)}
                        disabled={approving[_id]} // Only disable while approving
                        className={`w-full md:w-40 px-5 py-2 rounded-md shadow-sm transition duration-300 ease-in-out font-semibold ${
                          approving[_id]
                            ? "bg-gray-400 text-gray-700 cursor-not-allowed" // Disabled (in-progress) state
                            : "bg-blue-600 text-white hover:bg-blue-700" // Active button color (Approve or Approve again)
                        }`}
                      >
                        {approving[_id] ? "Approving..." : isApproved ? "Approve again" : "Approve"} {/* <--- Changed Text */}
                      </button>

                      {fullVideoUrl && (
                        <button
                          onClick={() => handleDownloadVideo(videoUrl, name)}
                          className="w-full md:w-40 bg-green-600 text-white px-5 py-2 rounded-md shadow-sm hover:bg-green-700 transition duration-300 ease-in-out font-semibold"
                        >
                          Download Video
                        </button>
                      )}
                      {isApproved && certificateUrl && (
                        <button
                          onClick={() => handleDownloadCertificate(certificateUrl, name)}
                          className="w-full md:w-40 bg-purple-600 text-white px-5 py-2 rounded-md shadow-sm hover:bg-purple-700 transition duration-300 ease-in-out font-semibold"
                        >
                          Download Certificate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center text-lg mt-10">No video submissions available yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}