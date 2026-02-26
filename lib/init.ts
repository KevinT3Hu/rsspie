/**
 * Application initialization module
 * Handles startup tasks like initializing the scheduler
 */

import { initializeScheduler } from './rss';

let initialized = false;

/**
 * Initialize the application
 * This should be called once when the server starts
 */
export function initializeApp(): void {
  if (initialized) {
    return;
  }
  
  if (typeof window !== 'undefined') {
    // Only run on server side
    return;
  }
  
  console.log('[Init] Starting application initialization...');
  
  try {
    // Initialize the RSS scheduler
    initializeScheduler();
    
    initialized = true;
    console.log('[Init] Application initialization complete');
  } catch (error) {
    console.error('[Init] Failed to initialize application:', error);
  }
}

/**
 * Check if the application has been initialized
 */
export function isInitialized(): boolean {
  return initialized;
}
