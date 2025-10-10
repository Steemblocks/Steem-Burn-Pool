// Global Data Store for shared burn pool data across components
import CacheManager from './CacheManager';
import { 
  fetchTotalBurnedData, 
  fetchBurnPoolContributors, 
  fetchBurnPoolSteemPower 
} from '../services/steemApi';

class GlobalDataStore {
  static listeners = new Set();
  static data = {
    burnPoolData: {
      totalBurned: null,
      burnsToday: null,
      steemPower: null,
      profileImage: null,
      account: 'dhaka.witness',
      lastUpdated: null
    },
    contributorsData: {
      contributors: [],
      total: 0,
      lastUpdated: null
    },
    steemData: {
      currentSupply: null,
      virtualSupply: null,
      inflationRate: null,
      newSteemPerDay: null,
      lastUpdated: null
    },
    loadingStates: {
      burnData: false,
      steemPower: false,
      contributors: false
    }
  };

  static init() {
    // Console log removed
  }

  // Subscribe to data changes
  static subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all subscribers of data changes
  static notify() {
    this.listeners.forEach(callback => callback(this.data));
  }

  // Update specific data and notify subscribers
  static updateData(section, newData) {
    this.data[section] = { ...this.data[section], ...newData, lastUpdated: Date.now() };
    this.notify();
    // Console log removed
  }

  // Get cached burn pool data including detailed analytics data
  static getBurnPoolAnalyticsData(force = false) {
    if (force) {
    // Console log removed
      // Clear any cached data when force is requested
      CacheManager.remove('burn-pool-data');
      if (typeof window !== 'undefined') {
        delete window.burnpoolCompleteData;
      }
      // Return empty object to force fresh fetch
      return {
        totalBurned: 0,
        burnsByDay: {},
        source: 'force-refresh'
      };
    }
    
    // Try to get detailed data from cache first
    const cachedData = CacheManager.get('burn-pool-data');
    if (cachedData && cachedData.burnsByDay && Object.keys(cachedData.burnsByDay).length > 0) {
    // Console log removed
    // Console log removed
      return {
        ...cachedData,
        source: 'cache'
      };
    }
    
    // Try to get from global window object (if available)
    if (typeof window !== 'undefined' && window.burnpoolCompleteData && window.burnpoolCompleteData.burnsByDay) {
    // Console log removed
    // Console log removed
      return {
        ...window.burnpoolCompleteData,
        source: 'global'
      };
    }
    
    // Return basic data from store if detailed data not available
    // Console log removed
    return {
      totalBurned: this.data.burnPoolData.totalBurned || 0,
      burnsToday: this.data.burnPoolData.burnsToday || 0,
      lastUpdated: this.data.burnPoolData.lastUpdated,
      burnsByDay: {}, // Empty object instead of undefined
      source: 'store',
      hasDetailedData: false
    };
  }

  // Check if detailed burn analytics data is available
  static hasDetailedBurnData() {
    const cachedData = CacheManager.get('burn-pool-data');
    if (cachedData && cachedData.burnsByDay && Object.keys(cachedData.burnsByDay).length > 0) {
      return true;
    }
    
    if (typeof window !== 'undefined' && 
        window.burnpoolCompleteData && 
        window.burnpoolCompleteData.burnsByDay &&
        Object.keys(window.burnpoolCompleteData.burnsByDay).length > 0) {
      return true;
    }
    
    return false;
  }
  static async fetchBurnPoolData(force = false, progressCallback = null) {
    // Enhanced cache validation with detailed logging
    if (!force && this.data.burnPoolData.totalBurned && this.isDataFresh('burnPoolData', 30)) {
      // Using fresh burn data from cache
      return this.data.burnPoolData;
    }

    // Console log removed
    this.updateData('loadingStates', { burnData: true });

    try {
      let burnData;
      
      if (force) {
        // Force mode: bypass CacheManager entirely and call API directly
        burnData = await fetchTotalBurnedData(progressCallback, true);
      } else {
        // Normal mode: use CacheManager for smart caching
        burnData = await CacheManager.fetchWithCache(
          'burn-pool-data',
          () => fetchTotalBurnedData(progressCallback, false),
          30 // Cache for 30 minutes due to slow calculation
        );
      }

      const formattedBurnData = {
        totalBurned: typeof burnData.totalBurned === 'number' 
          ? burnData.totalBurned.toFixed(2)
          : burnData.totalBurned?.toString() || 'N/A',
        burnsToday: typeof burnData.burnsToday === 'number' 
          ? burnData.burnsToday.toFixed(2)
          : burnData.burnsToday?.toString() || '0'
      };

      this.updateData('burnPoolData', formattedBurnData);
      return formattedBurnData;
    } catch (error) {
    // Console log removed
      throw error;
    } finally {
      this.updateData('loadingStates', { burnData: false });
    }
  }

