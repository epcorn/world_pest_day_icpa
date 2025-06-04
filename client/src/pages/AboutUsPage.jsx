import React from 'react';
import { Globe, Users, HeartHandshake, ExternalLink } from 'lucide-react'; // Added ExternalLink for the button icon

const AboutUsPage = () => {
  const ipcaLogoUrl = "https://res.cloudinary.com/dbzucdgf0/image/upload/v1748840762/IPCA_LOGO_ckfv6q.jpg"; // Your actual Cloudinary URL

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-start"> {/* Adjusted padding for better mobile viewing */}
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 max-w-5xl w-full text-center border-t-8 border-blue-600 animate-fade-in-up"> {/* Adjusted padding and added animation */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-blue-800 mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4"> {/* Responsive font sizes, flex direction for logo and text */}
          <img
            src={ipcaLogoUrl}
            alt="IPCA Logo"
            className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full border-4 border-blue-200 shadow-lg flex-shrink-0" // Responsive logo size
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/003366/FFFFFF?text=IPCA"; }}
          />
          <span className="mt-3 sm:mt-0 leading-tight">About The Indian Pest Control Association (IPCA)</span> {/* Adjusted margin and line height */}
        </h2>

        <section className="mb-8 sm:mb-10 text-left">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 mb-3 sm:mb-4 border-b-2 pb-2">Our Foundation and Vision</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 text-gray-700"> {/* Responsive font size */}
            The Indian Pest Control Association (IPCA) is a non-profit trade association comprised of professional pest management companies from across India. Established in 1967, IPCA stands as the premier and largest association within the professional licensed pest management industry in the country, boasting close to 350 members nationwide today.
          </p>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700"> {/* Responsive font size */}
            Registered under The Societies Registration Act, 1960 (Act XXI of 1860), IPCA holds recognition from various Government bodies. For over half a century, it has served as the authoritative voice of the professional pest management industry in India. We are closely associated with various Government Departments and Municipal Corporations, contributing significantly to policy-making, the preparation of industry standards, and the introduction of effective and environmentally safe pesticides and licensing methods.
          </p>
        </section>

        <section className="mb-8 sm:mb-10 text-left">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 mb-3 sm:mb-4 border-b-2 pb-2">Commitment to Public Health and Environment</h3>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 text-gray-700"> {/* Responsive font size */}
            IPCA, with the invaluable assistance of its members, has actively engaged with NGOs, Municipal Authorities, and the public at large. We conduct coordinated campaigns in various cities aimed at controlling public health pests such as mosquitoes and rats, thereby contributing directly to community well-being.
          </p>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700"> {/* Responsive font size */}
            Our unwavering mission is to safeguard public health, protect property, and preserve the environment through sustainable and ethical pest control solutions. We strive to achieve this by fostering crucial research, setting rigorous industry standards, and providing essential training and certification programs for pest management professionals across the nation.
          </p>
        </section>

        <section className="mb-8 sm:mb-10 text-left">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 mb-3 sm:mb-4 border-b-2 pb-2">Active Role in World Pest Day</h3>
          {/* Each paragraph itemized for better spacing and icon alignment */}
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 flex items-start space-x-2"> {/* Using items-start for multiline text alignment */}
            <Globe size={20} className="text-blue-500 flex-shrink-0 mt-1" /> {/* Adjusted icon size and vertical alignment */}
            <span>IPCA has been an active torchbearer for "WORLD PEST DAY," a globally recognizable action directly affecting the business ethos of professional pest management.</span>
          </p>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 flex items-start space-x-2"> {/* Using items-start for multiline text alignment */}
            <HeartHandshake size={20} className="text-red-500 flex-shrink-0 mt-1" /> {/* Adjusted icon size and vertical alignment */}
            <span>The first "World Pest Day" was a worldwide campaign initiated by the Chinese Pest Control Association, fully backed and supported by the Indian Pest Control Association-IPCA. Its primary aim is to increase awareness of the vital role that professional pest management companies and their dedicated individuals play in protecting public health.</span>
          </p>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed flex items-start space-x-2"> {/* Using items-start for multiline text alignment */}
            <Users size={20} className="text-purple-500 flex-shrink-0 mt-1" /> {/* Adjusted icon size and vertical alignment */}
            <span>It also extends its reach to various associated industries where professional pest management is paramount for daily functioning, particularly where public health, food safety, and environmental protection are of prime importance. It's a day dedicated to recognizing the invaluable role of pest control professionals and promoting responsible pest management practices worldwide.</span>
          </p>
        </section>

        <p className="text-sm sm:text-base text-gray-600 mt-8 sm:mt-10"> {/* Responsive font size and margin */}
          We are proud to lead the charge in fostering a safer, healthier, and pest-free India.
        </p>

        {/* New section for the IPCA website link */}
        <section className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t-2 border-gray-200">
          <p className="text-base sm:text-lg font-semibold mb-4 text-gray-700"> {/* Responsive font size */}
            Learn more about IPCA and our initiatives:
          </p>
          <a
            href="https://ipca.org.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base" // Responsive padding and font size
          >
            Visit IPCA Official Website
            <ExternalLink className="ml-2 w-4 h-4 sm:w-5 sm:h-5" /> {/* Using Lucide icon for external link */}
          </a>
        </section>
      </div>

      {/* Global CSS for animations (consider moving to App.css or a dedicated style file) */}
      <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInScale 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AboutUsPage;