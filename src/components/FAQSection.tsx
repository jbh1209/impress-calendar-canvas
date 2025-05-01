
import { useState } from "react";
import { ChevronRight } from "lucide-react";

const faqs = [
  {
    question: "What sizes are the calendars?",
    answer: "Our premium calendars come in A2 landscape format (594 × 420 mm). We also offer A3 and A4 sizes upon request."
  },
  {
    question: "How can I customize my calendar?",
    answer: "You can customize your calendar by uploading your own images, adding company logos, choosing different layout templates, and even selecting special dates to highlight."
  },
  {
    question: "What is the printing and paper quality?",
    answer: "We use premium 170gsm silk paper for calendar pages and 250gsm cardstock for covers. All calendars are printed using high-quality digital printing for vibrant colors and sharp images."
  },
  {
    question: "How long does production and delivery take?",
    answer: "Standard production takes 3-5 business days, with delivery times varying based on your location (typically 2-4 additional business days within South Africa)."
  },
  {
    question: "What payment options do you accept?",
    answer: "We accept all major credit cards, EFT payments, PayFast, and SnapScan for your convenience."
  },
  {
    question: "Can I order a small sample before placing a larger order?",
    answer: "Yes, we offer sample calendars at a discounted rate so you can verify the quality before placing a larger order. Please contact our team for more details."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <div className="py-16 bg-darkSecondary">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Frequently Asked Questions</h2>
        <p className="section-subtitle text-center">
          Find answers to common questions about our products, ordering process, and delivery options
        </p>
        
        <div className="mt-12 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border-b border-darkBorder"
            >
              <button
                className="w-full flex justify-between items-center py-4 text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="font-medium">{faq.question}</h3>
                <ChevronRight 
                  className={`h-5 w-5 transition-transform ${openIndex === index ? 'transform rotate-90' : ''}`} 
                />
              </button>
              {openIndex === index && (
                <div className="pb-4 text-gray-400">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
