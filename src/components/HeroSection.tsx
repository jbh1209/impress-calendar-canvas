
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="bg-darkBg py-16 md:py-24 relative">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
        <div className="z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight leading-none">
            Premium A2 Landscape<br />
            Wire Bound Calendars
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">
            Personalize your business calendar with high-quality prints that make a
            lasting impression all year round.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/design" className="inline-flex">
              <button className="bg-white text-darkBg hover:bg-gray-200 transition-colors font-medium px-6 py-3 rounded flex items-center">
                Customize Your Calendar <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
            <Link to="/templates" className="inline-flex">
              <button className="border border-white text-white hover:bg-white/10 transition-colors font-medium px-6 py-3 rounded">
                View Templates
              </button>
            </Link>
          </div>
        </div>
        <div className="relative z-10 md:flex justify-end">
          <div className="bg-[#1a2130] rounded-lg overflow-hidden w-full md:w-[90%] shadow-lg">
            <div className="aspect-[16/10] relative">
              <div className="absolute inset-0 flex justify-center items-center">
                <svg className="w-24 h-24 text-goldAccent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1a2130]/90 via-[#1a2130]/50 to-[#1a2130]/30"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background accent elements */}
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-goldAccent/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-goldAccent/5 rounded-full blur-3xl"></div>
    </div>
  );
};

export default HeroSection;
