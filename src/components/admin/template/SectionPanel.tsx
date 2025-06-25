
import { ReactNode } from "react";

interface SectionPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

const SectionPanel = ({ title, description, children }: SectionPanelProps) => {
  return (
    <div className="space-y-0.5">
      <div className="space-y-0">
        <h3 className="text-2xs font-medium text-gray-900 leading-none">{title}</h3>
        {description && (
          <p className="text-2xs text-gray-500 leading-none">{description}</p>
        )}
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

export default SectionPanel;
