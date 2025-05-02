
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, ImageOff } from "lucide-react";
import { shutterstockService } from "@/services/shutterstockService";
import { useToast } from "@/hooks/use-toast";

export default function SelectedImages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: selections, isLoading, error } = useQuery({
    queryKey: ["shutterstock-selections"],
    queryFn: () => shutterstockService.getUserSelections(),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => shutterstockService.removeSelection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shutterstock-selections"] });
      toast({
        title: "Image removed",
        description: "The image has been removed from your selections.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove image: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-goldAccent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Error loading selections: {(error as Error).message}
      </div>
    );
  }

  if (!selections?.length) {
    return (
      <div className="text-center p-8 border border-dashed border-gray-600 rounded-md">
        <ImageOff className="h-12 w-12 mx-auto text-gray-500 mb-2" />
        <p className="text-gray-400">No images selected yet</p>
        <p className="text-xs text-gray-500 mt-1">Search for images and add them to your selections</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {selections.map((selection) => (
        <Card key={selection.id} className="overflow-hidden bg-darkSecondary border-darkBorder">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={selection.preview_url}
              alt="Selected image"
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-3">
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="destructive"
                className="px-2"
                onClick={() => removeMutation.mutate(selection.id)}
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
