// Custom React hook for using Global Data Store
import { useState, useEffect, useCallback, useRef } from 'react';
import GlobalDataStore from '../utils/GlobalDataStore';

export const useBurnPoolData = () => {
  const [data, setData] = useState(GlobalDataStore.getData());
  const [loading, setLoading] = useState(GlobalDataStore.getLoadingStates());
  const initializingRef = useRef(false);

  useEffect(() => {
    // Subscribe to data changes
    const unsubscribe = GlobalDataStore.subscribe((newData) => {
      setData(newData);
      setLoading(newData.loadingStates);
    });

    // Initial data fetch if not available - prevent duplicate calls
    const initializeData = async () => {
      if (initializingRef.current) {
        // Console log removed
        return;
      }
      
      initializingRef.current = true;
        // Console log removed
      try {
        // Fetch only if data is not fresh
        const promises = [];
        
        if (!GlobalDataStore.isDataFresh('burnPoolData', 30)) {
        // Console log removed
          promises.push(GlobalDataStore.fetchBurnPoolData());
        } else {
        // Console log removed
        }
        
        if (!GlobalDataStore.isDataFresh('burnPoolData', 5)) {
          promises.push(GlobalDataStore.fetchSteemPowerData());
        }
        
        if (!GlobalDataStore.isDataFresh('contributorsData', 8)) {
          promises.push(GlobalDataStore.fetchContributorsData());
        }

        if (promises.length > 0) {
          await Promise.allSettled(promises);
        }
      } catch (error) {
        // Console log removed
      } finally {
        initializingRef.current = false;
      }
    };

    initializeData();

    return unsubscribe;
  }, []);

  const refreshData = useCallback(async () => {
    try {
      await GlobalDataStore.refreshAllData();
    } catch (error) {
        // Console log removed
    }
  }, []);

  const fetchBurnData = useCallback(async (force = false, progressCallback = null) => {
    try {
      return await GlobalDataStore.fetchBurnPoolData(force, progressCallback);
    } catch (error) {
        // Console log removed
      throw error;
    }
  }, []);

  const fetchContributors = useCallback(async (force = false) => {
    try {
      return await GlobalDataStore.fetchContributorsData(force);
    } catch (error) {
        // Console log removed
      throw error;
    }
  }, []);

  const fetchSteemPower = useCallback(async (force = false) => {
    try {
      return await GlobalDataStore.fetchSteemPowerData(force);
    } catch (error) {
        // Console log removed
      throw error;
    }
  }, []);

  return {
    // Data
    burnPoolData: data.burnPoolData,
    contributorsData: data.contributorsData,
    
    // Loading states
    isLoadingBurnData: loading.burnData,
    isLoadingSteemPower: loading.steemPower,
    isLoadingContributors: loading.contributors,
    
    // Actions
    refreshData,
    fetchBurnData,
    fetchContributors,
    fetchSteemPower,
    
    // Computed values
    totalBurned: data.burnPoolData.totalBurned || 'Loading...',
    burnsToday: data.burnPoolData.burnsToday || '0',
    steemPower: data.burnPoolData.steemPower || 'Loading...',
    profileImage: data.burnPoolData.profileImage,
    account: data.burnPoolData.account || 'dhaka.witness',
    contributorsCount: data.contributorsData.total || 0,
    contributors: data.contributorsData.contributors || []
  };
};

export default useBurnPoolData;
