import React from 'react';
import { Award, Plane, Share2, Youtube } from 'lucide-react'; // Icons for prizing details

const PrizingPage = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full text-center border-t-8 border-yellow-400">
        <h2 className="text-5xl font-extrabold text-blue-800 mb-6 flex items-center justify-center space-x-3">
          <Award size={48} className="text-yellow-500" />
          <span>Recognition & Rewards!</span>
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed mb-8">
          As we approach World Pest Day, we invite each member to create and submit a 3 to 5-minute video on any of the suggested themes. Showcase your contributions to public health, safety, and environmental well-being through creativity and collaboration!
        </p>

        <h3 className="text-3xl font-bold text-green-700 mb-6 border-b pb-3">Suggested Topics:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <TopicCard title="Safety Practices in Pest Management" icon="shield" />
          <TopicCard title="Public Awareness & Education" icon="lightbulb" />
          <TopicCard title="Social Contributions by the Pest Control Industry" icon="users" />
          <TopicCard title="Knowledge Sharing with Industry Peers" icon="book" />
        </div>

        <h3 className="text-3xl font-bold text-purple-700 mb-6 border-b pb-3">How Your Video Will Be Recognized:</h3>
        <div className="space-y-6">
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
        <div className="mt-12">
          <h3 className="text-3xl font-bold text-blue-700 mb-4 text-center">Glimpses of Last Year</h3>
          <div className="overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-4 px-2">
            {[
              "https://res.cloudinary.com/dbzucdgf0/image/upload/v1748863391/ChatGPT_Image_Jun_2_2025_04_52_08_PM_ezkvai.png",
              "https://res.cloudinary.com/dbzucdgf0/image/upload/v1748865050/ChatGPT_Image_Jun_2_2025_05_20_37_PM_gothn9.png",
              "https://res.cloudinary.com/dbzucdgf0/image/upload/v1748863746/ChatGPT_Image_Jun_2_2025_04_58_51_PM_j82oex.png"
            ].map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Banner ${idx + 1}`}
                className="rounded-xl h-60 w-[360px] object-cover flex-shrink-0 shadow-md border border-gray-200"
              />
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-md mt-10">
          Don't miss this opportunity to highlight your impactful work and win exciting prizes!
        </p>
      </div>
    </div>
  );
};

// Helper component for Topic Cards
const TopicCard = ({ title, icon }) => {
  let IconComponent;
  switch (icon) {
    case 'shield': IconComponent = <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>; break;
    case 'lightbulb': IconComponent = <svg className="w-8 h-8 text-yellow-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>; break;
    case 'users': IconComponent = <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h2a2 2 0 002-2V4a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2m0 0l-1.406-1.406A2 2 0 013.293 16.586L4 16m0 0l2.5-2.5m1.171-1.171l4.586 4.586A2 2 0 0017 17.172V14m0 0l-2.5-2.5m1.171-1.171l-4.586-4.586A2 2 0 007 6.828V10m0 0l-2.5-2.5"></path></svg>; break;
    case 'book': IconComponent = <svg className="w-8 h-8 text-purple-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"></path></svg>; break;
    default: IconComponent = <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>;
  }
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg p-5 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow duration-300">
      {IconComponent}
      <h4 className="text-xl font-semibold text-gray-800 text-center">{title}</h4>
    </div>
  );
};

// Helper component for Reward Items
const RewardItem = ({ title, description, icon: Icon, color }) => (
  <div className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <Icon size={32} className={`mr-4 flex-shrink-0 ${color}`} />
    <div className="text-left">
      <h4 className="text-2xl font-bold text-gray-800 mb-1">{title}</h4>
      <p className="text-gray-600 text-lg">{description}</p>
    </div>
  </div>
);

export default PrizingPage;
