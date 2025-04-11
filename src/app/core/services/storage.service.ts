import { Injectable } from '@angular/core';

/**
 * Service responsible for managing local storage operations.
 * Provides a consistent interface for storing and retrieving data.
 * Includes handling for Navigator LockManager conflicts.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly AUTH_PREFIX = 'sb-';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 100; // ms

  /**
   * Retrieves an item from storage
   * @param key The key to retrieve
   * @returns The stored value or null if not found
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Error getting item from storage: ${key}`, error);
      return null;
    }
  }

  /**
   * Stores an item in storage with retry logic for lock conflicts
   * @param key The key to store under
   * @param value The value to store
   */
  async setItem(key: string, value: string): Promise<void> {
    let retries = 0;

    const attemptSetItem = () => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn(`Error setting item in storage: ${key}`, error);
        return false;
      }
    };

    // Immediate attempt
    if (attemptSetItem()) {
      return;
    }

    // Retry with exponential backoff if it's an auth-related key
    if (key.startsWith(this.AUTH_PREFIX)) {
      while (retries < this.MAX_RETRIES) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * retries));
        if (attemptSetItem()) {
          return;
        }
      }
    }
  }

  /**
   * Removes an item from storage
   * @param key The key to remove
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing item from storage: ${key}`, error);
    }
  }

  /**
   * Clears all items from storage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing storage', error);
    }
  }
}
