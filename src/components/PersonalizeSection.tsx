
import { Calendar, ArrowRight } from "lucide-react";

const PersonalizeSection = () => {
  return (
    <div className="py-16 bg-darkBg">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-white">Personalize Your Calendar</h2>
        <p className="text-gray-300 mb-10 text-center">
          Make it truly yours with customized designs, images, and exclusive patterns to match your personality
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-darkSecondary rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2 text-white">Upload Your Logo</h3>
            <p className="text-gray-300 mb-4">Add your own company logo or brand elements to create branded calendars</p>
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center mb-4">
              <div className="p-3 bg-darkBg rounded-full mb-3">
                <Calendar className="h-6 w-6 text-goldAccent" />
              </div>
              <p className="text-center text-gray-300 mb-2">Drag and drop your logo here, or click to browse</p>
              <p className="text-xs text-gray-400">Supported formats: PNG, JPG (Max 5MB)</p>
            </div>
            
            <button className="border border-white text-white font-medium py-2 px-4 rounded hover:bg-white/10 transition-all w-full">Upload File</button>
          </div>
          
          <div className="bg-darkSecondary rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1500673922987-e212871fec22" 
              alt="Live Preview" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-white">Live Preview</h3>
              <p className="text-gray-300 mb-4">See how your calendar will look with real-time previews</p>
              <button className="border border-white text-white font-medium py-2 px-4 rounded hover:bg-white/10 transition-all">Continue to Preview</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizeSection;
