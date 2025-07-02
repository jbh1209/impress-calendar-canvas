import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { saveTemplate } from '@/services/templateService';
import { uploadPdfAndCreatePages } from '@/utils/pdfUpload';
import { supabase } from '@/integrations/supabase/client';
import { Zone, TemplatePage, TemplateState } from '@/components/admin/template/types/templateTypes';

export const useTemplateAdmin = () => {
  // Template state
  const [template, setTemplate] = useState<TemplateState>({
    id: '',
    name: '',
    description: '',
    category: 'Corporate',
    dimensions: '210x297',
    units: 'mm',
    isActive: false
  });

  // PDF and pages state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [currentPage, setCurrentPage] = useState<TemplatePage | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Zone management
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);

  // Save template function
  const handleSaveTemplate = useCallback(async () => {
    if (!template.name.trim()) {
      toast.error('Template name is required');
      return;
    }

    const result = await saveTemplate(template);
    if (result) {
      setTemplate(prev => ({ ...prev, id: result.id }));
      toast.success('Template saved successfully!');
    }
  }, [template]);

  // PDF upload function
  const handlePdfUpload = useCallback(async (file: File) => {
    if (!template.id) {
      toast.error('Please save the template first');
      return;
    }

    setIsUploading(true);
    setPdfFile(file);

    try {
      const result = await uploadPdfAndCreatePages(file, template.id);
      if (result.success) {
        setPdfUrl(result.pdfUrl || null);
        
        // Fetch the created pages
        const { data: pagesData, error } = await supabase
          .from('template_pages')
          .select('*')
          .eq('template_id', template.id)
          .order('page_number');

        if (error) {
          toast.error('Failed to load pages');
        } else {
          setPages(pagesData || []);
          if (pagesData && pagesData.length > 0) {
            setCurrentPage(pagesData[0]);
          }
        }
        toast.success('PDF uploaded and processed successfully!');
      } else {
        toast.error(result.message || 'PDF upload failed');
      }
    } catch (error) {
      toast.error('Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  }, [template.id]);

  // Zone management functions
  const addZone = useCallback((type: 'image' | 'text') => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name: `${type === 'image' ? 'Image' : 'Text'} Zone ${zones.length + 1}`,
      type,
      x: 50,
      y: 50,
      width: 100,
      height: type === 'text' ? 30 : 100
    };
    setZones(prev => [...prev, newZone]);
    setSelectedZone(newZone);
  }, [zones.length]);

  const updateZone = useCallback((updates: Partial<Zone>) => {
    if (!selectedZone) return;
    
    const updatedZone = { ...selectedZone, ...updates };
    setZones(zones.map(z => z.id === selectedZone.id ? updatedZone : z));
    setSelectedZone(updatedZone);
  }, [selectedZone, zones]);

  const deleteZone = useCallback((zoneId: string) => {
    setZones(zones.filter(z => z.id !== zoneId));
    if (selectedZone?.id === zoneId) {
      setSelectedZone(null);
    }
  }, [zones, selectedZone]);

  return {
    // State
    template,
    pdfFile,
    pdfUrl,
    pages,
    currentPage,
    isUploading,
    zones,
    selectedZone,
    isDrawing,
    drawStart,
    
    // Setters
    setTemplate,
    setCurrentPage,
    setSelectedZone,
    setIsDrawing,
    setDrawStart,
    
    // Handlers
    handleSaveTemplate,
    handlePdfUpload,
    addZone,
    updateZone,
    deleteZone
  };
};