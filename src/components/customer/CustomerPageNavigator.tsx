
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TemplatePage } from "@/services/types/templateTypes";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface CustomerPageNavigatorProps {
  pages: TemplatePage[];
  activePageIndex: number;
  setActivePageIndex: (idx: number) => void;
}

const CustomerPageNavigator: React.FC<CustomerPageNavigatorProps> = ({
  pages,
  activePageIndex,
  setActivePageIndex,
}) => {
  const canGoPrevious = activePageIndex > 0;
  const canGoNext = activePageIndex < pages.length - 1;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Page {activePageIndex + 1} of {pages.length}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {pages[activePageIndex]?.page_number ? `Page ${pages[activePageIndex].page_number}` : 'Current'}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePageIndex(activePageIndex - 1)}
              disabled={!canGoPrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {pages.map((_, idx) => (
              <Button
                key={idx}
                variant={idx === activePageIndex ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePageIndex(idx)}
                className="h-8 min-w-[32px] text-xs"
              >
                {idx + 1}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePageIndex(activePageIndex + 1)}
              disabled={!canGoNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerPageNavigator;
