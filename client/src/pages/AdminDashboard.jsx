import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, Clock, XCircle, Download, FileText, BarChart2, Users, Calendar } from 'lucide-react'; // Added icons

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState({}); // Tracks approval state per submission

  // --- NEW STATE FOR ANALYTICS ---
  const [showAnalytics, setShowAnalytics] = useState(false); // Controls visibility of analytics section
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");
  const [uniqueVisitorsToday, setUniqueVisitorsToday] = useState(0); // From backend
  const [totalUniqueVisitors, setTotalUniqueVisitors] = useState(0); // From backend
  const [dailyVisitorsData, setDailyVisitorsData] = useState([]); // For chart data
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date for filter
  // --- END NEW STATE ---

  const navigate = useNavigate();

  // --- SUBMISSIONS FETCH EFFECT ---
  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError("");
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
        const errorMessage = err.response?.data?.message || err.message || "Failed to load submissions.";
        setError(errorMessage);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [navigate]);

  // --- ANALYTICS FETCH EFFECT ---
  // This useEffect will run when `showAnalytics` is true or `selectedDate` changes
  useEffect(() => {
    if (!showAnalytics) return; // Only fetch analytics if the section is visible

    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          // You might want to handle this differently if analytics can be public
          // but for admin dashboard, assume token is needed.
          setAnalyticsError("Authentication required for analytics.");
          navigate("/admin/login");
          return;
        }

        // Fetch overall unique visitor counts
        const overallRes = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/unique-visits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalUniqueVisitors(overallRes.data.totalUniqueVisitors);
        setUniqueVisitorsToday(overallRes.data.uniqueVisitorsToday);

        // Fetch daily unique visitors for the selected date
        // (Assuming your backend /api/unique-visits endpoint can accept a date query param
        //  or you implement a new endpoint for daily data, like /api/unique-visits-by-date)
        // For simplicity, I'm going to modify the existing backend code to aggregate by date.
        // **IMPORTANT**: You need to implement a new backend route or modify the existing one
        // to return data suitable for charting (e.g., unique visitors for the last 7 days).
        // For now, I'll assume a new endpoint like `/api/unique-visits-daily` exists.
        // If not, you'll need to adapt this part or make `unique-visits` return more data.
        const dailyRes = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/api/unique-visits-daily?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Assuming dailyRes.data is an array of objects like [{ date: "YYYY-MM-DD", count: N }]
        // For the purpose of the chart, I'll simulate some data for now if you haven't implemented the daily route yet.
        setDailyVisitorsData(dailyRes.data); // This line assumes a backend response for daily data

      } catch (err) {
        console.error("Error fetching analytics:", err);
        setAnalyticsError(err.response?.data?.message || err.message || "Failed to load analytics data.");
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        }
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [showAnalytics, selectedDate, navigate]); // Re-fetch when analytics section is shown or date changes

  // Helper for Chart.js data formatting
  const chartData = {
    labels: dailyVisitorsData.map(d => d.date), // Dates for X-axis
    datasets: [
      {
        label: 'Unique Visitors',
        data: dailyVisitorsData.map(d => d.count), // Counts for Y-axis
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Unique Visitors on ${selectedDate}`,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Unique Visitors',
        },
        ticks: {
            stepSize: 1, // Ensure integer ticks for visitor count
        }
      },
    },
  };

  // --- END NEW STATE AND ANALYTICS EFFECT ---

  const handleApprove = async (userId) => {
    if (approving[userId]) return;

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
      setSubmissions((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isApproved: true, certificateUrl: res.data.certificateUrl }
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
        localStorage.removeItem("adminToken");
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
    link.download = `${username}_video.mp4`;
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
    const fileExtension = certificateUrl.split('.').pop() || 'png';
    link.download = `${username}_certificate.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  // Helper function to render status badges
  const StatusBadge = ({ status, text, colorClass, Icon }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} mr-2 mb-1 sm:mb-0`}>
      {Icon && <Icon size={12} className="mr-1" />}
      {text}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8 md:p-10">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 mb-4 sm:mb-0">
            Admin Dashboard
          </h1>
          <div className="flex space-x-3"> {/* Group buttons */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)} // Toggle analytics view
              className={`px-5 py-2 rounded-lg shadow-md transition duration-300 ease-in-out font-medium text-base transform hover:scale-105 flex items-center ${
                showAnalytics
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <BarChart2 size={20} className="mr-2" />
              {showAnalytics ? "Hide Analytics" : "Show Analytics"}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out font-medium text-base transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        {/* --- ANALYTICS SECTION --- */}
        {showAnalytics && (
          <div className="mb-8 border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart2 size={28} className="mr-3 text-blue-600" /> Website Analytics
            </h2>

            {analyticsLoading ? (
              <div className="flex flex-col items-center justify-center h-48">
                <Loader2 className="animate-spin text-blue-500 h-8 w-8 mb-4" />
                <p className="text-gray-600 text-lg">Loading analytics data...</p>
              </div>
            ) : analyticsError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center text-md mb-6" role="alert">
                <strong className="font-bold">Analytics Error:</strong>
                <span className="block sm:inline"> {analyticsError}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Total Unique Visitors Card */}
                <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-800 mb-2">Total Unique Visitors</h3>
                    <p className="text-4xl font-bold text-blue-600">{totalUniqueVisitors}</p>
                  </div>
                  <Users size={50} className="text-blue-400 opacity-60" />
                </div>

                {/* Unique Visitors Today Card */}
                <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Unique Visitors Today</h3>
                    <p className="text-4xl font-bold text-green-600">{uniqueVisitorsToday}</p>
                  </div>
                  <Users size={50} className="text-green-400 opacity-60" />
                </div>
              </div>
            )}

            {/* Daily Visitors Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar size={22} className="mr-2 text-gray-600" /> Unique Visitors by Date
              </h3>
              <div className="mb-4 flex items-center">
                <label htmlFor="date-filter" className="mr-3 text-gray-700 font-medium">Select Date:</label>
                <input
                  type="date"
                  id="date-filter"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {analyticsLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="animate-spin text-blue-500 h-10 w-10 mb-4" />
                    <p className="text-gray-600 text-lg">Loading chart data...</p>
                </div>
              ) : analyticsError ? (
                  <p className="text-red-500 text-center">{analyticsError}</p>
              ) : dailyVisitorsData.length > 0 ? (
                <div className="relative h-96 w-full"> {/* Responsive chart container */}
                  <Bar data={chartData} options={chartOptions} />
                </div>
              ) : (
                <p className="text-gray-500 text-center">No unique visitor data available for this date range.</p>
              )}
            </div>
          </div>
        )}
        {/* --- END ANALYTICS SECTION --- */}

        {/* Existing Submissions Section */}
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
          <div className="space-y-6">
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
                            className="rounded-lg w-full max-w-sm sm:max-w-md mx-auto border border-gray-300"
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

                    <div className="md:ml-auto self-stretch flex flex-col space-y-3 w-full sm:w-auto mt-4 md:mt-0">
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