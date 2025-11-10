// Steem API service functions
import { STEEM_BURN_POOL_ACCOUNT, API_ENDPOINTS } from '../constants/config';

export function formatLargeNumbers(value) {
  if (value < 0) {
    value = -value;
    return '-' + formatLargeNumbers(value);
  }
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + 'B';
  } else if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + 'M';
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(2) + 'K';
  } else if (value >= 1) {
    return value.toFixed(2);
  } else {
    return value.toFixed(8);
  }
}

export function fetchCurrentInflationRate(blockNumber) {
  const STEEM_INFLATION_RATE_START_PERCENT = 978; // 9.78%
  const STEEM_INFLATION_NARROWING_PERIOD = 250000;
  const STEEM_INFLATION_RATE_STOP_PERCENT = 95; // 0.95%

  const inflationRateAdjustment = blockNumber / STEEM_INFLATION_NARROWING_PERIOD;
  const currentInflationRate = Math.max(
    STEEM_INFLATION_RATE_START_PERCENT - inflationRateAdjustment,
    STEEM_INFLATION_RATE_STOP_PERCENT
  );
  return currentInflationRate / 100; // Convert to percentage
}

export function calculateNewSteemPerDay(virtualSupply, inflationRate) {
  const newSteemPerYear = virtualSupply * (inflationRate / 100);
  return newSteemPerYear / 365;
}

export async function fetchSteemData() {
  try {
    // Reduce timeout to 5 seconds for faster fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://sds1.steemworld.org/steem_requests_api/condenser_api.get_dynamic_global_properties', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const props = data.result;

    // Parse numbers from API (remove units if present)
    const currentSupply = parseFloat(props.current_supply.replace(' STEEM', ''));
    const currentSBDSupply = parseFloat(props.current_sbd_supply.replace(' SBD', ''));
    const virtualSupply = parseFloat(props.virtual_supply.replace(' STEEM', ''));
    const blockNumber = props.head_block_number;

    // Inflation Rate Calculation
    const inflationRate = fetchCurrentInflationRate(blockNumber);
    const newSteemPerDay = calculateNewSteemPerDay(virtualSupply, inflationRate);

    return {
      currentSupply,
      currentSBDSupply,
      virtualSupply,
      blockNumber,
      inflationRate,
      newSteemPerDay,
      sbdPrintRate: props.sbd_print_rate,
      sbdInterestRate: props.sbd_interest_rate,
      contributors: [] // This would be populated from delegation data
    };

  } catch (err) {
    // Error occurred while fetching STEEM data
    throw err;
  }
}

export async function fetchBurnHistory() {
  try {
    // This would fetch burn history data
    // For now returning mock data structure
    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'STEEM Burned',
        data: [120000, 150000, 180000, 200000, 175000, 220000],
        borderColor: '#4BA2F2',
        backgroundColor: 'rgba(75, 162, 242, 0.1)',
        fill: true
      }]
    };
    return data;
  } catch (error) {
    // Error occurred while fetching burn history
    throw error;
  }
}

export async function fetchRoadmapData() {
  try {
    // This would fetch roadmap data
    // For now returning mock data
    const data = {
      phases: [
        {
          id: 1,
          title: "Foundation",
          status: "completed",
          items: [
            { text: "Core burn mechanism", completed: true },
            { text: "Basic delegation tracking", completed: true },
            { text: "Dashboard interface", completed: true }
          ]
        },
        {
          id: 2,
          title: "Enhancement",
          status: "in-progress",
          items: [
            { text: "Advanced analytics", completed: true },
            { text: "Real-time notifications", completed: false },
            { text: "Mobile optimization", completed: false }
          ]
        },
        {
          id: 3,
          title: "Integration",
          status: "planned",
          items: [
            { text: "API endpoints", completed: false },
            { text: "Third-party integrations", completed: false },
            { text: "Advanced delegation tools", completed: false }
          ]
        }
      ]
    };
    return data;
  } catch (error) {
    // Console log removed
    throw error;
  }
}

