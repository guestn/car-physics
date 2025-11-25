/**
 * Utility functions for localStorage operations with type safety
 */

/**
 * Get a value from localStorage and parse it as JSON
 * @param key - The localStorage key
 * @param defaultValue - Default value to return if key doesn't exist or parsing fails
 * @returns The parsed value or defaultValue
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Save a value to localStorage as JSON
 * @param key - The localStorage key
 * @param value - The value to save (will be stringified)
 */
export function setToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save to localStorage item "${key}":`, error);
  }
}

/**
 * Remove a value from localStorage
 * @param key - The localStorage key to remove
 */
export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove localStorage item "${key}":`, error);
  }
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available, false otherwise
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
