
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <div className="py-16 bg-darkBg">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Create Your Custom Calendar?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Start designing your personalized calendar today and enjoy our premium quality printing, fast delivery, and exceptional customer service.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/design" className="gold-button">
              Start Designing
            </Link>
            <Link to="/contact" className="outline-button">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