export async function fetchBurnPoolContributors() {
  try {
    // Console log removed
    
    // Increase timeout for better reliability
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Fetch vests-to-steem conversion rate
    const rateResponse = await fetch('https://api.justyy.workers.dev/api/steemit/vests/?cached', {
      signal: controller.signal
    });
    
    if (!rateResponse.ok) {
      throw new Error(`Rate API error! status: ${rateResponse.status}`);
    }
    
    const rateData = await rateResponse.json();
    const vestsToSteem = rateData.vests_to_steem || rateData.vests_to_sp || 0;
    
    // Fetch delegation data
    const delegationResponse = await fetch(`${API_ENDPOINTS.STEEM_WORLD_DELEGATIONS}/${STEEM_BURN_POOL_ACCOUNT}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!delegationResponse.ok) {
      throw new Error(`Delegation API error! status: ${delegationResponse.status}`);
    }
    
    const delegationData = await delegationResponse.json();
    const rows = delegationData?.result?.rows || [];
    
    if (rows.length > 0) {
      const allContributors = rows.map(row => ({
        contributor: row[1],
        steem: parseFloat(row[3]) * vestsToSteem,
        avatarUrl: `https://steemitimages.com/u/${row[1]}/avatar`
      })).sort((a, b) => b.steem - a.steem);

      return {
        contributors: allContributors,
        total: allContributors.length
      };
      
    } else {
    // Console log removed
      return {
        contributors: [],
        total: 0
      };
    }
  } catch (error) {
    // Return fallback data instead of throwing error
    return {
      contributors: [],
      total: 0,
      error: error.message
    };
  }
}

// Separate function for fetching STEEM Power data only (fast and live)
export async function fetchBurnPoolSteemPower() {
  const burnPoolAccount = 'steemburnpool'; // For STEEM Power and profile data
  
  try {
    // Fetch account data using condenser_api.get_accounts
    const accountResponse = await fetch('https://api.steemit.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_accounts',
        params: [[burnPoolAccount]],
        id: 1
      })
    });
    
    if (!accountResponse.ok) {
      throw new Error(`Account API response not ok: ${accountResponse.status}`);
    }
    
    const accountData = await accountResponse.json();
    
    if (!accountData.result || accountData.result.length === 0) {
      throw new Error('Account not found');
    }
    
    const account = accountData.result[0];
    
    // Get global properties for VESTS conversion
    const globalResponse = await fetch('https://api.steemit.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_dynamic_global_properties',
        params: [],
        id: 1
      })
    });
    
    const globalData = await globalResponse.json();
    
    if (!globalData.result) {
      throw new Error('Failed to get global properties');
    }
    
    // Calculate VESTS to STEEM conversion rate
    const totalVestingShares = parseFloat(globalData.result.total_vesting_shares.split(' ')[0]);
    const totalVestingFundSteem = parseFloat(globalData.result.total_vesting_fund_steem.split(' ')[0]);
    const steemPerVest = totalVestingFundSteem / totalVestingShares;
    
    // Calculate Effective STEEM Power
    const vestingShares = parseFloat(account.vesting_shares.split(' ')[0]);
    const receivedVestingShares = parseFloat(account.received_vesting_shares.split(' ')[0]);
    const delegatedVestingShares = parseFloat(account.delegated_vesting_shares.split(' ')[0]);
    
    // Effective VESTS = Own VESTS + Received VESTS - Delegated VESTS
    const effectiveVests = vestingShares + receivedVestingShares - delegatedVestingShares;
    const steemPower = effectiveVests * steemPerVest;
    
    // Get profile image
    let profileImage = `https://steemitimages.com/u/${burnPoolAccount}/avatar`;
    try {
      if (account.posting_json_metadata) {
        const metadata = JSON.parse(account.posting_json_metadata);
        if (metadata.profile && metadata.profile.profile_image) {
          profileImage = metadata.profile.profile_image;
        }
      }
    } catch (e) {
      // Keep default profile image
    }
    
    return {
      steemPower: steemPower,
      account: burnPoolAccount,
      profileImage: profileImage
    };
    
  } catch (error) {
    // Error occurred while fetching STEEM Power data
    throw error;
  }
}

