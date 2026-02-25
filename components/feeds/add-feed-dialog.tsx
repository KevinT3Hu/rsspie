'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      await addFeed(url, category || undefined);
      toast.success('Feed added successfully');
      setUrl('');
      setCategory('');
      setOpen(false);
      onFeedAdded?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add feed');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Feed
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Feed</DialogTitle>
            <DialogDescription>
              Enter the URL of the RSS feed you want to subscribe to.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">Feed URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/feed.xml"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category or type new one" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Or type new category"
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
              Add Feed
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
