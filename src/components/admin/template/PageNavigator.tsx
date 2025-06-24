
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TemplatePage } from "@/services/types/templateTypes";
import { FileText, Eye } from "lucide-react";

interface PageNavigatorProps {
  pages: TemplatePage[];
  activePageIndex: number;
  setActivePageIndex: (idx: number) => void;
  templateData?: any;
}

const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  activePageIndex,
  setActivePageIndex,
  templateData,
}) => {
  const activePage = pages[activePageIndex];

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Page Navigation
          </h3>
          <Badge variant="secondary">
            {pages.length} page{pages.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          {pages.map((page, idx) => (
            <Button
              key={page.id}
              size="sm"
              variant={idx === activePageIndex ? "default" : "outline"}
              onClick={() => setActivePageIndex(idx)}
              className="min-w-[80px]"
            >
              Page {page.page_number}
            </Button>
          ))}
        </div>

        {activePage && (
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>Active: Page {activePage.page_number}</span>
              </div>
              {activePage.pdf_page_width && activePage.pdf_page_height && (
                <div>
                  PDF Size: {activePage.pdf_page_width}×{activePage.pdf_page_height} {activePage.pdf_units || 'pt'}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PageNavigator;
