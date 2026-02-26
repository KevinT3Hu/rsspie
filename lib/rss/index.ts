/**
 * RSS Module - exports all RSS-related functionality
 */

export { parseFeed } from './parser';
export { 
  fetchAndParseFeed, 
  addNewFeed, 
  refreshFeed, 
  refreshAllFeeds 
} from './fetcher';
export {
  startFeedScheduler,
  stopFeedScheduler,
  startAllSchedulers,
  stopAllSchedulers,
  getSchedulerStatus,
  rescheduleFeedAfterSync,
  calculateNextSyncTime,
} from './scheduler';

// Initialize function to start all schedulers on app startup
export function initializeScheduler(): void {
  // Only run on server side
  if (typeof window === 'undefined') {
    const { startAllSchedulers } = require('./scheduler');
    startAllSchedulers();
  }
}
