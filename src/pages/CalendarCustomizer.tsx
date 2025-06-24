
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import CustomerCanvas from "@/components/customer/CustomerCanvas";
import CustomerZoneEditor from "@/components/customer/CustomerZoneEditor";
import CustomerPageNavigator from "@/components/customer/CustomerPageNavigator";
import { getTemplateById } from "@/services/templateService";
import { getTemplatePages } from "@/services/templatePageService";
import { Template, TemplatePage } from "@/services/types/templateTypes";

const CalendarCustomizer: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [customerDesign, setCustomerDesign] = useState<any>({});

  const activePage = pages[activePageIndex];

  useEffect(() => {
    const loadTemplateData = async () => {
      if (!templateId) {
        toast.error("No template specified");
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        
        // Load template and pages
        const [templateData, pagesData] = await Promise.all([
          getTemplateById(templateId),
          getTemplatePages(templateId)
        ]);

        if (!templateData) {
          toast.error("Template not found");
          navigate("/");
          return;
        }

        setTemplate(templateData);
        setPages(pagesData);
        
        // Initialize customer design state
        const initialDesign: any = {};
        pagesData.forEach(page => {
          initialDesign[page.id] = {
            zones: {},
            customizations: {}
          };
        });
        setCustomerDesign(initialDesign);
        
      } catch (error) {
        console.error("Error loading template:", error);
        toast.error("Failed to load template");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplateData();
  }, [templateId, navigate]);

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    toast.success("Added to cart! (Cart functionality coming soon)");
  };

  const handleSaveDesign = () => {
    // TODO: Implement design saving
    console.log("Saving customer design:", customerDesign);
    toast.success("Design saved! (Save functionality coming soon)");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading Calendar Designer...</div>
          <div className="text-sm text-gray-500">Preparing your customization canvas</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Templates
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Customize: {template?.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{template?.category}</Badge>
                  {template?.dimensions && (
                    <Badge variant="outline">{template.dimensions}</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDesign}
              >
                Save Design
              </Button>
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {pages.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Canvas Area */}
            <div className="lg:col-span-3 space-y-4">
              <CustomerPageNavigator
                pages={pages}
                activePageIndex={activePageIndex}
                setActivePageIndex={setActivePageIndex}
              />
              
              <Card>
                <CardContent className="p-6">
                  <CustomerCanvas
                    template={template}
                    activePage={activePage}
                    customerDesign={customerDesign}
                    setCustomerDesign={setCustomerDesign}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Editing Panel */}
            <div className="lg:col-span-1">
              <CustomerZoneEditor
                activePage={activePage}
                customerDesign={customerDesign}
                setCustomerDesign={setCustomerDesign}
              />
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-lg text-gray-700 mb-2">
                Template Not Ready
              </div>
              <div className="text-gray-500 mb-4">
                This template hasn't been processed yet. Please try again later.
              </div>
              <Button onClick={() => navigate("/")} variant="outline">
                Browse Other Templates
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CalendarCustomizer;