  static async fetchSteemPowerData(force = false) {
    if (!force && this.data.burnPoolData.steemPower && this.isDataFresh('burnPoolData', 3)) {
    // Console log removed
      return this.data.burnPoolData;
    }

    this.updateData('loadingStates', { steemPower: true });

    try {
      const steemPowerData = await CacheManager.fetchWithCache(
        'steem-power-data',
        fetchBurnPoolSteemPower,
        5 // Cache for 5 minutes
      );

      this.updateData('burnPoolData', {
        steemPower: steemPowerData.steemPower,
        profileImage: steemPowerData.profileImage,
        account: steemPowerData.account
      });

      return steemPowerData;
    } catch (error) {
    // Console log removed
      throw error;
    } finally {
      this.updateData('loadingStates', { steemPower: false });
    }
  }

  static async fetchContributorsData(force = false) {
    if (!force && this.data.contributorsData.contributors.length > 0 && this.isDataFresh('contributorsData', 5)) {
    // Console log removed
      return this.data.contributorsData;
    }

    this.updateData('loadingStates', { contributors: true });

    try {
      const contributorsData = await CacheManager.fetchWithCache(
        'contributors-data',
        fetchBurnPoolContributors,
        8 // Cache for 8 minutes
      );

      this.updateData('contributorsData', {
        contributors: contributorsData.contributors || [],
        total: contributorsData.total || 0
      });

      return contributorsData;
    } catch (error) {
    // Console log removed
      
      // Provide fallback data instead of throwing
      const fallbackData = {
        contributors: [],
        total: 0,
        error: 'Failed to fetch contributors'
      };
      
      this.updateData('contributorsData', fallbackData);
      return fallbackData;
    } finally {
      this.updateData('loadingStates', { contributors: false });
    }
  }

  // Check if data is fresh (within specified minutes)
  static isDataFresh(section, maxAgeMinutes) {
    const lastUpdated = this.data[section]?.lastUpdated;
    if (!lastUpdated) return false;
    
    const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
    return (Date.now() - lastUpdated) < maxAge;
  }

  // Get current data snapshot
  static getData() {
    return { ...this.data };
  }

  // Force refresh all data
  static async refreshAllData() {
    // Console log removed
    
    // Clear all caches
    CacheManager.clear();
    
    // Clear localStorage burn data cache
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('total-burned-steem-data');
    }
    
    // Clear global window data
    if (typeof window !== 'undefined') {
      delete window.burnpoolCompleteData;
    }
    
    await Promise.all([
      this.fetchBurnPoolData(true),
      this.fetchSteemPowerData(true),
      this.fetchContributorsData(true)
    ]);
    
    // Console log removed
  }

  // Get loading states
  static getLoadingStates() {
    return { ...this.data.loadingStates };
  }

  // Update STEEM blockchain data (for supply calculations)
  static updateSteemData(steemData) {
    this.updateData('steemData', steemData);
    // STEEM supply data updated in GlobalDataStore
  }

  // Get STEEM supply data
  static getSteemData() {
    return this.data.steemData;
  }
}

export default GlobalDataStore;
