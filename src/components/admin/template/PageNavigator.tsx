
import React from "react";
import { Button } from "@/components/ui/button";
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
    <div className="bg-gray-50 rounded border border-gray-200 p-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-2xs font-medium flex items-center gap-1 leading-none">
          <FileText className="h-2.5 w-2.5" />
          Pages
        </h3>
        <Badge variant="secondary" className="text-2xs px-1 py-0 h-3">
          {pages.length}
        </Badge>
      </div>
      
      {/* Horizontal scrolling page buttons */}
      <div className="flex items-center gap-0.5 mb-1 overflow-x-auto">
        {pages.map((page, idx) => (
          <Button
            key={page.id}
            size="sm"
            variant={idx === activePageIndex ? "default" : "outline"}
            onClick={() => setActivePageIndex(idx)}
            className="h-5 text-2xs px-1.5 min-w-0 flex-shrink-0"
          >
            P{page.page_number}
          </Button>
        ))}
      </div>

      {activePage && (
        <div className="bg-white rounded border border-gray-100 px-1.5 py-0.5 text-2xs text-gray-600">
          <div className="flex items-center gap-2 leading-none">
            <div className="flex items-center gap-0.5">
              <Eye className="h-2 w-2" />
              <span>P{activePage.page_number}</span>
            </div>
            {activePage.pdf_page_width && activePage.pdf_page_height && (
              <div className="truncate">
                {activePage.pdf_page_width}×{activePage.pdf_page_height} {activePage.pdf_units || 'pt'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageNavigator;
