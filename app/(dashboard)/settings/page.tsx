'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Trash2, Loader2, Download, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useFeeds } from '@/hooks/use-feeds';
import { useCompact } from '@/components/compact-provider';
import { toast } from 'sonner';
import { ImportOPMLDialog } from '@/components/feeds/import-opml-dialog';

export default function SettingsPage() {
  const { feeds, mutate } = useFeeds();
  const { isCompact, setCompactMode } = useCompact();
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const t = useTranslations();
  
  const handleToggleCompact = (checked: boolean) => {
    setCompactMode(checked ? 'compact' : 'comfortable');
    toast.success(t(checked ? 'messages.compactModeEnabled' : 'messages.compactModeDisabled'));
  };
  
  const handleClearOldArticles = async () => {
    setIsClearing(true);
    try {
      // TODO: Implement API endpoint for clearing old articles
      toast.success(t('messages.oldArticlesCleared'));
    } catch (error) {
      toast.error(t('messages.errorClearingOld'));
    } finally {
      setIsClearing(false);
    }
  };
  
  const handleExportOPML = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/opml/export');
      
      if (!response.ok) {
        throw new Error('Failed to export feeds');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rsspie-feeds.opml';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(t('messages.opmlExported'));
    } catch (error) {
      toast.error(t('messages.errorExportingOpml'));
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImportSuccess = () => {
    mutate();
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appearance')}</CardTitle>
            <CardDescription>{t('settings.appearanceDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact" className="cursor-pointer">
                  {t('settings.compactView')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.compactViewDescription')}
                </p>
              </div>
              <Switch 
                id="compact" 
                checked={isCompact}
                onCheckedChange={handleToggleCompact}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.dataManagement')}</CardTitle>
            <CardDescription>{t('settings.dataManagementDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.clearOldArticles')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.clearOldArticlesDescription')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearOldArticles}
                disabled={isClearing}
              >
                {isClearing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {t('settings.clear')}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.exportOpml')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.exportOpmlDescription')}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportOPML}
                disabled={isExporting || feeds.length === 0}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {t('settings.export')}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.importOpml')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.importOpmlDescription')}
                </p>
              </div>
              <ImportOPMLDialog onImported={handleImportSuccess} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.about')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('settings.version')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('settings.feedsSubscribed', { count: feeds.length })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
