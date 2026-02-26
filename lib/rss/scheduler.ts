import { refreshFeed } from './fetcher';
import { getAllFeeds, getFeedById } from '@/lib/db/feeds';
import { Feed } from '@/types';

// Map to store active feed timers
const feedTimers = new Map<number, NodeJS.Timeout>();

// Default sync interval in milliseconds (30 minutes)
const DEFAULT_SYNC_INTERVAL_MS = 30 * 60 * 1000;

// Get sync interval from environment or use default
const SYNC_INTERVAL_MS = parseInt(process.env.FETCH_INTERVAL_MINUTES || '30') * 60 * 1000;

/**
 * Calculate the next sync time for a feed
 * Uses last_fetched_at if available (for manual/auto syncs), otherwise created_at
 * This ensures manual syncs reset the schedule
 */
export function calculateNextSyncTime(feed: Feed): number {
  const now = Date.now();
  const interval = SYNC_INTERVAL_MS;
  
  // Use last_fetched_at as anchor if available (resets schedule on manual sync)
  // Otherwise fall back to created_at (initial schedule for new feeds)
  const anchorTime = feed.lastFetchedAt 
    ? feed.lastFetchedAt * 1000  // Use last sync time as anchor
    : feed.createdAt * 1000;      // Use creation time for new feeds
  
  // Calculate how many intervals have passed since anchor time
  const intervalsPassed = Math.floor((now - anchorTime) / interval);
  
  // Next sync is at the next interval boundary from the anchor
  const nextSync = anchorTime + ((intervalsPassed + 1) * interval);
  
  return nextSync;
}

/**
 * Calculate the delay until the next sync for a feed
 */
function calculateSyncDelay(feed: Feed): number {
  const nextSync = calculateNextSyncTime(feed);
  const delay = nextSync - Date.now();
  
  // If the calculated time is in the past, sync immediately
  return Math.max(0, delay);
}

/**
 * Sync a single feed and schedule the next sync
 */
async function syncFeed(feedId: number): Promise<void> {
  console.log(`[Scheduler] Syncing feed ${feedId} at ${new Date().toISOString()}`);
  
  try {
    const result = await refreshFeed(feedId);
    
    if (result.success) {
      console.log(`[Scheduler] Feed ${feedId} synced successfully, new articles: ${result.newArticles}`);
    } else {
      console.log(`[Scheduler] Feed ${feedId} sync failed: ${result.error}`);
    }
  } catch (error) {
    console.error(`[Scheduler] Unexpected error syncing feed ${feedId}:`, error);
  }
  
  // Re-schedule the next sync
  // We re-fetch the feed to get updated last_fetched_at
  const updatedFeed = await getFeedById(feedId);
  if (updatedFeed && updatedFeed.isActive) {
    scheduleFeedSync(updatedFeed);
  }
}

/**
 * Schedule the next sync for a feed
 */
export function scheduleFeedSync(feed: Feed): void {
  // Clear any existing timer for this feed
  stopFeedScheduler(feed.id);
  
  if (!feed.isActive) {
    console.log(`[Scheduler] Feed ${feed.id} is inactive, skipping schedule`);
    return;
  }
  
  const delay = calculateSyncDelay(feed);
  
  console.log(`[Scheduler] Scheduling feed ${feed.id} (${feed.title}) to sync in ${Math.round(delay / 1000)}s`);
  
  const timer = setTimeout(() => {
    syncFeed(feed.id);
  }, delay);
  
  feedTimers.set(feed.id, timer);
}

/**
 * Start the scheduler for a specific feed
 * Call this when a new feed is added
 */
export function startFeedScheduler(feed: Feed): void {
  console.log(`[Scheduler] Starting scheduler for feed ${feed.id} (${feed.title})`);
  scheduleFeedSync(feed);
}

/**
 * Stop the scheduler for a specific feed
 */
export function stopFeedScheduler(feedId: number): void {
  const timer = feedTimers.get(feedId);
  if (timer) {
    clearTimeout(timer);
    feedTimers.delete(feedId);
    console.log(`[Scheduler] Stopped scheduler for feed ${feedId}`);
  }
}

/**
 * Reschedule a feed after a manual sync
 * This resets the schedule based on the new last_fetched_at time
 */
export function rescheduleFeedAfterSync(feedId: number): void {
  const feed = getFeedById(feedId);
  if (!feed) {
    console.log(`[Scheduler] Feed ${feedId} not found, cannot reschedule`);
    return;
  }
  
  if (!feed.isActive) {
    console.log(`[Scheduler] Feed ${feedId} is inactive, skipping reschedule`);
    return;
  }
  
  console.log(`[Scheduler] Rescheduling feed ${feedId} after sync`);
  scheduleFeedSync(feed);
}

/**
 * Start schedulers for all active feeds
 * Call this on app startup
 */
export function startAllSchedulers(): void {
  console.log('[Scheduler] Starting all feed schedulers...');
  
  const feeds = getAllFeeds().filter(f => f.isActive);
  console.log(`[Scheduler] Found ${feeds.length} active feeds`);
  
  for (const feed of feeds) {
    scheduleFeedSync(feed);
  }
  
  console.log('[Scheduler] All schedulers started');
}

/**
 * Stop all feed schedulers
 */
export function stopAllSchedulers(): void {
  console.log('[Scheduler] Stopping all feed schedulers...');
  
  for (const [feedId, timer] of feedTimers) {
    clearTimeout(timer);
    console.log(`[Scheduler] Stopped scheduler for feed ${feedId}`);
  }
  
  feedTimers.clear();
  console.log('[Scheduler] All schedulers stopped');
}

/**
 * Get the status of all scheduled feeds (for debugging/monitoring)
 */
export function getSchedulerStatus(): { feedId: number; nextSyncIn: number }[] {
  const now = Date.now();
  const status: { feedId: number; nextSyncIn: number }[] = [];
  
  for (const feedId of feedTimers.keys()) {
    const feed = getFeedById(feedId);
    if (feed) {
      const nextSync = calculateNextSyncTime(feed);
      status.push({
        feedId,
        nextSyncIn: Math.max(0, nextSync - now),
      });
    }
  }
  
  return status;
}
