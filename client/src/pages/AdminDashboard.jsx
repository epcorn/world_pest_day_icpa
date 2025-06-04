import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, Clock, XCircle, Download, FileText } from 'lucide-react'; // Added icons for better visual cues

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState({}); // Tracks approval state per submission
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true); // Ensure loading state is true on every fetch attempt
      setError(""); // Clear previous errors
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          navigate("/admin/login");
          // Throwing an error here prevents further execution in this try block
          throw new Error("No admin token found. Please log in.");
        }
        const res = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/admin/submissions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Submissions data:", res.data);
        // Ensure data is always an array; if not, default to empty array
        setSubmissions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        const errorMessage = err.response?.data?.message || err.message || "Failed to load submissions.";
        setError(errorMessage);
        if (err.response && err.response.status === 401) {
          // If unauthorized, redirect to login and clear token
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
    // Dependency array: re-run if navigate changes (though it's stable)
    // Removed token from dependency array to prevent infinite loop if token changes outside of effect
  }, [navigate]);

  const handleApprove = async (userId) => {
    if (approving[userId]) return; // Prevent multiple clicks while already approving

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
        localStorage.removeItem("adminToken"); // Clear invalid token
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
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `${username}_video.mp4`; // Suggest a filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCertificate = (certificateUrl, username) => {
    if (!certificateUrl) {
      alert("No certificate available for download.");
      return;
    }
    const link = document.createElement("a");
    link.href = certificateUrl;
    // Assuming certificateUrl points to a .png or .pdf
    const fileExtension = certificateUrl.split('.').pop() || 'png';
    link.download = `${username}_certificate.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/"); // Redirect to home or admin login
  };

  // Helper function to render status badges
  const StatusBadge = ({ status, text, colorClass, Icon }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} mr-2 mb-1 sm:mb-0`}>
      {Icon && <Icon size={12} className="mr-1" />}
      {text}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8"> {/* Adjusted padding for responsiveness */}
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8 md:p-10"> {/* Wider max-width, increased padding, added shadow */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8"> {/* Responsive flex direction for header */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 sm:mb-0">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out font-medium text-base transform hover:scale-105"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-blue-500 h-10 w-10 mb-4" />
            <p className="text-gray-600 text-lg">Loading submissions...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center text-lg mt-10" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
            {error.includes("token") && (
              <p className="text-sm mt-2">Please log in again to refresh your session.</p>
            )}
          </div>
        ) : (
          <div className="space-y-6"> {/* Increased space between cards */}
            {Array.isArray(submissions) && submissions.length > 0 ? (
              submissions.map((submission) => {
                const {
                  _id,
                  name = "N/A",
                  companyName = "N/A",
                  email = "N/A",
                  mobile = "N/A",
                  videoUrl = "",
                  isVerified = false,
                  isApproved = false,
                  certificateUrl = "",
                } = submission;

                return (
                  <div
                    key={_id}
                    className="bg-gray-50 p-5 sm:p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center mb-3">
                        <h2 className="font-bold text-xl sm:text-2xl text-gray-900 mr-3 mb-1 sm:mb-0">{name}</h2>
                        <StatusBadge
                          status={isApproved}
                          text={isApproved ? "Approved" : "Pending Approval"}
                          colorClass={isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                          Icon={isApproved ? CheckCircle : Clock}
                        />
                        <StatusBadge
                          status={isVerified}
                          text={isVerified ? "Email Verified" : "Email Unverified"}
                          colorClass={isVerified ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}
                          Icon={isVerified ? CheckCircle : XCircle}
                        />
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base mb-1">Company: <span className="font-medium">{companyName}</span></p>
                      <p className="text-gray-600 text-sm sm:text-base mb-1">Email: <span className="font-medium">{email}</span></p>
                      <p className="text-gray-600 text-sm sm:text-base mb-4">Mobile: <span className="font-medium">{mobile}</span></p>

                      {videoUrl ? (
                        <div className="mt-4 w-full">
                          <video
                            src={videoUrl}
                            controls
                            className="rounded-lg w-full max-w-sm sm:max-w-md mx-auto border border-gray-300" // Responsive width for video
                            onError={() => alert(`Failed to load video for ${name}. Please check the URL or network.`)}
                            type="video/mp4"
                          >
                            Your browser does not support the video tag.
                          </video>
                          <p className="text-xs text-gray-500 mt-2 break-words">
                            Video URL: <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{videoUrl}</a>
                          </p>
                        </div>
                      ) : (
                        <p className="italic text-gray-500 mt-4 text-sm sm:text-base">No video uploaded</p>
                      )}
                    </div>

                    <div className="md:ml-auto self-stretch flex flex-col space-y-3 w-full sm:w-auto mt-4 md:mt-0"> {/* Responsive button column */}
                      <button
                        onClick={() => handleApprove(_id)}
                        disabled={approving[_id]}
                        className={`w-full px-5 py-2 rounded-md shadow-sm transition duration-300 ease-in-out font-semibold text-base flex items-center justify-center ${
                          approving[_id]
                            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {approving[_id] ? <Loader2 className="animate-spin mr-2" size={16} /> : isApproved ? <CheckCircle className="mr-2" size={16} /> : null}
                        {approving[_id] ? "Approving..." : isApproved ? "Re-Approve" : "Approve Video"}
                      </button>

                      {videoUrl && (
                        <button
                          onClick={() => handleDownloadVideo(videoUrl, name)}
                          className="w-full bg-green-600 text-white px-5 py-2 rounded-md shadow-sm hover:bg-green-700 transition duration-300 ease-in-out font-semibold text-base flex items-center justify-center"
                        >
                          <Download size={16} className="mr-2" /> Download Video
                        </button>
                      )}
                      {isApproved && certificateUrl && (
                        <button
                          onClick={() => handleDownloadCertificate(certificateUrl, name)}
                          className="w-full bg-purple-600 text-white px-5 py-2 rounded-md shadow-sm hover:bg-purple-700 transition duration-300 ease-in-out font-semibold text-base flex items-center justify-center"
                        >
                          <FileText size={16} className="mr-2" /> Download Certificate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center text-lg mt-10 p-4 bg-white rounded-lg shadow">No video submissions available yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}