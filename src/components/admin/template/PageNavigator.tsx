
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TemplatePage } from "@/services/types/templateTypes";
import { FileText, Eye } from "lucide-react";
import { formatDimensions } from "./utils/unitConversions";

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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <span className="font-medium text-gray-900">Pages</span>
          <Badge variant="secondary" className="ml-1">
            {pages.length}
          </Badge>
        </div>

        {/* Page buttons - Fixed sizing */}
        <div className="flex items-center gap-2">
          {pages.map((page, idx) => (
            <Button
              key={page.id}
              size="sm"
              variant={idx === activePageIndex ? "default" : "outline"}
              onClick={() => setActivePageIndex(idx)}
              className="px-3 py-1 text-sm whitespace-nowrap"
            >
              Page {page.page_number}
            </Button>
          ))}
        </div>
      </div>

      {/* Active page info */}
      {activePage && (
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>Page {activePage.page_number}</span>
          </div>
          {activePage.pdf_page_width && activePage.pdf_page_height && (
            <span className="text-gray-500">
              {formatDimensions(
                activePage.pdf_page_width, 
                activePage.pdf_page_height, 
                activePage.pdf_units || 'pt'
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PageNavigator;
