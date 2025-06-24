
import { useState, useEffect } from "react";
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
import { getAllTemplates, deleteTemplate, Template } from "@/services/templateService";

const TemplateManagement = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const data = await getAllTemplates();
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to load templates");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleDeleteTemplate = async (id: string) => {
    try {
      const success = await deleteTemplate(id);
      if (success) {
        setTemplates(templates.filter(template => template.id !== id));
        toast.success("Template deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Template Management</h1>
        <Button onClick={() => navigate("/admin/templates/create")} className="gap-2">
          <FilePlus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-300">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">No templates found</p>
              <Button onClick={() => navigate("/admin/templates/create")}>
                Create your first template
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700">
                  <TableHead className="text-gray-900 dark:text-white">Preview</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Name</TableHead>
                  <TableHead className="hidden md:table-cell text-gray-900 dark:text-white">Category</TableHead>
                  <TableHead className="hidden md:table-cell text-gray-900 dark:text-white">Dimensions</TableHead>
                  <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                  <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell>
                      <div className="w-16 h-16 overflow-hidden rounded border border-gray-200 dark:border-gray-600">
                        <AspectRatio ratio={1}>
                          <img 
                            src={template.base_image_url || 'https://placehold.co/600x400/gray/white?text=No+Image'} 
                            alt={template.name}
                            className="object-cover w-full h-full" 
                          />
                        </AspectRatio>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      <div>{template.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">{template.category}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-700 dark:text-gray-300">{template.category}</TableCell>
                    <TableCell className="hidden md:table-cell text-gray-700 dark:text-gray-300">{template.dimensions}</TableCell>
                    <TableCell>
                      <Badge variant={template.is_active ? "default" : "outline"} className={template.is_active ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-700 border-gray-300"}>
                        {template.is_active ? "Active" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => navigate(`/admin/templates/edit/${template.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-gray-900 dark:text-white">Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                                This will permanently delete the template "{template.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateManagement;
