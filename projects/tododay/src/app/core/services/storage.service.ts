import { Injectable } from '@angular/core';

/**
 * Service responsible for managing local storage operations.
 * Provides a consistent interface for storing and retrieving data.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * Retrieves an item from local storage
   * @param key The key to retrieve
   * @returns The stored value or null if not found
   */
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  /**
   * Stores an item in local storage
   * @param key The key to store under
   * @param value The value to store
   */
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  /**
   * Removes an item from local storage
   * @param key The key to remove
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clears all items from local storage
   */
  clear(): void {
    localStorage.clear();
  }
}
