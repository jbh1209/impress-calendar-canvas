
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TemplatePage } from "@/services/types/templateTypes";
import { FileText, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Page Navigation
          </CardTitle>
          <Badge variant="secondary">
            {pages.length} {pages.length === 1 ? 'page' : 'pages'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Page buttons with horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {pages.map((page, idx) => (
            <Button
              key={page.id}
              size="sm"
              variant={idx === activePageIndex ? "default" : "outline"}
              onClick={() => setActivePageIndex(idx)}
              className="min-w-0 flex-shrink-0"
            >
              Page {page.page_number}
            </Button>
          ))}
        </div>

        {/* Active page info */}
        {activePage && (
          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Eye className="h-4 w-4" />
              <span className="font-medium">Current: Page {activePage.page_number}</span>
            </div>
            {activePage.pdf_page_width && activePage.pdf_page_height && (
              <div className="text-xs text-gray-500 mt-1">
                Dimensions: {activePage.pdf_page_width} × {activePage.pdf_page_height} {activePage.pdf_units || 'pt'}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PageNavigator;
