
import { Check, CalendarDays, Award, Printer, CreditCard } from "lucide-react";

const FeaturesSection = () => {
  return (
    <div className="py-16 bg-darkSecondary">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Premium Calendar Features</h2>
        <p className="section-subtitle text-center">
          Our A2 landscape calendars combine exceptional quality with practical design to create a
          calendar that's perfect for your needs
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <FeatureCard 
            icon={<CalendarDays className="feature-icon" />}
            title="Custom Options"
            description="Personalize every aspect from dates to images, creating a truly unique calendar"
          />
          
          <FeatureCard 
            icon={<Award className="feature-icon" />}
            title="Premium Quality"
            description="High quality materials ensure your calendar looks beautiful throughout the year"
          />
          
          <FeatureCard 
            icon={<Printer className="feature-icon" />}
            title="Vibrant Printing"
            description="Our advanced printing technology delivers vivid colors and sharp details"
          />
          
          <FeatureCard 
            icon={<CreditCard className="feature-icon" />}
            title="Secure Payments"
            description="Encrypted checkout with multiple payment options for your convenience"
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
    <div className="bg-darkBg rounded-lg p-6 flex flex-col items-center text-center">
      {icon}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default FeaturesSection;
