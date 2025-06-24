
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    rating: 5,
    text: "The calendar quality exceeded my expectations. The images are crisp, and the paper stock is premium. Well worth the price!",
    author: "Thomas Johnson",
    position: "Marketing Director"
  },
  {
    id: 2,
    rating: 5,
    text: "These calendars make perfect gifts for our clients. The customization options are excellent, and delivery was faster than expected.",
    author: "Sarah Williams",
    position: "HR Manager"
  },
  {
    id: 3,
    rating: 4,
    text: "The personalized calendars for our team were beautiful! Everyone loved having their names and company branding integrated thoughtfully.",
    author: "Michael Smith",
    position: "CEO"
  }
];

const TestimonialsSection = () => {
  return (
    <div className="py-16 bg-darkBg">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-white">What Our Customers Say</h2>
        <p className="text-gray-300 mb-10 text-center">
          From personal users to major corporations, here's what people are saying about our premium calendars
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-darkSecondary rounded-lg p-6">
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonial.rating ? 'text-goldAccent fill-goldAccent' : 'text-gray-400'}`} 
                  />
                ))}
              </div>
              <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-goldAccent rounded-full flex items-center justify-center mr-3">
                  <span className="font-bold text-black">{testimonial.author.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
