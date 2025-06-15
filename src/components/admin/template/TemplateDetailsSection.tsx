
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function TemplateDetailsSection({ template, setTemplate }) {
  return (
    <section className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Label htmlFor="template-name" className="font-semibold text-base text-gray-800">Template Name <span className="text-red-500">*</span></Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-xs">
                <span>This name appears to customers and in the admin dashboard. Example: “Modern Wall Calendar”.</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="template-name"
          value={template.name}
          onChange={e => setTemplate({ ...template, name: e.target.value })}
          maxLength={60}
          placeholder="e.g. Modern Wall Calendar"
          required
          className="h-12 bg-white border border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-primary text-base"
        />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Label htmlFor="description" className="font-semibold text-base text-gray-800">Description</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-xs">
                <span>Optional. Help users understand the purpose or aesthetic of your template.</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="description"
          value={template.description}
          onChange={e => setTemplate({ ...template, description: e.target.value })}
          placeholder="Describe your template (optional)"
          maxLength={250}
          className="min-h-[80px] bg-white border border-gray-200 rounded-lg text-base focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
    </section>
  );
}
