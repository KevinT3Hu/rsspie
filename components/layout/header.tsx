'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { SearchBar } from '@/components/shared/search-bar';

export function Header() {
  return (
    <header data-testid="header" className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1">
        <SearchBar />
      </div>
    </header>
  );
}
