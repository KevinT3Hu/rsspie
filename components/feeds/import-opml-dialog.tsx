'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, FileUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useLoading } from '@/hooks/use-loading';

interface ImportOPMLDialogProps {
  onImported?: () => void;
}

export function ImportOPMLDialog({ onImported }: ImportOPMLDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startLoading, stopLoading } = useLoading();
  const t = useTranslations();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file && (file.name.endsWith('.opml') || file.name.endsWith('.xml'))) {
      setSelectedFile(file);
    } else {
      toast.error(t('messages.invalidFileType'));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setIsLoading(true);
    startLoading(t('messages.importingFeeds'));
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await fetch('/api/opml/import', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to import feeds');
      }
      
      toast.success(data.message);
      setSelectedFile(null);
      setOpen(false);
      onImported?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('messages.errorImportingFeeds'));
    } finally {
      setIsLoading(false);
      stopLoading();
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          {t('settings.import')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('settings.importOpml')}</DialogTitle>
            <DialogDescription>
              {t('settings.importOpmlDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".opml,.xml"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              <FileUp className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              {selectedFile ? (
                <div>
                  <p className="font-medium text-primary">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">{t('settings.dropFileHere')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.orClickToBrowse')}
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.supportedFormats')}
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              {t('feed.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !selectedFile}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('settings.import')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
