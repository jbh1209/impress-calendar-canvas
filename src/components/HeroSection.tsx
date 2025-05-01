
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <div className="bg-darkBg py-16 md:py-24">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Premium A2 Landscape <br />
            Wire Bound Calendars
          </h1>
          <p className="text-gray-400 mb-6">
            Full-color custom desk calendars with high-quality prints that make a
            stunning addition to any workspace.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/design" className="gold-button">
              Start designing now
            </Link>
            <Link to="/how-it-works" className="flex items-center text-white hover:text-goldAccent transition-colors">
              How it's done <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="relative">
          <img
            src="/lovable-uploads/19251639-1374-4824-a31c-a41808f6a14a.png"
            alt="Premium Calendar"
            className="w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
