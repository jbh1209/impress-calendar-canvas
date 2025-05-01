
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CalendarDesigns from "@/components/CalendarDesigns";
import PersonalizeSection from "@/components/PersonalizeSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-darkBg">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CalendarDesigns />
        <PersonalizeSection />
        <FeaturesSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
