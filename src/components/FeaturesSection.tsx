
import { Calendar, FileText, Image, Pen } from "lucide-react";

const FeaturesSection = () => {
  return (
    <div className="py-16 bg-darkBg">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-3 text-white">Premium Calendar Features</h2>
        <p className="text-gray-300 text-center max-w-3xl mx-auto mb-12 text-lg">
          Our A2 Landscape Wire Bound Calendars combine quality materials with 
          professional design for the perfect business calendar.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Calendar className="w-6 h-6 text-white" />}
            title="Premium A2 Size"
            description="Large A2 landscape format provides ample space for notes and visibility from across the room."
          />
          
          <FeatureCard 
            icon={<FileText className="w-6 h-6 text-white" />}
            title="Wire Bound Design"
            description="Durable wire binding allows pages to lay flat and flip easily for a better user experience."
          />
          
          <FeatureCard 
            icon={<Image className="w-6 h-6 text-white" />}
            title="High-Quality Printing"
            description="Vibrant, fade-resistant colors on premium 250gsm paper for a professional look all year."
          />
          
          <FeatureCard 
            icon={<Pen className="w-6 h-6 text-white" />}
            title="Custom Branding"
            description="Personalize with your logo and company details for consistent brand visibility."
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <div className="bg-[#1A1A1A] rounded-lg p-6 flex items-start relative overflow-hidden shadow-lg">
      {/* Enhanced vignette effect with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#333333]/80 via-[#222222]/50 to-transparent"></div>
      <div className="absolute inset-0 bg-[#000000]/10 rounded-lg"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0000001a] to-transparent"></div>
      
      {/* Icon container */}
      <div className="w-12 h-12 bg-[#333333] rounded-lg flex items-center justify-center mr-4 shrink-0 relative z-10">
        {icon}
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>
    </div>
  );
};

export default FeaturesSection;
