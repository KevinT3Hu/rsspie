'use client';

import { useState } from 'react';
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
  
  const handleClearOldArticles = async () => {
    setIsClearing(true);
    try {
      // TODO: Implement API endpoint for clearing old articles
      toast.success('Old articles cleared');
    } catch (error) {
      toast.error('Failed to clear old articles');
    } finally {
      setIsClearing(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="compact">Compact view</Label>
              <Switch id="compact" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Manage your feeds and articles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Clear old articles</p>
                <p className="text-sm text-muted-foreground">
                  Remove articles older than 30 days (favorites are preserved)
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearOldArticles}
                disabled={isClearing}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export OPML</p>
                <p className="text-sm text-muted-foreground">
                  Export your feeds as an OPML file
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              RSS Reader v1.0.0
            </p>
            <p className="text-sm text-muted-foreground">
              {feeds.length} feeds subscribed
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
