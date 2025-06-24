
import { useState } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const designs = [
  {
    id: 1,
    name: "Corporate Elegance",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    price: "R799.95",
    features: [
      "A3 premium matte paper",
      "High-quality spiral binding",
      "Premium card stock covers",
      "12 months (Jan to Dec)",
      "Each calendar is handmade"
    ],
    description: "A classic luxury design perfect for corporate gifting. Features a sleek, modern look."
  },
  {
    id: 2,
    name: "Creative Inspiration",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    price: "R699.95",
    features: [],
    description: "Artistic calendar with nature themes for creative spaces and studios."
  }
];

const CalendarDesigns = () => {
  const [activeDesign, setActiveDesign] = useState(0);
  
  return (
    <div className="py-16 bg-darkSecondary">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-white">Choose Your Perfect Calendar Design</h2>
        <p className="text-gray-300 mb-10 text-center">
          Premium calendars with elegant designs, ready to be personalized to fit your style
        </p>
        
        <div className="mt-12">
          {/* Design Selector */}
          <div className="flex justify-center mb-12 space-x-2">
            <button 
              className={`px-4 py-1 rounded ${activeDesign === 0 ? 'bg-goldAccent text-black' : 'bg-darkBg text-white'}`}
              onClick={() => setActiveDesign(0)}
            >
              Corporate
            </button>
            <button 
              className={`px-4 py-1 rounded ${activeDesign === 1 ? 'bg-goldAccent text-black' : 'bg-darkBg text-white'}`}
              onClick={() => setActiveDesign(1)}
            >
              Creative
            </button>
            <button 
              className={`px-4 py-1 rounded ${activeDesign === 2 ? 'bg-goldAccent text-black' : 'bg-darkBg text-white'}`}
              onClick={() => setActiveDesign(2)}
            >
              Minimalist
            </button>
          </div>
          
          {/* Design Display */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img 
                src={designs[activeDesign]?.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e"} 
                alt={designs[activeDesign]?.name || "Calendar Design"} 
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="mt-4 bg-darkBg p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-white">{designs[activeDesign]?.name || "Corporate Elegance"}</h3>
                <p className="text-gray-300 mt-1">Perfect for corporate gifting and modern offices</p>
              </div>
            </div>
            
            <div className="bg-darkBg p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{designs[activeDesign]?.name || "Corporate Elegance"}</h3>
                <span className="text-xl font-bold text-white">{designs[activeDesign]?.price || "R799.95"}</span>
              </div>
              <p className="text-gray-300 mb-6">{designs[activeDesign]?.description || "A classic luxury design perfect for corporate gifting. Features a sleek, modern look."}</p>
              
              <h4 className="font-medium mb-4 text-white">Features:</h4>
              <ul className="space-y-2 mb-8">
                {designs[activeDesign]?.features?.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-goldAccent mr-2 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                )) || (
                  <>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-goldAccent mr-2 mt-0.5" />
                      <span className="text-gray-300">A3 premium matte paper</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-goldAccent mr-2 mt-0.5" />
                      <span className="text-gray-300">High-quality spiral binding</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-goldAccent mr-2 mt-0.5" />
                      <span className="text-gray-300">Premium card stock covers</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-goldAccent mr-2 mt-0.5" />
                      <span className="text-gray-300">12 months (Jan to Dec)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-goldAccent mr-2 mt-0.5" />
                      <span className="text-gray-300">Each calendar is handmade</span>
                    </li>
                  </>
                )}
              </ul>
              
              <div className="flex gap-4">
                <button className="bg-goldAccent text-black font-medium py-2 px-4 rounded hover:opacity-90 transition-opacity">Customize This Design</button>
                <Link to="/designs" className="border border-white text-white font-medium py-2 px-4 rounded hover:bg-white/10 transition-all">View All</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDesigns;
