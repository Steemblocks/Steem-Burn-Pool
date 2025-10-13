/**
 * Shared utility for calculating supply impact / deflation rate
 * Ensures consistent calculation across Analytics and Roadmap components
 */

import GlobalDataStore from './GlobalDataStore';
import { STEEM_CONSTANTS } from '../constants/config';

export class SupplyImpactCalculator {
  /**
   * Calculate supply impact percentage for a given timeframe
   * @param {string} timeframe - '7d', '30d', '90d', or 'all'
   * @param {number} fallbackTotalBurned - Fallback total if detailed data unavailable
   * @returns {Object} { totalBurned, supplyImpact, virtualSupply, daysCovered }
   */
  static calculateTimeframeImpact(timeframe = 'all', fallbackTotalBurned = 0) {
    try {
      // Console log removed
      
      const burnPoolData = GlobalDataStore.getBurnPoolAnalyticsData();
      
      // Get virtual supply (consistent logic)
      let virtualSupply = STEEM_CONSTANTS.VIRTUAL_SUPPLY_FALLBACK;
      try {
        const steemData = GlobalDataStore.getSteemData();
        if (steemData?.virtualSupply && steemData.virtualSupply > 0) {
          virtualSupply = steemData.virtualSupply;
        }
      } catch (error) {
      // Console log removed
      }

      let totalBurnedInPeriod = 0;
      let daysCovered = 1;

      if (!burnPoolData.burnsByDay || Object.keys(burnPoolData.burnsByDay).length === 0) {
        // Fallback calculation
      // Console log removed
        
        const fallbackTotal = fallbackTotalBurned || 0;
        totalBurnedInPeriod = fallbackTotal;
        
        // Calculate days since project start (Jan 1, 2025)
        const demoStartDate = new Date('2025-01-01');
        const now = new Date();
        const actualDemoDays = Math.floor((now - demoStartDate) / (1000 * 60 * 60 * 24));
        daysCovered = actualDemoDays;
        
        // Adjust for specific timeframes
        if (timeframe !== 'all') {
          const timeframeDays = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
          totalBurnedInPeriod = (fallbackTotal / actualDemoDays) * timeframeDays;
          daysCovered = timeframeDays;
        }
      } else {
        // Detailed calculation using burn history
      // Console log removed
        
        const now = Math.floor(Date.now() / 1000);
        let daysBack;
        
        switch (timeframe) {
          case '7d': daysBack = 7; break;
          case '30d': daysBack = 30; break;
          case '90d': daysBack = 90; break;
          case 'all': daysBack = 0; break;
          default: daysBack = 30;
        }

        let timeframeCutoff;
        if (daysBack === 0) {
          timeframeCutoff = 0; // All time
        } else {
          timeframeCutoff = now - (daysBack * 24 * 60 * 60);
        }

        // Filter burn data for the timeframe
        const filteredBurns = Object.keys(burnPoolData.burnsByDay)
          .map(timestamp => ({
            timestamp: parseInt(timestamp),
            burns: burnPoolData.burnsByDay[timestamp]
          }))
          .filter(item => item.timestamp >= timeframeCutoff)
          .sort((a, b) => a.timestamp - b.timestamp);

        // Calculate statistics
        totalBurnedInPeriod = filteredBurns.reduce((sum, item) => sum + item.burns, 0);
        
        // UNIFIED LOGIC: For 'all' timeframe, calculate total days since project start for a true average.
        if (daysBack === 0) {
          const demoStartDate = new Date('2025-01-01');
          const now = new Date();
          daysCovered = Math.floor((now - demoStartDate) / (1000 * 60 * 60 * 24)) || 1;
        } else {
          daysCovered = daysBack;
        }
      }

      // Calculate supply impact percentage
      const supplyImpactPercentage = (totalBurnedInPeriod / virtualSupply) * 100;
      const formattedImpact = supplyImpactPercentage.toFixed(8);

      const result = {
        totalBurned: totalBurnedInPeriod,
        supplyImpact: formattedImpact,
        virtualSupply: virtualSupply,
        daysCovered: daysCovered,
        averageDaily: daysCovered > 0 ? totalBurnedInPeriod / daysCovered : 0
      };

      // Supply impact calculation completed

      return result;

    } catch (error) {
      // Console log removed
      return {
        totalBurned: 0,
        supplyImpact: '0.00000000',
        virtualSupply: STEEM_CONSTANTS.VIRTUAL_SUPPLY_FALLBACK,
        daysCovered: 0,
        averageDaily: 0
      };
    }
  }

  /**
   * Get deflation rate (negative supply impact) for Roadmap component
   * @param {number} fallbackTotalBurned - Fallback total if detailed data unavailable
   * @returns {string} Formatted deflation rate with negative sign (e.g., "-0.037%")
   */
  static getDeflationRate(fallbackTotalBurned = 0) {
    const impact = this.calculateTimeframeImpact('all', fallbackTotalBurned);
    const deflationRate = '-' + parseFloat(impact.supplyImpact) + '%';
    
      // Console log removed
    return deflationRate;
  }
}

export default SupplyImpactCalculator;
