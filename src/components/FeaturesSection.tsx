
import { Calendar, FileText, Image, Pen } from "lucide-react";

const FeaturesSection = () => {
  return (
    <div className="py-16 bg-darkBg">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-3">Premium Calendar Features</h2>
        <p className="text-gray-400 text-center max-w-3xl mx-auto mb-12 text-lg">
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
    <div className="bg-[#222222] rounded-lg p-6 flex items-start relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-70"></div>
      <div className="w-12 h-12 bg-[#333333] rounded-lg flex items-center justify-center mr-4 shrink-0 relative z-10">
        {icon}
      </div>
      <div className="relative z-10">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  );
};

export default FeaturesSection;
