import React from 'react';
import { Award, Plane, Share2, Youtube, ShieldCheck, Lightbulb, Users, BookOpen } from 'lucide-react'; // Added more icons for TopicCard

const PrizingPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center"> {/* Adjusted padding and min-h-screen */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 max-w-5xl w-full text-center border-t-8 border-yellow-400"> {/* Adjusted padding, max-w-xl to max-w-5xl for more content space */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-800 mb-6 sm:mb-8 flex items-center justify-center space-x-2 sm:space-x-3">
          <Award size={36} className="text-yellow-500 sm:size-48" /> {/* Scaled icon size */}
          <span>Recognition & Rewards!</span>
        </h2>
        <p className="text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-3xl mx-auto text-gray-700"> {/* Adjusted text size and added max-width for better readability */}
          As we approach World Pest Day, we invite each member to create and submit a 2 minute video on any of the suggested themes. Showcase your contributions to public health, safety, and environmental well-being through creativity and collaboration!
        </p>

        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 mb-6 border-b pb-3">Suggested Topics:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10"> {/* Adjusted grid for all 4 topics on larger screens */}
          <TopicCard title="Safety Practices in Pest Management" icon={ShieldCheck} />
          <TopicCard title="Public Awareness & Education" icon={Lightbulb} />
          <TopicCard title="Social Contributions by the Pest Control Industry" icon={Users} />
          <TopicCard title="Knowledge Sharing with Industry Peers" icon={BookOpen} />
        </div>

        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700 mb-6 border-b pb-3">How Your Video Will Be Recognized:</h3>
        <div className="space-y-4 sm:space-y-6"> {/* Adjusted space-y */}
          <RewardItem
            title="Showcased at Indiapest 2025"
            description="Your video will be featured at the prestigious Indiapest 2025 event in Kathmandu, gaining exposure to industry leaders and peers."
            icon={Youtube}
            color="text-red-600"
          />
          <RewardItem
            title="Panoramic Flight Over Mount Everest"
            description="The top video will be awarded a couple pass for an unforgettable scenic panoramic flight over the majestic Mount Everest!"
            icon={Plane}
            color="text-blue-600"
          />
          <RewardItem
            title="Featured on IPCA’s Official Social Media"
            description="Gain wider visibility as your winning video is promoted across IPCA's official social media platforms."
            icon={Share2}
            color="text-green-600"
          />
        </div>

        {/* Sliding Image Banner Section */}
        <div className="mt-10 sm:mt-12">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 mb-4 text-center">A glimpse of this Year...</h3>
          <div className="overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-4 sm:gap-6 px-2 py-4"> {/* Adjusted gap and added py-4 */}
            {[
              "https://res.cloudinary.com/dbzucdgf0/image/upload/v1748863391/ChatGPT_Image_Jun_2_2025_04_52_08_PM_ezkvai.png",
              "https://res.cloudinary.com/dbzucdgf0/image/upload/v1748865050/ChatGPT_Image_Jun_2_2025_05_20_37_PM_gothn9.png",
              "https://res.cloudinary.com/dbzucdgf0/image/upload/v1748863746/ChatGPT_Image_Jun_2_2025_04_58_51_PM_j82oex.png"
            ].map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Banner ${idx + 1}`}
                className="rounded-xl h-48 sm:h-56 md:h-60 w-[280px] sm:w-[320px] md:w-[360px] object-cover flex-shrink-0 shadow-md border border-gray-200" // Adjusted dimensions for responsiveness
              />
            ))}
          </div>
        </div>

        <p className="text-sm sm:text-base text-gray-600 mt-8 sm:mt-10"> {/* Adjusted text size and margin */}
          Don't miss this opportunity to highlight your impactful work and win exciting prizes!
        </p>
      </div>
    </div>
  );
};

// Helper component for Topic Cards
// MODIFIED: Now directly uses Lucide-React icons
const TopicCard = ({ title, icon: Icon }) => {
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow duration-300"> {/* Adjusted padding */}
      <Icon size={28} className="mb-2 text-blue-500" /> {/* Dynamic icon with default color */}
      <h4 className="text-base sm:text-lg font-semibold text-gray-800 text-center">{title}</h4> {/* Adjusted text size */}
    </div>
  );
};

// Helper component for Reward Items
const RewardItem = ({ title, description, icon: Icon, color }) => (
  <div className="flex flex-col sm:flex-row items-center sm:items-start bg-white p-4 sm:p-5 rounded-lg shadow-sm border border-gray-200 text-center sm:text-left"> {/* Adjusted padding and added flex-col/sm:flex-row for stacking on small screens */}
    <Icon size={28} className={`mb-2 sm:mb-0 sm:mr-4 flex-shrink-0 ${color}`} /> {/* Adjusted icon size and margin */}
    <div>
      <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">{title}</h4> {/* Adjusted text size */}
      <p className="text-sm sm:text-base text-gray-600">{description}</p> {/* Adjusted text size */}
    </div>
  </div>
);

export default PrizingPage;