'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Settings, Trash2, RefreshCw, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useFeeds } from '@/hooks/use-feeds';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { feeds, mutate } = useFeeds();
  const [isClearing, setIsClearing] = useState(false);
  const t = useTranslations();
  
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
              <Label htmlFor="compact">{t('settings.compactView')}</Label>
              <Switch id="compact" />
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
                <Trash2 className="mr-2 h-4 w-4" />
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
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {t('settings.export')}
              </Button>
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
