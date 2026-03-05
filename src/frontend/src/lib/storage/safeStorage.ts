/**
 * Safe storage wrapper that catches localStorage access errors
 * (e.g., when localStorage is blocked by browser settings or privacy mode)
 */

interface StorageAvailability {
  available: boolean;
  error?: string;
}

let storageAvailability: StorageAvailability | null = null;

function checkStorageAvailability(): StorageAvailability {
  if (storageAvailability !== null) {
    return storageAvailability;
  }

  try {
    const testKey = "__storage_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    storageAvailability = { available: true };
    return storageAvailability;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Storage access denied";
    storageAvailability = { available: false, error: errorMessage };
    return storageAvailability;
  }
}

export function isStorageAvailable(): boolean {
  return checkStorageAvailability().available;
}

export function getStorageError(): string | undefined {
  return checkStorageAvailability().error;
}

export function safeGetItem(key: string): string | null {
  try {
    if (!isStorageAvailable()) {
      return null;
    }
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Failed to get item "${key}" from storage:`, error);
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    if (!isStorageAvailable()) {
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Failed to set item "${key}" in storage:`, error);
    return false;
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    if (!isStorageAvailable()) {
      return false;
    }
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove item "${key}" from storage:`, error);
    return false;
  }
}

export function resetStorageAvailability(): void {
  storageAvailability = null;
}
