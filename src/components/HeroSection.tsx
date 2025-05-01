
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { AspectRatio } from "./ui/aspect-ratio";

const HeroSection = () => {
  return (
    <div className="bg-darkBg py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Premium A2 Landscape <br />
            Wire Bound Calendars
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md">
            Personalize your business calendar with high-quality prints that make a
            lasting impression all year round.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/design" className="inline-flex">
              <Button className="bg-white text-darkBg hover:bg-gray-200 font-medium px-6 py-6 h-auto">
                Customize Your Calendar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/templates" className="inline-flex">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-6 h-auto">
                View Templates
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative z-10 md:flex justify-end">
          <div className="bg-gray-800 rounded-lg overflow-hidden w-full md:w-5/6">
            <AspectRatio ratio={4/3}>
              <div className="w-full h-full relative">
                <div className="absolute inset-0 flex justify-center items-center">
                  <Calendar className="w-24 h-24 text-goldAccent opacity-90" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-darkBg via-transparent to-goldAccent/20 opacity-60"></div>
              </div>
            </AspectRatio>
          </div>
        </div>
      </div>
      
      {/* Background accent elements */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-goldAccent/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-goldAccent/5 rounded-full blur-3xl"></div>
    </div>
  );
};

export default HeroSection;
