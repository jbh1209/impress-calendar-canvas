
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Download, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Template } from "@/services/types/templateTypes";
import { generateCustomizedPDF } from "@/services/pdfGenerationService";
import { createOrder } from "@/services/orderService";

interface CustomerOrderSummaryProps {
  template: Template;
  customizations: any[];
  totalZones: number;
}

const CustomerOrderSummary: React.FC<CustomerOrderSummaryProps> = ({
  template,
  customizations,
  totalZones
}) => {
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  const basePrice = 29.99; // Base template price
  const zonePrice = 2.99; // Price per customization zone
  const totalPrice = basePrice + (totalZones * zonePrice);

  const handleGeneratePDF = async () => {
    if (!customerData.name || !customerData.email) {
      toast.error("Please fill in your name and email");
      return;
    }

    setIsGenerating(true);
    try {
      // Create order first
      const order = await createOrder({
        templateId: template.id,
        customizationData: { customizations, customerData },
        totalAmount: totalPrice
      });

      if (!order) {
        setIsGenerating(false);
        return;
      }

      // Generate PDF
      const result = await generateCustomizedPDF({
        templateId: template.id,
        customizations: customizations.map(custom => ({
          pageId: custom.pageId,
          zones: custom.zones || []
        })),
        customerData
      });

      if (result.success && result.pdfUrl) {
        setGeneratedPdfUrl(result.pdfUrl);
        toast.success("Your calendar is ready for download!");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{template.name}</h4>
              <p className="text-sm text-gray-600">{template.category}</p>
            </div>
            <Badge variant="secondary">{template.dimensions}</Badge>
          </div>
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Base Template</span>
            <span>${basePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Customizations ({totalZones} zones)</span>
            <span>${(totalZones * zonePrice).toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        {/* Customer Information */}
        <div className="space-y-3">
          <h5 className="font-medium text-sm">Customer Information</h5>
          <div className="space-y-2">
            <div>
              <Label htmlFor="customer-name" className="text-xs">Full Name *</Label>
              <Input
                id="customer-name"
                placeholder="Enter your full name"
                value={customerData.name}
                onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="customer-email" className="text-xs">Email Address *</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="Enter your email"
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="customer-phone" className="text-xs">Phone Number</Label>
              <Input
                id="customer-phone"
                placeholder="Enter your phone"
                value={customerData.phone}
                onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-2">
          {!generatedPdfUrl ? (
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGenerating || !customerData.name || !customerData.email}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Generate Calendar PDF
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={() => window.open(generatedPdfUrl, '_blank')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Your Calendar
            </Button>
          )}
          
          <p className="text-xs text-gray-500 text-center">
            Secure payment processing • High-quality PDF delivery
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerOrderSummary;
