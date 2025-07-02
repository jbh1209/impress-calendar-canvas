import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Eye, Upload } from 'lucide-react';
import TemplateSettings from '@/components/admin/template/TemplateSettings';
import TemplateCanvas from '@/components/admin/template/TemplateCanvas';
import PDFManager from '@/components/admin/template/PDFManager';
import ZoneEditor from '@/components/admin/template/ZoneEditor';

const TemplateAdmin: React.FC = () => {
  const [templateData, setTemplateData] = useState({
    id: '',
    name: '',
    description: '',
    category: 'Corporate',
    is_active: false,
    base_image_url: null,
    dimensions: '210x297',
    created_at: new Date().toISOString(),
    units: 'mm',
    bleed: { top: 3, right: 3, bottom: 3, left: 3, units: 'mm' }
  });
  
  const [templateId, setTemplateId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'details' | 'pdf' | 'zones'>('details');
  const [templatePages, setTemplatePages] = useState([]);
  const [activePage, setActivePage] = useState(null);

  const handleSave = () => {
    console.log('Saving template:', templateData);
  };

  const handlePreview = () => {
    console.log('Preview template');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Template Admin</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage calendar templates
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Template Configuration</h2>
            
            {/* Step Navigation */}
            <div className="flex flex-col space-y-2 mt-4">
              <Button
                variant={currentStep === 'details' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentStep('details')}
                className="justify-start"
              >
                1. Template Details
              </Button>
              <Button
                variant={currentStep === 'pdf' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentStep('pdf')}
                className="justify-start"
              >
                2. PDF Upload
              </Button>
              <Button
                variant={currentStep === 'zones' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentStep('zones')}
                className="justify-start"
                disabled={!activePage}
              >
                3. Zone Editor
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {currentStep === 'details' && (
              <TemplateSettings 
                template={templateData}
                setTemplate={setTemplateData}
                templateId={templateId}
                setTemplateId={setTemplateId}
                isLoading={false}
              />
            )}
            
            {currentStep === 'pdf' && (
              <div className="p-4">
                <PDFManager 
                  onPagesChange={setTemplatePages}
                  onPageSelect={setActivePage}
                />
              </div>
            )}
            
            {currentStep === 'zones' && activePage && (
              <div className="p-4">
                <ZoneEditor activePage={activePage} />
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-muted/10">
            {currentStep === 'details' && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-muted-foreground">Template Details</h3>
                <p className="text-sm text-muted-foreground mt-2">Configure your template settings in the sidebar</p>
              </div>
            )}
            
            {currentStep === 'pdf' && !activePage && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-muted-foreground">Upload PDF</h3>
                <p className="text-sm text-muted-foreground mt-2">Upload a PDF to begin creating zones</p>
              </div>
            )}
            
            {currentStep === 'pdf' && activePage && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-foreground">PDF Page {activePage.page_number}</h3>
                <p className="text-sm text-muted-foreground mt-2">Preview of uploaded PDF page</p>
              </div>
            )}
            
            {currentStep === 'zones' && activePage && (
              <div className="text-center">
                <h3 className="text-lg font-medium text-foreground">Zone Editor</h3>
                <p className="text-sm text-muted-foreground mt-2">Create and edit customization zones</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateAdmin;