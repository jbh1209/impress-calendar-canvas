
import React from "react";
import { Button } from "@/components/ui/button";
import { TemplatePage } from "@/services/types/templateTypes";

interface TemplatePageNavigatorProps {
  pages: TemplatePage[];
  activePageIndex: number;
  setActivePageIndex: (idx: number) => void;
}

const TemplatePageNavigator: React.FC<TemplatePageNavigatorProps> = ({
  pages,
  activePageIndex,
  setActivePageIndex,
}) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      {pages.map((page, idx) => (
        <Button
          key={page.id}
          size="sm"
          variant={idx === activePageIndex ? "default" : "outline"}
          onClick={() => setActivePageIndex(idx)}
        >
          Page {page.page_number}
        </Button>
      ))}
    </div>
  );
};

export default TemplatePageNavigator;

