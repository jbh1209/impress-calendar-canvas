import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { pitchprintService, PitchPrintCategory, PitchPrintDesign } from '@/services/pitchprintService';
import { toast } from 'sonner';

interface PitchPrintDesignBrowserProps {
  selectedDesignId?: string;
  onDesignSelect: (design: PitchPrintDesign) => void;
}

export function PitchPrintDesignBrowser({ selectedDesignId, onDesignSelect }: PitchPrintDesignBrowserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<PitchPrintCategory[]>([]);
  const [designs, setDesigns] = useState<PitchPrintDesign[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<PitchPrintDesign | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCategory) {
      loadDesigns(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const fetchedCategories = await pitchprintService.fetchDesignCategories();
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) {
        setSelectedCategory(fetchedCategories[0].id);
      }
    } catch (error) {
      toast.error('Failed to load design categories');
    } finally {
      setLoading(false);
    }
  };

  const loadDesigns = async (categoryId: string) => {
    setLoading(true);
    try {
      const designList = await pitchprintService.fetchDesigns(categoryId);
      setDesigns(designList.designs);
    } catch (error) {
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  const handleDesignSelect = (design: PitchPrintDesign) => {
    setSelectedDesign(design);
    onDesignSelect(design);
    setIsOpen(false);
  };

  const filteredDesigns = designs.filter(design =>
    design.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {selectedDesignId && (
        <div className="flex items-center gap-2 p-2 border rounded-md">
          <ImageIcon className="h-4 w-4" />
          <span className="text-sm">Design ID: {selectedDesignId}</span>
        </div>
      )}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            {selectedDesignId ? 'Change Design' : 'Browse PitchPrint Designs'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select PitchPrint Design</DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-4 h-[60vh]">
            {/* Categories Sidebar */}
            <div className="w-64 border-r">
              <div className="p-3 border-b">
                <h3 className="font-medium">Categories</h3>
              </div>
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Designs Grid */}
            <div className="flex-1">
              <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Search designs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
              
              <ScrollArea className="h-full p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {filteredDesigns.map((design) => (
                      <div
                        key={design.id}
                        className="border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleDesignSelect(design)}
                      >
                        {design.thumbnail ? (
                          <img
                            src={design.thumbnail}
                            alt={design.name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        ) : (
                          <div className="w-full h-32 bg-muted rounded mb-2 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <h4 className="font-medium text-sm truncate">{design.name}</h4>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {design.id}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}