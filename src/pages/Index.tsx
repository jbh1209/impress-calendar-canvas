import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ImageWithFallback from "@/components/ImageWithFallback";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";

const Index = () => {
  useEffect(() => {
    document.title = "Impress Calendars | Premium Calendar Printing";
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-muted to-background py-16 lg:py-24">
          <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl tracking-tight">Premium A2 Wire‑Bound Calendars</h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Personalize your business calendar with high-quality prints that make a lasting impression all year round.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/products">
                  <Button size="lg" className="text-lg px-8">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="/products">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Browse Designs
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-primary/10">
                <ImageWithFallback
                  src="/lovable-uploads/268e948a-5bf4-498b-892b-3ed5ed0e5ce5.png"
                  alt="Premium calendar sample"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3>Free Shipping</h3>
              <p className="text-sm text-muted-foreground">On qualifying orders</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3>Secure Payment</h3>
              <p className="text-sm text-muted-foreground">Protected checkout</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <h3>Easy Reorders</h3>
              <p className="text-sm text-muted-foreground">Save your designs</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <h3>Expert Support</h3>
              <p className="text-sm text-muted-foreground">Here to help</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl lg:text-4xl">Start your 2025 calendar today</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Choose a template, add your logo and photos, and we’ll handle the rest.</p>
            <a href="/products">
              <Button size="lg" variant="outline">View All Products</Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
