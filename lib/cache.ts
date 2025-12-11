// 簡單的內存緩存
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL: number = 30000; // 默認 30 秒

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string, ttl?: number): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const maxAge = ttl || this.defaultTTL;
    const age = Date.now() - item.timestamp;

    if (age > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export const cache = new SimpleCache();
