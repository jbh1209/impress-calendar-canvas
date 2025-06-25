
import { ReactNode } from "react";

interface SectionPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const SectionPanel = ({ title, description, children }: SectionPanelProps) => {
  return (
    <div className="space-y-1">
      <div className="space-y-0">
        <h3 className="text-xs font-medium text-gray-900 leading-tight">{title}</h3>
        {description && (
          <p className="text-xs text-gray-500 leading-tight">{description}</p>
        )}
      </div>
      <div className="space-y-1.5">
        {children}
      </div>
    </div>
  );
};

export default SectionPanel;
