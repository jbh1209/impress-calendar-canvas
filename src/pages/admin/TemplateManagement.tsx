
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilePlus, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";

// Mock data for templates
const mockTemplates = [
  { 
    id: 1, 
    name: "Professional Calendar", 
    description: "Clean, corporate design with customizable accent colors.",
    category: "Corporate",
    isActive: true,
    baseImageUrl: "https://placehold.co/600x400/darkblue/white?text=Professional+Calendar",
    dimensions: "11x8.5",
    createdAt: "2025-03-15T10:30:00.000Z"
  },
  { 
    id: 2, 
    name: "Family Calendar", 
    description: "Warm, friendly design with large photo areas for family pictures.",
    category: "Personal",
    isActive: true,
    baseImageUrl: "https://placehold.co/600x400/darkgreen/white?text=Family+Calendar",
    dimensions: "12x12",
    createdAt: "2025-03-20T14:15:00.000Z"
  },
  { 
    id: 3, 
    name: "Landscape Seasons", 
    description: "Beautiful natural landscapes with seasonal themes for each month.",
    category: "Nature",
    isActive: false,
    baseImageUrl: "https://placehold.co/600x400/sienna/white?text=Landscape+Calendar",
    dimensions: "11x8.5",
    createdAt: "2025-04-05T09:45:00.000Z"
  },
];

const TemplateManagement = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState(mockTemplates);

  const handleDeleteTemplate = (id: number) => {
    setTemplates(templates.filter(template => template.id !== id));
    toast.success("Template deleted successfully");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Template Management</h1>
        <Button onClick={() => navigate("/admin/templates/create")}>
          <FilePlus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Dimensions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="w-16 h-16 overflow-hidden rounded">
                      <AspectRatio ratio={1}>
                        <img 
                          src={template.baseImageUrl} 
                          alt={template.name}
                          className="object-cover w-full h-full" 
                        />
                      </AspectRatio>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{template.name}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{template.category}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{template.category}</TableCell>
                  <TableCell className="hidden md:table-cell">{template.dimensions}</TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? "default" : "outline"}>
                      {template.isActive ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate(`/admin/templates/edit/${template.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the template "{template.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateManagement;
