
import { ReactNode } from "react";

interface SectionPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const SectionPanel = ({ title, description, children }: SectionPanelProps) => {
  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        <h3 className="text-xs font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="text-xs text-gray-500 leading-tight">{description}</p>
        )}
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

export default SectionPanel;
