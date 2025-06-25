
import { ReactNode } from "react";

interface SectionPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const SectionPanel = ({ title, description, children }: SectionPanelProps) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-xs text-gray-600">{description}</p>
        )}
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export default SectionPanel;
