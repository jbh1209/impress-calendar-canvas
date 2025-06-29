
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import type { TemplatePage } from "@/services/types/templateTypes";

interface TemplatePagesProps {
  pages: TemplatePage[];
  activePageIndex: number;
  onPageSelect: (index: number) => void;
}

const TemplatePages: React.FC<TemplatePagesProps> = ({
  pages,
  activePageIndex,
  onPageSelect
}) => {
  if (pages.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Pages ({pages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => onPageSelect(index)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                index === activePageIndex
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              Page {page.page_number}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatePages;
