
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function TemplateStatusAndCategorySection({ template, setTemplate }) {
  return (
    <section className="flex flex-col md:flex-row gap-6 items-center md:items-end">
      <div className="flex-1">
        <Label htmlFor="category" className="font-semibold text-base text-gray-800 mb-1 inline-block">Category</Label>
        <Select
          value={template.category}
          onValueChange={value => setTemplate({ ...template, category: value })}
        >
          <SelectTrigger id="category" className="bg-white border border-gray-200 rounded-lg h-12 text-base" >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Corporate">Corporate</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Nature">Nature</SelectItem>
            <SelectItem value="Seasonal">Seasonal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-3 items-center h-12">
        <Switch
          id="active-status"
          checked={!!template.isActive}
          onCheckedChange={checked => setTemplate({ ...template, isActive: checked })}
        />
        <Label htmlFor="active-status" className="text-muted-foreground text-xs font-normal">
          Active (Visible to customers)
        </Label>
      </div>
    </section>
  );
}
