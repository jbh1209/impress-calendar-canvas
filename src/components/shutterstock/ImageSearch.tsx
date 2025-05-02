
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X } from "lucide-react";
import { shutterstockService, ShutterstockImage, ShutterstockSearchOptions } from "@/services/shutterstockService";
import ImageGrid from "./ImageGrid";

export default function ImageSearch() {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState<ShutterstockSearchOptions>({
    perPage: 20,
    page: 1
  });
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["shutterstock", searchTerm, page, options],
    queryFn: () => shutterstockService.search(searchTerm, { ...options, page }),
    enabled: !!searchTerm,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
    setPage(1);
  };
  
  const clearSearch = () => {
    setQuery("");
    setSearchTerm("");
  };
  
  const handleSaveSelection = async (image: ShutterstockImage) => {
    try {
      await shutterstockService.saveSelection(
        image.id,
        image.assets.small_thumb.url,
        image.assets.preview.url
      );
      // Show success message
    } catch (error) {
      console.error("Error saving selection:", error);
      // Show error message
    }
  };
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for images..."
            className="pr-8"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <Button type="submit" disabled={isLoading || !query}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Search
        </Button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          Error: {(error as Error).message}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">
              {data.total_count} results found
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <span className="flex items-center px-2">
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!data || page * options.perPage! >= data.total_count}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
          
          <ImageGrid 
            images={data.data} 
            onSelect={handleSaveSelection} 
          />
        </div>
      )}
    </div>
  );
}
