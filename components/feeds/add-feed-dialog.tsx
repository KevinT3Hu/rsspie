'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addFeed } from '@/hooks/use-feeds';
import { useLoading } from '@/hooks/use-loading';
import { toast } from 'sonner';

interface AddFeedDialogProps {
  onFeedAdded?: () => void;
  categories?: string[];
}

export function AddFeedDialog({ onFeedAdded, categories = [] }: AddFeedDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { startLoading, stopLoading } = useLoading();
  const t = useTranslations();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    startLoading(t('messages.addingFeed'));
    try {
      await addFeed(url, category || undefined);
      toast.success(t('messages.feedAdded'));
      setUrl('');
      setCategory('');
      setOpen(false);
      onFeedAdded?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('messages.errorAddingFeed'));
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          {t('nav.addFeed')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('feed.addNewFeed')}</DialogTitle>
            <DialogDescription>
              {t('feed.addFeedDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">{t('feed.feedUrl')}</Label>
              <Input
                id="url"
                placeholder="https://example.com/feed.xml"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">{t('feed.categoryOptional')}</Label>
              <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={t('feed.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={t('feed.typeNewCategory')}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !url.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('nav.addFeed')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
