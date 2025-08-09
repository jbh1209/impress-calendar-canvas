import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      {/* Newsletter Section */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h3 className="text-2xl">Stay Connected</h3>
            <p className="text-primary-foreground/80">
              Subscribe to our newsletter for exclusive offers and the latest updates
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white text-foreground"
              />
              <Button variant="secondary">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg">STOREFRONT</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted partner for quality products and exceptional service. 
              We're committed to bringing you the best shopping experience.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4>Quick Links</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                About Us
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Size Guide
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Careers
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4>Customer Service</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Shipping Info
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Returns & Exchanges
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Track Your Order
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4>Get in Touch</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@storefront.com</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>1-800-STOREFRONT</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>123 Commerce St, City, ST 12345</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Customer Service Hours:</p>
              <p>Mon-Fri: 9AM-8PM EST</p>
              <p>Sat-Sun: 10AM-6PM EST</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 STOREFRONT. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Accessibility
            </a>
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Secure payments by</span>
            <div className="flex space-x-1">
              <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-400 rounded text-white text-xs flex items-center justify-center">
                VISA
              </div>
              <div className="w-8 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded text-white text-xs flex items-center justify-center">
                MC
              </div>
              <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded text-white text-xs flex items-center justify-center">
                AMEX
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}