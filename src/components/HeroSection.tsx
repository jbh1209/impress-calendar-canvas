
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="bg-darkBg py-16 md:py-24 relative">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
        <div className="z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight leading-none text-white">
            Premium A2 Landscape<br />
            Wire Bound Calendars
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-md leading-relaxed">
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
              <img 
                src="/lovable-uploads/268e948a-5bf4-498b-892b-3ed5ed0e5ce5.png" 
                alt="Colorful houses of Burano, Italy at sunset" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a2130]/40 via-transparent to-transparent"></div>
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