// Separate function for fetching burn data only (slow)
export async function fetchTotalBurnedData(progressCallback = null, force = false) {
  try {
    // Check for cached burn data first (cache for 30 minutes due to slow calculation)
    // Skip cache check if force=true
    const cacheKey = 'total-burned-steem-data';
    
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          const cacheAge = Date.now() - cachedData.timestamp;
          const thirtyMinutes = 30 * 60 * 1000;
          
          if (cacheAge < thirtyMinutes) {
            // Using localStorage cached burn data
            
            // Check if cached data has detailed burn information
            if (cachedData.burnsByDay) {
    // Console log removed
              return { 
                totalBurned: cachedData.totalBurned,
                burnsToday: cachedData.burnsToday || 0,
                burnsByDay: cachedData.burnsByDay,
                lastBurnTimestamp: cachedData.lastBurnTimestamp,
                totalTransactions: cachedData.totalTransactions,
                scanComplete: true,
                dataTimestamp: cachedData.timestamp
              };
            } else {
    // Console log removed
              return { 
                totalBurned: cachedData.totalBurned,
                burnsToday: cachedData.burnsToday || 0
              };
            }
          } else {
    // Console log removed
          }
        } catch (e) {
    // Console log removed
        }
      }
    }
    
    // Console log removed
    
    if (progressCallback) {
      progressCallback({ percentage: 0, message: 'Starting burn data calculation...' });
    }
    
    const totalBurned = await calculateTotalBurned(progressCallback);
    
    // ANTI-FAKE DATA: Block known fake values
    if (totalBurned.totalBurned && totalBurned.totalBurned.toString().includes('4671.245')) {
    // Console log removed
      throw new Error('Fake data detected');
    }
    
    // Cache the complete result for 30 minutes (including detailed burnsByDay data)
    const windowData = typeof window !== 'undefined' ? window.burnpoolCompleteData : null;
    const cacheData = {
      totalBurned: totalBurned.totalBurned,
      burnsToday: totalBurned.burnsToday,
      burnsByDay: windowData?.burnsByDay || {},
      lastBurnTimestamp: windowData?.lastBurnTimestamp || 0,
      totalTransactions: windowData?.totalTransactions || 0,
      timestamp: Date.now()
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    // Console log removed
    }
    
    if (progressCallback) {
      progressCallback({ percentage: 100, message: 'Burn data calculation completed!' });
    }
    
    return {
      totalBurned: totalBurned.totalBurned,
      burnsToday: totalBurned.burnsToday,
      burnsByDay: windowData?.burnsByDay || {},
      lastBurnTimestamp: windowData?.lastBurnTimestamp || 0,
      totalTransactions: windowData?.totalTransactions || 0,
      scanComplete: true,
      dataTimestamp: Date.now()
    };
    
  } catch (error) {
    // Console log removed
    throw error;
  }
}

export async function fetchBurnPoolData() {
  try {
    // Console log removed
    
    // Fetch both data sets
    const [steemPowerData, burnData] = await Promise.all([
      fetchBurnPoolSteemPower(),
      fetchTotalBurnedData()
    ]);
    
    return {
      steemPower: steemPowerData.steemPower,
      totalBurned: burnData.totalBurned,
      account: steemPowerData.account,
      profileImage: steemPowerData.profileImage
    };
    
  } catch (error) {
    // Console log removed
    throw error;
  }
}

