import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistanceToNow(timestamp: number, locale: string = 'en'): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  const isZh = locale === 'zh';
  
  if (seconds < 60) return isZh ? '刚刚' : 'just now';
  if (minutes < 60) return isZh ? `${minutes}分钟前` : `${minutes}m ago`;
  if (hours < 24) return isZh ? `${hours}小时前` : `${hours}h ago`;
  if (days < 7) return isZh ? `${days}天前` : `${days}d ago`;
  if (weeks < 4) return isZh ? `${weeks}周前` : `${weeks}w ago`;
  if (months < 12) return isZh ? `${months}个月前` : `${months}mo ago`;
  return isZh ? `${years}年前` : `${years}y ago`;
}

export function formatDate(timestamp: number, locale: string = 'en'): string {
  return new Date(timestamp * 1000).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
