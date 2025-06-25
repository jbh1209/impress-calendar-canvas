
import { ReactNode } from "react";

interface SectionPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const SectionPanel = ({ title, description, children }: SectionPanelProps) => {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default SectionPanel;
