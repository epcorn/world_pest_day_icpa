import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Trophy, Info, Menu, X } from 'lucide-react'; // Lucide React icons

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // IPCA Logo URL - This is the correct logo for the Navbar
  const ipcaLogoUrl = 'https://res.cloudinary.com/dbzucdgf0/image/upload/v1748840762/IPCA_LOGO_ckfv6q.jpg';
  
  // World Pest Day image - Better suited for banners, not small logos
  const WorldPestDay = 'https://res.cloudinary.com/dbzucdgf0/image/upload/v1748860343/World-Pest-Day-1200x600_trpjan.jpg';

  // Helper component for navigation links
  const NavLink = ({ to, text, icon: Icon }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
        text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-75`}
    >
      {Icon && <Icon size={20} />}
      <span className="font-semibold text-lg">{text}</span>
    </Link>
  );

  // Helper component for mobile navigation links
  const MobileNavLink = ({ to, text, icon: Icon }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
      className={`flex items-center space-x-3 w-full text-left px-6 py-3 transition-all duration-300
        text-blue-100 hover:bg-blue-600 hover:text-white
        focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-75`}
    >
      {Icon && <Icon size={22} />}
      <span className="text-xl">{text}</span>
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 p-4 shadow-lg rounded-b-xl">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        {/* IPCA Logo for the Navbar - uses ipcaLogoUrl */}
        <div className="flex items-center space-x-3">
          <img src={ipcaLogoUrl} alt="IPCA Logo" className="h-12 w-12 rounded-full border-2 border-white shadow-md" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/003366/FFFFFF?text=IPCA"; }} />
          <span className="text-white text-2xl font-extrabold tracking-wide">World Pest Day</span>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none p-2 rounded-md hover:bg-blue-700 transition-colors">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-8">
          <NavLink to="/" text="Home" icon={Home} />
          <NavLink to="/prizing" text="Prizing" icon={Trophy} />
          <NavLink to="/about-us" text="About Us" icon={Info} />
        </div>
      </div>

      {/* Mobile menu (conditionally rendered) */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 bg-blue-700 rounded-lg shadow-inner py-2">
          <MobileNavLink to="/" text="Home" icon={Home} />
          <MobileNavLink to="/prizing" text="Prizing" icon={Trophy} />
          <MobileNavLink to="/about-us" text="About Us" icon={Info} />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
