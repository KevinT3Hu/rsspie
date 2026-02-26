'use client';

import { useState } from 'react';
import { Shield, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface SanitizedContentProps {
  sanitizedContent: string;
  originalContent: string | null | undefined;
  hasDangerousContent: boolean;
  hasImages: boolean;
  className?: string;
}

export function SanitizedContent({
  sanitizedContent,
  originalContent,
  hasDangerousContent,
  hasImages,
  className,
}: SanitizedContentProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  // Determine if we need to show the banner
  const needsSanitization = hasDangerousContent || hasImages;

  // If content was sanitized or has images, show the banner
  const showBanner = needsSanitization;

  // Content to display
  const displayContent = showOriginal && originalContent ? originalContent : sanitizedContent;

  return (
    <div className={className}>
      {showBanner && (
        <Alert
          variant={showOriginal ? "destructive" : "default"}
          className={cn(
            "mb-6",
            !showOriginal && "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400"
          )}
        >
          {showOriginal ? (
            <ShieldAlert className="h-5 w-5" />
          ) : (
            <Shield className="h-5 w-5" />
          )}
          <AlertTitle className={cn(
            !showOriginal && "text-amber-800 dark:text-amber-200"
          )}>
            {showOriginal
              ? "Showing Unsanitized Content"
              : "Content Sanitized for Security"
            }
          </AlertTitle>
          <AlertDescription className={cn(
            !showOriginal && "text-amber-700 dark:text-amber-300"
          )}>
            <div className="mt-1">
              {showOriginal ? (
                <>
                  The original content may contain scripts, tracking, or other potentially harmful elements.
                  View at your own risk.
                </>
              ) : (
                <>
                  This content has been filtered to remove potentially harmful elements
                  {hasImages && " and images"} for your safety.
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                variant={showOriginal ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOriginal(!showOriginal)}
                className={cn(
                  "h-8 text-xs",
                  !showOriginal && "border-amber-500/50 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                )}
              >
                {showOriginal ? (
                  <>
                    <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                    Show Sanitized
                  </>
                ) : (
                  <>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Show Original
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "prose prose-neutral dark:prose-invert max-w-none",
          showOriginal && "prose-invert-override"
        )}
        key={showOriginal ? 'original' : 'sanitized'}
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />

      {/* Additional warning when showing original content */}
      {showOriginal && (
        <div className="mt-8 p-4 border border-destructive/50 rounded-lg bg-destructive/10">
          <p className="text-sm text-destructive-foreground">
            <strong>Security Warning:</strong> You are viewing the original unsanitized content.
            Be cautious of phishing attempts, tracking pixels, or malicious scripts.
          </p>
        </div>
      )}
    </div>
  );
}
