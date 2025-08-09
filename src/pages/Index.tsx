import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

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
          <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl tracking-tight">Premium A2 Wire-Bound Calendars</h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Personalize your business calendar with high‑quality prints that make a lasting impression all year round.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/products">
                  <Button size="lg">Shop Calendars</Button>
                </a>
                <a href="/products">
                  <Button variant="outline" size="lg">Browse Designs</Button>
                </a>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-primary/10 aspect-[16/10]"></div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <h3>Free Shipping</h3>
              <p className="text-sm text-muted-foreground">On qualifying orders</p>
            </div>
            <div>
              <h3>Secure Payment</h3>
              <p className="text-sm text-muted-foreground">Protected checkout</p>
            </div>
            <div>
              <h3>Easy Reorders</h3>
              <p className="text-sm text-muted-foreground">Save your designs</p>
            </div>
            <div>
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