async function calculateTotalBurned(progressCallback = null) {
  const burnTrackingAccount = 'steemburnup'; // For tracking burns to @null (optimized scan from 2025)
  let totalBurned = 0;
  let found = 0;
  let lastBurnTimestamp = 0;
  let burnsByDay = {}; // Track burns by day for analytics
  
  try {
    // Console log removed
    
    // Increase timeout for the comprehensive scan
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased from 6s to 15s
    
    // Get VESTS conversion rate
    const globalResp = await fetch('https://api.steemit.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'condenser_api.get_dynamic_global_properties',
        params: [],
        id: 1
      }),
      signal: controller.signal
    });
    
    if (!globalResp.ok) {
      throw new Error(`HTTP error! status: ${globalResp.status}`);
    }
    
    const globalData = await globalResp.json();
    clearTimeout(timeoutId);
    
    if (!globalData || !globalData.result) {
      throw new Error('Global properties API response is invalid');
    }
    
    const totalVestingShares = parseFloat(globalData.result.total_vesting_shares.split(' ')[0]);
    const totalVestingFundSteem = parseFloat(globalData.result.total_vesting_fund_steem.split(' ')[0]);
    const steemPerVest = totalVestingFundSteem / totalVestingShares;
    
    // Console log removed
    
    // Get market prices for SBD conversion
    let sbdToSteem = 1.0;
    try {
      const priceResp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=steem,steem-dollars&vs_currencies=usd');
      if (priceResp.ok) {
        const priceData = await priceResp.json();
        const steemPrice = priceData.steem?.usd;
        const sbdPrice = priceData['steem-dollars']?.usd;
        if (steemPrice && sbdPrice) {
          sbdToSteem = sbdPrice / steemPrice;
    // Console log removed
        }
      }
    } catch (error) {
    // Console log removed
    }
    
    // Optimized scan from 2025-01-01 to now (reduced from account creation 2021-03-09)
    const scanStartTime = Math.floor(new Date('2025-01-01T00:00:00Z').getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    
    // Console log removed
    
    if (progressCallback) {
      progressCallback({ percentage: 0, message: 'Initializing burn data scan...' });
    }
    
    // Scan year by year to prevent timeouts
    for (let year = 2025; year <= 2025; year++) {
      const yearStart = Math.max(scanStartTime, Math.floor(new Date(`${year}-01-01`).getTime() / 1000));
      const yearEnd = Math.min(now, Math.floor(new Date(`${year + 1}-01-01`).getTime() / 1000));
      
      if (yearStart >= now) break;
      
    // Console log removed
      
      if (progressCallback) {
        const yearProgress = Math.round(((year - 2025) / 1) * 100);
        progressCallback({ 
          percentage: yearProgress, 
          message: `Scanning transactions...` 
        });
      }
      
      let offset = 0;
      const limit = 5000;
      let more = true;
      
      while (more) {
        try {
          const url = `https://sds0.steemworld.org/rewards_api/getRewards/comment_benefactor_reward/null/${yearStart}-${yearEnd}/${limit}/${offset}`;
          
          const resp = await fetch(url);
          if (!resp.ok) break;
          
          const result = await resp.json();
          if (!result.result?.rows?.length) break;
          
          // Update progress based on offset
          if (progressCallback && offset % 10000 === 0) { // Update every 10k records
            const progress = Math.min(95, Math.round((offset / 50000) * 100)); // Estimate progress
            progressCallback({ 
              percentage: progress, 
              message: `Processing transactions... Found ${found} burns (${totalBurned.toFixed(2)} STEEM)` 
            });
          }
          
          // Process each transaction
          for (const row of result.result.rows) {
            const author = row[1];
            if (author === burnTrackingAccount) {
              const timestamp = parseInt(row[0]);
              const sbd = parseFloat(row[3]) || 0;
              const steem = parseFloat(row[4]) || 0;
              const vests = parseFloat(row[5]) || 0;
              
              const vestsSteemValue = vests * steemPerVest;
              const sbdSteemValue = sbd * sbdToSteem;
              const burnAmount = steem + sbdSteemValue + vestsSteemValue;
              
              if (burnAmount > 0) {
                totalBurned += burnAmount;
                found++;
                
                if (timestamp > lastBurnTimestamp) {
                  lastBurnTimestamp = timestamp;
                }
                
                // Group burns by day for analytics
                const dayTimestamp = timestamp - (timestamp % (24 * 60 * 60)); // Round to start of day
                if (!burnsByDay[dayTimestamp]) {
                  burnsByDay[dayTimestamp] = 0;
                }
                burnsByDay[dayTimestamp] += burnAmount;
                
                // Log verification for recent or large burns
                if (burnAmount > 5 || timestamp > now - (90 * 24 * 60 * 60)) {
    // Console log removed
                }
              }
            }
          }
          
          if (result.result.rows.length < limit) {
            more = false;
          } else {
            offset += limit;
          }
          
        } catch (error) {
    // Console log removed
          break;
        }
      }
    }
    
    // Display results
    // Console log removed
    
    // Store complete data globally for analytics to use (browser only)
    if (typeof window !== 'undefined') {
      window.burnpoolCompleteData = {
        totalBurned: totalBurned,
        totalTransactions: found,
        lastBurnTimestamp: lastBurnTimestamp,
        burnsByDay: burnsByDay, // Add daily burn data for period calculations
        scanComplete: true,
        dataTimestamp: Date.now()
      };
    // Console log removed
    }
    
    // Calculate burns from last 24 hours
    const twentyFourHoursAgo = now - (24 * 60 * 60);
    let burnsToday = 0;
    
    Object.keys(burnsByDay).forEach(dayTimestamp => {
      if (parseInt(dayTimestamp) >= twentyFourHoursAgo) {
        burnsToday += burnsByDay[dayTimestamp];
      }
    });
    
    // Console log removed
    
    if (found === 0) {
    // No burns found
      return { totalBurned: 0, burnsToday: 0 };
    } else {
      // Return burn data
      return { totalBurned: totalBurned, burnsToday: burnsToday };
    }
    
  } catch (error) {
    // Console log removed
    
    // Better error handling with specific messages
    if (error.name === 'AbortError') {
    // Console log removed
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
    // Console log removed
    } else {
    // Console log removed
    }
    
    // Return reasonable fallback based on historical data
    return { totalBurned: 0, burnsToday: 0 }; // Let it show 0 if we can't fetch real data
  }
}
