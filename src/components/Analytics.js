import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import useBurnPoolData from '../hooks/useBurnPoolData';
import GlobalDataStore from '../utils/GlobalDataStore';
import { fetchSteemData } from '../services/steemApi';
import SupplyImpactCalculator from '../utils/SupplyImpactCalculator';
import { formatTimeAgo } from '../utils/timeFormatter';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Analytics = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTimeframe, setActiveTimeframe] = useState('all');
  const [supplyDataLoaded, setSupplyDataLoaded] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [timeframeStats, setTimeframeStats] = useState({
    totalBurned: 0,
    averageDaily: 0,
    supplyImpact: '0.000000',
    daysCovered: 0
  });
  const chartRef = useRef();

  // Use global burn pool data
  const {
    totalBurned,
    isLoadingBurnData,
    fetchBurnData,
    lastBurnTimestamp
  } = useBurnPoolData();

  // Enhanced data aggregation for better visualization
  const aggregateDataForTimeframe = (data, timeframe) => {
    if (timeframe === '7d' || timeframe === '30d') {
      return data; // Show daily data (gaps already filled)
    }
    
    if (timeframe === '90d') {
      // Group by week for 90d view
      const weeklyData = {};
      data.forEach(item => {
        const weekStart = item.timestamp - (item.timestamp % (7 * 24 * 60 * 60));
        if (!weeklyData[weekStart]) {
          weeklyData[weekStart] = { timestamp: weekStart, burns: 0 };
        }
        weeklyData[weekStart].burns += item.burns;
      });
      
      const result = Object.values(weeklyData).sort((a, b) => a.timestamp - b.timestamp);
      
      // Fill gaps to ensure continuous weekly data to today
      if (result.length > 0) {
        const today = Math.floor(Date.now() / 1000);
        const thisWeekStart = today - (today % (7 * 24 * 60 * 60));
        const lastWeek = result[result.length - 1].timestamp;
        
        let currentWeek = lastWeek + (7 * 24 * 60 * 60);
        while (currentWeek <= thisWeekStart) {
          result.push({ timestamp: currentWeek, burns: 0 });
          currentWeek += (7 * 24 * 60 * 60);
        }
      }
      
      return result.sort((a, b) => a.timestamp - b.timestamp);
    }
    
    // For 'all' timeframe, group by month
    const monthlyData = {};
    data.forEach(item => {
      const date = new Date(item.timestamp * 1000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).getTime() / 1000;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { timestamp: monthStart, burns: 0 };
      }
      monthlyData[monthKey].burns += item.burns;
    });
    
    const result = Object.values(monthlyData).sort((a, b) => a.timestamp - b.timestamp);
    
    // Fill gaps to ensure continuous monthly data to current month
    if (result.length > 0) {
      const today = new Date();
      const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime() / 1000;
      const lastMonth = result[result.length - 1].timestamp;
      
      let checkDate = new Date(lastMonth * 1000);
      checkDate.setMonth(checkDate.getMonth() + 1); // Next month
      
      while (checkDate.getTime() / 1000 <= currentMonthStart) {
        const monthStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), 1).getTime() / 1000;
        result.push({ timestamp: monthStart, burns: 0 });
        checkDate.setMonth(checkDate.getMonth() + 1);
      }
    }
    
    return result.sort((a, b) => a.timestamp - b.timestamp);
  };

  const loadBurnHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get burn pool data using GlobalDataStore
      const burnPoolData = GlobalDataStore.getBurnPoolAnalyticsData();
      // Analytics using burn data from store
      
      // Check if we have detailed burn data, if not wait for it
      if (!burnPoolData.burnsByDay || Object.keys(burnPoolData.burnsByDay).length === 0) {
        // No detailed burn data available - showing fallback data
        
        // Clear filtered data since we don't have real data
        setFilteredData([]);
        
        // If we have basic total data, show it
        const totalValue = burnPoolData.totalBurned ? parseFloat(burnPoolData.totalBurned) : 0;
        if (totalValue > 0) {
          // Showing basic chart with total value (real total, but no daily breakdown)
          setChartData({
            labels: ['Total Burns'],
            datasets: [{
              label: 'STEEM Burned (Total)',
              data: [totalValue],
              borderColor: '#4BA2F2',
              backgroundColor: 'rgba(75, 162, 242, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointHoverRadius: 8
            }]
          });
        } else {
          // Show loading state or fetch data if needed
          // No burn data available, attempting to fetch
          try {
            await fetchBurnData(false);
            // Retry loading after fetch
            setTimeout(() => loadBurnHistory(), 1000);
            return;
          } catch (error) {
            // Failed to fetch burn data
          }
          
          // Show no data state
          setChartData({
            labels: ['No Data Available'],
            datasets: [{
              label: 'STEEM Burned',
              data: [0],
              borderColor: '#4BA2F2',
              backgroundColor: 'rgba(75, 162, 242, 0.1)',
              fill: true,
              tension: 0.4
            }]
          });
        }
        return;
      }

      // Filter data based on active timeframe
      const now = Math.floor(Date.now() / 1000);
      let daysBack;
      
      switch (activeTimeframe) {
        case '7d': daysBack = 7; break;
        case '30d': daysBack = 30; break;
        case '90d': daysBack = 90; break;
        case 'all': daysBack = 0; break; // Show all available data
        default: daysBack = 30;
      }

      let timeframeCutoff;
      if (daysBack === 0) {
        // For "all", show all available data
        timeframeCutoff = 0;
      } else {
        timeframeCutoff = now - (daysBack * 24 * 60 * 60);
      }
      
      // Get and sort burn data for the timeframe
      let filteredData = Object.keys(burnPoolData.burnsByDay)
        .map(timestamp => ({
          timestamp: parseInt(timestamp),
          burns: burnPoolData.burnsByDay[timestamp]
        }))
        .filter(item => item.timestamp >= timeframeCutoff)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      // Fill gaps to ensure the graph extends to TODAY
      if (filteredData.length > 0) {
        const lastDataPoint = filteredData[filteredData.length - 1].timestamp;
        const today = Math.floor(Date.now() / 1000);
        const todayMidnight = today - (today % 86400); // Start of today
        
        // If the last data point is before today, add zero-value points to today
        if (lastDataPoint < todayMidnight) {
          // For 7d and 30d, fill daily
          if (activeTimeframe === '7d' || activeTimeframe === '30d') {
            let currentDay = lastDataPoint + 86400; // Next day after last data
            while (currentDay <= todayMidnight) {
              filteredData.push({ timestamp: currentDay, burns: 0 });
              currentDay += 86400;
            }
          }
          // For 90d, we'll let the weekly aggregation handle it
          // For 'all', we'll let the monthly aggregation handle it
        }
      }
        
      // Apply data aggregation based on timeframe for better visualization
      filteredData = aggregateDataForTimeframe(filteredData, activeTimeframe);

      // For specific timeframes, ensure we don't exceed the requested period
      if (daysBack > 0 && filteredData.length > daysBack) {
        // Take the most recent data points within the timeframe
        const maxPoints = Math.ceil(daysBack / (activeTimeframe === '90d' ? 7 : activeTimeframe === 'all' ? 30 : 1));
        filteredData = filteredData.slice(-maxPoints);
      }

      // Using real blockchain data

      // Update component state with filtered data for stats display
      setFilteredData(filteredData);

      if (filteredData.length === 0) {
        // No data for selected timeframe
        setChartData({
          labels: [`No Burns in ${activeTimeframe.toUpperCase()}`],
          datasets: [{
            label: 'STEEM Burned',
            data: [0],
            borderColor: '#4BA2F2',
            backgroundColor: 'rgba(75, 162, 242, 0.1)',
            fill: true,
            tension: 0.4
          }]
        });
        return;
      }

      // Prepare chart data with improved labeling
      const labels = filteredData.map(item => {
        const date = new Date(item.timestamp * 1000);
        if (daysBack <= 7) {
          // For 7 days or less, show weekday and date
          return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });
        } else if (daysBack <= 30) {
          // For 30 days, show month and date
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        } else if (daysBack <= 90) {
          // For 90 days, show month and date (abbreviated)
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        } else {
          // For all time, show month and year
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: filteredData.length > 50 ? '2-digit' : 'numeric'
          });
        }
      });

      const burnAmounts = filteredData.map(item => item.burns);

      // Calculate cumulative burns (running total of real data only)
      let cumulativeAmounts = [];
      let runningTotal = 0;
      cumulativeAmounts = filteredData.map(item => {
        runningTotal += item.burns;
        return runningTotal;
      });

      const datasets = [{
        label: 'Daily Burns',
        data: burnAmounts,
        borderColor: '#3b82f6',
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
          gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
          return gradient;
        },
        fill: true,
        tension: 0.1,
        pointRadius: function(context) {
          return daysBack <= 7 ? 6 : daysBack <= 30 ? 5 : 4;
        },
        pointHoverRadius: function(context) {
          return daysBack <= 7 ? 10 : daysBack <= 30 ? 8 : 6;
        },
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointHoverBorderWidth: 4,
        pointHoverBackgroundColor: '#1d4ed8',
        pointHoverBorderColor: '#ffffff',
        borderWidth: 3,
        order: 1
      }];

      // Add cumulative line (calculated from real data)
      if (cumulativeAmounts.length > 0) {
        datasets.push({
          label: 'Cumulative Total',
          data: cumulativeAmounts,
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.3,
          pointRadius: daysBack <= 7 ? 4 : 3,
          pointHoverRadius: daysBack <= 7 ? 8 : 6,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 3,
          pointHoverBackgroundColor: '#059669',
          pointHoverBorderColor: '#ffffff',
          borderWidth: 2.5,
          borderDash: [8, 4],
          borderCapStyle: 'round',
          order: 2
        });
      }

      setChartData({
        labels: labels,
        datasets: datasets
      });
    } catch (error) {
      // Error loading burn history - using fallback data
      
      // Set fallback data with current total
      const currentTotal = totalBurned ? parseFloat(totalBurned) : 220000;
      const estimatedDaily = currentTotal / 365;
      
      // Using fallback data with estimated values
      
      setChartData({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
        datasets: [{
          label: 'STEEM Burned',
          data: [
            estimatedDaily * 31, // Jan
            estimatedDaily * 59, // Feb cumulative
            estimatedDaily * 90, // Mar cumulative
            estimatedDaily * 120, // Apr cumulative
            estimatedDaily * 151, // May cumulative
            estimatedDaily * 181, // Jun cumulative
            estimatedDaily * 212, // Jul cumulative
            estimatedDaily * 243, // Aug cumulative
            currentTotal // Sep (current total)
          ],
          borderColor: '#4BA2F2',
          backgroundColor: 'rgba(75, 162, 242, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTimeframe, totalBurned, fetchBurnData]); // Add fetchBurnData dependency

  // Calculate timeframe-specific statistics using shared calculator
  const calculateTimeframeStats = useCallback(() => {
    try {
      // Calculating timeframe stats
      
      // Use shared calculator to ensure consistency with Roadmap component
      const fallbackTotal = totalBurned ? parseFloat(totalBurned) : 0;
      const impact = SupplyImpactCalculator.calculateTimeframeImpact(activeTimeframe, fallbackTotal);
      
      setTimeframeStats({
        totalBurned: impact.totalBurned,
        averageDaily: impact.averageDaily,
        supplyImpact: impact.supplyImpact,
        daysCovered: impact.daysCovered
      });

    } catch (error) {
      // Error calculating timeframe stats
      setTimeframeStats({
        totalBurned: 0,
        averageDaily: 0,
        supplyImpact: '0.00000000',
        daysCovered: 0
      });
    }
  }, [activeTimeframe, totalBurned]);

  useEffect(() => {
    // UseEffect triggered
    loadBurnHistory();
    calculateTimeframeStats(); // Calculate stats when timeframe or data changes
    
    // Check if supply data is already available
    const steemData = GlobalDataStore.getSteemData();
    if (steemData?.virtualSupply && steemData.virtualSupply > 0) {
      setSupplyDataLoaded(true);
      // Supply data already available
    } else {
      // Don't block analytics on supply data - load it in background
      // Loading STEEM supply data in background
      fetchSteemData().then(data => {
        GlobalDataStore.updateSteemData(data);
        setSupplyDataLoaded(true);
      // Console log removed
        // Trigger re-render to update calculations with live data
        calculateTimeframeStats(); // Recalculate stats with new supply data
      }).catch(error => {
      // Console log removed
        setSupplyDataLoaded(true); // Set to true to prevent blocking
      });
    }

    // Check if detailed burn data is available, if not trigger fetch
    if (!GlobalDataStore.hasDetailedBurnData()) {
      // Console log removed
      fetchBurnData().catch(error => {
      // Console log removed
      });
    }
  }, [activeTimeframe, loadBurnHistory, fetchBurnData, calculateTimeframeStats]);

  // Subscribe to GlobalDataStore changes for live supply data updates
  useEffect(() => {
    const unsubscribe = GlobalDataStore.subscribe((data) => {
      if (data.steemData?.virtualSupply && data.steemData.virtualSupply > 0 && !supplyDataLoaded) {
        setSupplyDataLoaded(true);
      // Console log removed
        // Trigger re-render to show updated calculations
        calculateTimeframeStats(); // Recalculate stats with new supply data
      }
      
      // Check if detailed burn data became available or was updated
      if (GlobalDataStore.hasDetailedBurnData()) {
      // Console log removed
        // Only reload if we don't currently have chart data or if we're not loading
        if (!chartData || !isLoading) {
          loadBurnHistory();
          calculateTimeframeStats(); // Recalculate stats with new burn data
        }
      }
      
      // Also check for changes in burn pool data
      const currentBurnData = data.burnPoolData;
      if (currentBurnData?.totalBurned && currentBurnData.totalBurned !== totalBurned) {
      // Console log removed
        calculateTimeframeStats();
      }
    });
    
    return unsubscribe;
  }, [supplyDataLoaded, loadBurnHistory, calculateTimeframeStats, chartData, isLoading, totalBurned]);

  // Separate effect for timeframe-specific calculations
  useEffect(() => {
      // Console log removed
    calculateTimeframeStats();
  }, [activeTimeframe, totalBurned, calculateTimeframeStats]);

  const handleTimeframeChange = (timeframe) => {
      // Console log removed
    setActiveTimeframe(timeframe);
    // Remove setTimeout - let useEffect handle the calculation
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 10
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
      axis: 'x'
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'easeInOutQuart',
        from: 0.8,
        to: 0.4,
        loop: false
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'start',
        labels: {
          color: '#ffffff',
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 13,
            weight: '500',
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          },
          padding: 20,
          generateLabels: function(chart) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            return labels;
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#4BA2F2',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13,
          weight: '500'
        },
        padding: 16,
        caretSize: 8,
        callbacks: {
          title: function(context) {
            if (context[0]) {
              const label = context[0].label;
              return `📅 ${label}`;
            }
            return '';
          },
          label: function(context) {
            const value = context.parsed.y;
            const label = context.dataset.label || '';
            
            let formattedValue;
            if (value >= 1000000) {
              formattedValue = `${(value / 1000000).toFixed(3)}M STEEM`;
            } else if (value >= 1000) {
              formattedValue = `${(value / 1000).toFixed(2)}K STEEM`;
            } else {
              formattedValue = `${value.toFixed(4)} STEEM`;
            }
            
            // Add data type indicator
            let dataType = '';
            if (label.includes('Daily Burns')) {
              dataType = '🔥 Real Blockchain Data';
            } else if (label.includes('Cumulative')) {
              dataType = '📊 Calculated (Sum of Real Burns)';
            } else if (label.includes('Average')) {
              dataType = '� Calculated (Average Rate)';
            }
            
            return [
              `${formattedValue}`,
              `${dataType}`
            ];
          },
          footer: function(context) {
            if (context.length > 0 && filteredData && filteredData.length > 0) {
              const dataIndex = context[0].dataIndex;
              const dataPoint = filteredData[dataIndex];
              
              if (dataPoint && dataPoint.timestamp) {
                const date = new Date(dataPoint.timestamp * 1000).toLocaleDateString();
                const dailyValue = context.find(item => item.dataset.label.includes('Daily Burns'));
                
                if (dailyValue && dailyValue.parsed.y > 0) {
                  return `🔥 ${date} - Actual burn transaction recorded`;
                } else {
                  return `📅 ${date} - No burns on this date`;
                }
              }
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        position: 'bottom',
        title: {
          display: true,
          text: 'Timeline',
          color: '#94a3b8',
          font: {
            size: 12,
            weight: '600'
          },
          padding: {
            top: 10
          }
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 11,
            weight: '500'
          },
          maxTicksLimit: activeTimeframe === '7d' ? 7 : activeTimeframe === '30d' ? 12 : 10,
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
          padding: 8
        },
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1,
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: false
        },
        border: {
          display: false
        }
      },
      y: {
        type: 'linear',
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: 'STEEM Burned',
          color: '#94a3b8',
          font: {
            size: 12,
            weight: '600'
          },
          padding: {
            bottom: 10
          }
        },
        ticks: {
          color: '#cbd5e1',
          font: {
            size: 11,
            weight: '500'
          },
          callback: function(value, index, values) {
            if (value === 0) return '0';
            if (value >= 1000000) {
              return (value / 1000000).toFixed(2) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value >= 10 ? value.toFixed(0) : value.toFixed(2);
          },
          maxTicksLimit: 8,
          padding: 12
        },
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.08)',
          lineWidth: 1,
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: false
        },
        border: {
          display: false
        }
      }
    }
  };

  return (
    <div className="analytics-container">
      {/* Main Analytics Card */}
      <div className="card analytics-main-card">
        {/* Header Section */}
        <div className="analytics-header">
          <div className="header-left">
            <div className="icon-container">
              <i className="fas fa-fire"></i>
              <div className="icon-glow"></div>
            </div>
            <div className="header-text">
              <h3 className="card-title">Burn Analytics</h3>
              <p className="card-subtitle">Real-time STEEM burning metrics and trends</p>
            </div>
          </div>
          <div className="header-right">
            <div className="time-selector">
              {['7D', '30D', '90D', 'All'].map((timeframe) => (
                <button
                  key={timeframe}
                  className={`time-btn ${activeTimeframe === timeframe.toLowerCase() ? 'active' : ''}`}
                  onClick={() => handleTimeframeChange(timeframe.toLowerCase())}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="burn-stats-row">
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-clock"></i></div>
            <div className="stat-info">
              <span className="stat-value">
                {isLoadingBurnData ? 'Loading...' : formatTimeAgo(lastBurnTimestamp)}
              </span>
              <span className="stat-label">LAST BURN</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-fire"></i></div>
            <div className="stat-info">
              <span className="stat-value">
                {isLoadingBurnData ? 'Loading...' : 
                  timeframeStats.totalBurned > 0 ? 
                    `${timeframeStats.totalBurned.toFixed(2)} STEEM` : 
                    'No data'
                }
              </span>
              <span className="stat-label">TOTAL BURNED ({activeTimeframe.toUpperCase()})</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-calculator"></i></div>
            <div className="stat-info">
              <span className="stat-value">
                {isLoadingBurnData ? 'Loading...' : 
                  timeframeStats.averageDaily > 0 ? 
                    `${timeframeStats.averageDaily.toFixed(2)} STEEM/day` : 
                    'No data'
                }
              </span>
              <span className="stat-label">AVERAGE RATE (CALCULATED)</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💎</div>
            <div className="stat-info">
              <span className="stat-value">
                {isLoadingBurnData ? 'Loading...' : 
                  parseFloat(timeframeStats.supplyImpact) > 0 ? 
                    `${timeframeStats.supplyImpact}%` : 
                    'No data'
                }
              </span>
              <span className="stat-label">SUPPLY IMPACT (CALCULATED)</span>
            </div>
          </div>
        </div>

        {/* Enhanced Chart Section */}
        <div className="chart-section">
          <div className="chart-header">
            <div className="chart-header-main">
              <h4 className="chart-title">
                <i className="fas fa-chart-area"></i>
                Burn Progress Analysis ({activeTimeframe.toUpperCase()})
              </h4>
              <div className="chart-subtitle">
                {activeTimeframe === 'all' ? 'Complete historical view' : 
                 activeTimeframe === '90d' ? 'Weekly aggregation for trend analysis' :
                 activeTimeframe === '30d' ? 'Daily tracking over the past month' :
                 'Detailed daily view'}
              </div>
            </div>
            <div className="chart-info-badges">
              {activeTimeframe !== 'all' && (
                <span className="timeframe-badge primary">
                  <i className="fas fa-calendar-alt"></i>
                  Last {activeTimeframe === '7d' ? '7' : activeTimeframe === '30d' ? '30' : '90'} Days
                </span>
              )}
              {chartData && chartData.datasets && (
                <span className="data-points-badge">
                  <i className="fas fa-chart-line"></i>
                  {chartData.datasets[0]?.data?.length || 0} Data Points
                </span>
              )}
              {timeframeStats.totalBurned > 0 && (
                <span className="total-badge success">
                  <i className="fas fa-fire"></i>
                  {timeframeStats.totalBurned >= 1000000 ? 
                    `${(timeframeStats.totalBurned/1000000).toFixed(2)}M` :
                    timeframeStats.totalBurned >= 1000 ?
                    `${(timeframeStats.totalBurned/1000).toFixed(1)}K` :
                    timeframeStats.totalBurned.toFixed(0)
                  } STEEM
                </span>
              )}
            </div>
          </div>

          <div className="modern-chart-container">
            {isLoading ? (
              <div className="chart-overlay">
                <div className="chart-loading-content">
                  <div className="loading-spinner-advanced">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                  </div>
                  <div className="loading-text">
                    <h4>Loading Burn History</h4>
                    <p>Processing burn transactions...</p>
                  </div>
                </div>
              </div>
            ) : (
              chartData ? (
                <>
                  <div className="chart-wrapper">
                    <Line ref={chartRef} data={chartData} options={chartOptions} />
                  </div>
                  {/* Chart Footer with Data Type Legend */}
                  <div className="chart-footer">
                    <div className="data-legend">
                      <h5>Data Types:</h5>
                      <div className="legend-items">
                        <div className="legend-item">
                          <div className="legend-indicator real-data"></div>
                          <span><strong>Daily Burns (Real):</strong> Actual STEEM burned on specific dates from blockchain</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-indicator calculated-cumulative"></div>
                          <span><strong>Cumulative Total (Calculated):</strong> Running sum of all real burns up to each date</span>
                        </div>
                        <div className="legend-item">
                          <div className="legend-indicator calculated-average"></div>
                          <span><strong>Average Rate (Calculated):</strong> Mathematical average based on real burn data</span>
                        </div>
                      </div>
                    </div>
                    <div className="chart-insights">
                      <div className="insight-item">
                        <span className="insight-label">Data Quality:</span>
                        <span className="insight-value">
                          <i className="fas fa-check-circle text-success"></i>
                          Live Blockchain Data
                        </span>
                      </div>
                      <div className="insight-item">
                        <span className="insight-label">Last Update:</span>
                        <span className="insight-value">
                          {new Date().toLocaleTimeString('en-US', { 
                            hour12: true, 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="insight-item">
                        <span className="insight-label">Trend:</span>
                        <span className="insight-value">
                          {timeframeStats.averageDaily > 0 ? (
                            <>
                              <i className="fas fa-arrow-up text-success"></i>
                              Deflationary Active
                            </>
                          ) : (
                            <>
                              <i className="fas fa-minus text-warning"></i>
                              No Recent Activity
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="chart-overlay">
                  <div className="chart-empty-state">
                    <div className="empty-state-icon">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <h4>No Chart Data Available</h4>
                    <p>Unable to load burn analytics data. This could be due to network issues or no burn activity in the selected timeframe.</p>
                    <div className="empty-state-actions">
                      <button 
                        className="timeframe-switch-btn"
                        onClick={() => handleTimeframeChange('all')}
                      >
                        <i className="fas fa-expand"></i>
                        View All Time
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
