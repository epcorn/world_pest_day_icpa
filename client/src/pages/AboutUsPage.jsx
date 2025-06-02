import React from 'react';
import { Globe, Users, HeartHandshake } from 'lucide-react'; // Removed Building icon, as it's replaced by logo

const AboutUsPage = () => {
  const ipcaLogoUrl = "https://res.cloudinary.com/dbzucdgf0/image/upload/v1748840762/IPCA_LOGO_ckfv6q.jpg"; // Your actual Cloudinary URL

  return (
    <div className="p-8 bg-gray-50 min-h-[calc(100vh-8rem)] flex flex-col items-center justify-start">
      <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 max-w-5xl w-full text-center border-t-8 border-blue-600">
        <h2 className="text-5xl font-extrabold text-blue-800 mb-8 flex items-center justify-center space-x-4">
          {/* IPCA Logo placed here, replacing the Building icon */}
          <img src={ipcaLogoUrl} alt="IPCA Logo" className="h-32 w-32 rounded-full border-4 border-blue-200 shadow-lg flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/003366/FFFFFF?text=IPCA"; }} />
          <span>About The Indian Pest Control Association (IPCA)</span>
        </h2>

        <section className="mb-10 text-left">
          <h3 className="text-3xl font-bold text-green-700 mb-4 border-b-2 pb-2">Our Foundation and Vision</h3>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            The Indian Pest Control Association (IPCA) is a non-profit trade association comprised of professional pest management companies from across India. Established in 1967, IPCA stands as the premier and largest association within the professional licensed pest management industry in the country, boasting close to 350 members nationwide today.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Registered under The Societies Registration Act, 1960 (Act XXI of 1860), IPCA holds recognition from various Government bodies. For over half a century, it has served as the authoritative voice of the professional pest management industry in India. We are closely associated with various Government Departments and Municipal Corporations, contributing significantly to policy-making, the preparation of industry standards, and the introduction of effective and environmentally safe pesticides and licensing methods.
          </p>
        </section>

        <section className="mb-10 text-left">
          <h3 className="text-3xl font-bold text-green-700 mb-4 border-b-2 pb-2">Commitment to Public Health and Environment</h3>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            IPCA, with the invaluable assistance of its members, has actively engaged with NGOs, Municipal Authorities, and the public at large. We conduct coordinated campaigns in various cities aimed at controlling public health pests such as mosquitoes and rats, thereby contributing directly to community well-being.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Our unwavering mission is to safeguard public health, protect property, and preserve the environment through sustainable and ethical pest control solutions. We strive to achieve this by fostering crucial research, setting rigorous industry standards, and providing essential training and certification programs for pest management professionals across the nation.
          </p>
        </section>

        <section className="mb-10 text-left">
          <h3 className="text-3xl font-bold text-green-700 mb-4 border-b-2 pb-2">Active Role in World Pest Day</h3>
          <p className="text-gray-700 text-lg leading-relaxed mb-4 flex items-center space-x-2">
            <Globe size={24} className="text-blue-500 flex-shrink-0" />
            <span>IPCA has been an active torchbearer for "WORLD PEST DAY," a globally recognizable action directly affecting the business ethos of professional pest management.</span>
          </p>
          <p className="text-gray-700 text-lg leading-relaxed mb-4 flex items-center space-x-2">
            <HeartHandshake size={24} className="text-red-500 flex-shrink-0" />
            <span>The first "World Pest Day" was a worldwide campaign initiated by the Chinese Pest Control Association, fully backed and supported by the Indian Pest Control Association-IPCA. Its primary aim is to increase awareness of the vital role that professional pest management companies and their dedicated individuals play in protecting public health.</span>
          </p>
          <p className="text-gray-700 text-lg leading-relaxed flex items-center space-x-2">
            <Users size={24} className="text-purple-500 flex-shrink-0" />
            <span>It also extends its reach to various associated industries where professional pest management is paramount for daily functioning, particularly where public health, food safety, and environmental protection are of prime importance. It's a day dedicated to recognizing the invaluable role of pest control professionals and promoting responsible pest management practices worldwide.</span>
          </p>
        </section>

        <p className="text-gray-600 text-md mt-10">
          We are proud to lead the charge in fostering a safer, healthier, and pest-free India.
        </p>

        {/* New section for the IPCA website link */}
        <section className="mt-10 pt-6 border-t-2 border-gray-200">
          <p className="text-gray-700 text-lg font-semibold mb-4">
            Learn more about IPCA and our initiatives:
          </p>
          <a
            href="https://ipca.org.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Visit IPCA Official Website
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0l-7 7m7-7V10"></path>
            </svg>
          </a>
        </section>

      </div>
    </div>
  );
};

export default AboutUsPage;
