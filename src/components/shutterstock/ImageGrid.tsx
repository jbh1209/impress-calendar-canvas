
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShutterstockImage } from "@/services/shutterstockService";
import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageGridProps {
  images: ShutterstockImage[];
  onSelect: (image: ShutterstockImage) => Promise<void>;
}

export default function ImageGrid({ images, onSelect }: ImageGridProps) {
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  const handleSelect = async (image: ShutterstockImage) => {
    try {
      setLoadingIds(prev => ({ ...prev, [image.id]: true }));
      await onSelect(image);
      setSelectedIds(prev => ({ ...prev, [image.id]: true }));
    } catch (error) {
      console.error("Error selecting image:", error);
    } finally {
      setLoadingIds(prev => ({ ...prev, [image.id]: false }));
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden bg-darkSecondary border-darkBorder">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={image.assets.preview.url}
              alt={image.description || "Shutterstock image"}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400 truncate flex-1 mr-2">
                ID: {image.id}
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={selectedIds[image.id] ? "secondary" : "outline"}
                      className="px-2"
                      onClick={() => handleSelect(image)}
                      disabled={selectedIds[image.id] || loadingIds[image.id]}
                    >
                      {loadingIds[image.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : selectedIds[image.id] ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectedIds[image.id] ? "Selected" : "Add to selections"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
