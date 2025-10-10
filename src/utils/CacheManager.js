// Advanced Cache Manager for React with API-specific caching
class CacheManager {
  static cache = new Map();
  static cacheExpiry = new Map();
  static activeRequests = new Map(); // Prevent duplicate concurrent requests
  
  static init() {
    // Console log removed
    // Clean expired cache entries periodically
    setInterval(() => this.cleanExpiredCache(), 60000); // Every minute
  }

  static set(key, data, expiryMinutes = 5) {
    const expiryTime = Date.now() + (expiryMinutes * 60 * 1000);
    this.cache.set(key, data);
    this.cacheExpiry.set(key, expiryTime);
    // Console log removed
  }

  static get(key) {
    const expiryTime = this.cacheExpiry.get(key);
    
    if (!expiryTime || Date.now() > expiryTime) {
      // Cache expired or doesn't exist
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    
    const data = this.cache.get(key);
    // Console log removed
    return data;
  }

  static has(key) {
    const expiryTime = this.cacheExpiry.get(key);
    return expiryTime && Date.now() <= expiryTime;
  }

  // Smart API call with caching and duplicate request prevention
  static async fetchWithCache(key, fetchFunction, expiryMinutes = 5) {
    // Check if data is already cached
    if (this.has(key)) {
    // Console log removed
      return this.get(key);
    }

    // Check if this request is already in progress
    if (this.activeRequests.has(key)) {
    // Console log removed
      return await this.activeRequests.get(key);
    }

    // Start new request
    // Console log removed
    const requestPromise = fetchFunction();
    this.activeRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      this.set(key, result, expiryMinutes);
      this.activeRequests.delete(key);
      return result;
    } catch (error) {
      this.activeRequests.delete(key);
      throw error;
    }
  }

  static clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
    this.activeRequests.clear();
    // Console log removed
  }

  static cleanExpiredCache() {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [key, expiryTime] of this.cacheExpiry.entries()) {
      if (now > expiryTime) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
    // Console log removed
    }
  }

  static getStats() {
    return {
      cacheSize: this.cache.size,
      activeRequests: this.activeRequests.size,
      entries: Array.from(this.cache.keys())
    };
  }

  // Clear specific cache entry
  static clearCache(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    // Console log removed
      return true;
    }
    return false;
  }

  // Clear all cache
  static clearAllCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
    // All cache cleared
  }
}

export default CacheManager;
