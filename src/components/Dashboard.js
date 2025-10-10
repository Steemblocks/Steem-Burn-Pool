import React, { useState, useEffect } from 'react';
import { 
  fetchSteemData, 
  formatLargeNumbers
} from '../services/steemApi';
import useBurnPoolData from '../hooks/useBurnPoolData';
import CacheManager from '../utils/CacheManager';
import GlobalDataStore from '../utils/GlobalDataStore';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    currentSupply: 'Loading...',
    inflation: 'Loading...',
    sbdSupply: 'Loading...',
    contributors: []
  });

  const [contributorsData, setContributorsData] = useState({
    contributors: [],
    total: 0,
    currentPage: 1,
    contributorsPerPage: 6
  });

  // Add refresh progress state
  const [refreshProgress, setRefreshProgress] = useState({ percentage: 0, message: '' });
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Use global burn pool data instead of local state
  const {
    totalBurned,
    steemPower,
    profileImage,
    account,
    contributorsCount,
    contributors,
    isLoadingBurnData,
    isLoadingSteemPower,
    isLoadingContributors,
    fetchBurnData
  } = useBurnPoolData();

  useEffect(() => {
    loadDashboardData();
    // Global hook will handle burn pool data automatically
  }, []);

  // Update contributors data when global data changes
  useEffect(() => {
    if (contributors && contributors.length > 0) {
      setContributorsData(prev => ({
        ...prev,
        contributors: contributors,
        total: contributorsCount
      }));
    }
  }, [contributors, contributorsCount]);

  const loadDashboardData = async () => {
    try {
      const data = await fetchSteemData();
      
      // Store STEEM data in GlobalDataStore for Analytics to use
      GlobalDataStore.updateSteemData(data);
      
      setDashboardData({
        currentSupply: `${formatLargeNumbers(data.currentSupply)} STEEM\n${formatLargeNumbers(data.currentSBDSupply)} SBD`,
        inflation: `Annual: ${data.inflationRate.toFixed(3)}%\nPer Day: ${formatLargeNumbers(data.newSteemPerDay)} STEEM`,
        sbdSupply: `Print: ${(data.sbdPrintRate / 100).toFixed(2)}%\nInterest: ${(data.sbdInterestRate / 100).toFixed(2)}%`,
        contributors: data.contributors || []
      });
    } catch (error) {
      // Console log removed
      // Show fallback data
      setDashboardData({
        currentSupply: '~422M STEEM\n~13.8M SBD',
        inflation: 'Annual: ~0.95%\nPer Day: ~1.1K STEEM',
        sbdSupply: 'Print: 10.00%\nInterest: 0.00%',
        contributors: []
      });
    }
  };

  const getCurrentPageContributors = () => {
    const { contributors, currentPage, contributorsPerPage } = contributorsData;
    const startIndex = (currentPage - 1) * contributorsPerPage;
    const endIndex = startIndex + contributorsPerPage;
    return contributors.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(contributorsData.total / contributorsData.contributorsPerPage);
  };

  // Manual refresh function for burn data only - bypasses ALL caching
  const handleManualBurnRefresh = async () => {
    if (isManualRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsManualRefreshing(true);
    setRefreshProgress({ percentage: 0, message: 'Clearing cache and starting fresh calculation...' });
    
    try {
      // Clear ALL cache layers for complete fresh calculation
      localStorage.removeItem('total-burned-steem-data');
      CacheManager.clearCache('burn-pool-data');
      // Console log removed
      
      // Force fresh calculation with progress tracking
      await fetchBurnData(true, (progress) => {
        setRefreshProgress(progress);
      });
      // Console log removed
    } catch (error) {
      // Console log removed
      setRefreshProgress({ percentage: 0, message: 'Refresh failed - please try again' });
    } finally {
      setIsManualRefreshing(false);
      // Clear progress after a delay
      setTimeout(() => {
        setRefreshProgress({ percentage: 0, message: '' });
      }, 3000);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Burn Pool Cards Row */}
      <div className="burnpool-cards-section">
        <div className="burnpool-burned-card card" style={{position: 'relative'}}>
          <button 
            className="burnpool-refresh-btn" 
            onClick={handleManualBurnRefresh}
            disabled={isLoadingBurnData || isManualRefreshing}
            title="Refresh Total Burned Data Only"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#19e68c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{
              transition: 'transform 0.2s',
              transform: isManualRefreshing ? 'rotate(360deg)' : 'none',
              animation: isManualRefreshing ? 'spin 1s linear infinite' : 'none'
            }}>
              <path d="M17.65 6.35A8 8 0 1 0 19 12h-1"/>
              <polyline points="23 4 23 10 17 10"/>
            </svg>
          </button>
          <div className="burnpool-card-content">
            <span className="burnpool-card-emoji">🔥</span>
            <div className="burnpool-card-title" style={{color: '#F26A4B'}}>
              Total STEEM Burned
            </div>
            <div className="burnpool-card-value">
              {(isLoadingBurnData || isManualRefreshing) ? (
                <div style={{fontSize: '14px', color: '#19e68c', textAlign: 'center'}}>
                  <i className="fas fa-spinner fa-spin"></i> 
                  {isManualRefreshing && refreshProgress.message ? (
                    <div>
                      <div style={{marginTop: '8px'}}>{refreshProgress.message}</div>
                      <div style={{
                        width: '100%', 
                        backgroundColor: '#333', 
                        borderRadius: '10px', 
                        margin: '8px 0',
                        height: '6px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${refreshProgress.percentage}%`,
                          height: '100%',
                          backgroundColor: '#19e68c',
                          borderRadius: '10px',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <small style={{fontSize: '12px', opacity: 0.8}}>
                        {refreshProgress.percentage}% complete
                      </small>
                    </div>
                  ) : (
                    <div>
                      Calculating burns...<br/>
                      <small style={{fontSize: '12px', opacity: 0.8}}>This may take 30-60 seconds</small>
                    </div>
                  )}
                </div>
              ) : `${totalBurned} STEEM`}
            </div>
          </div>
        </div>
        
        <div className="burnpool-burned-card card" style={{position: 'relative'}}>
          <div className="burnpool-card-content">
            {!isLoadingSteemPower && profileImage ? (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '10px'}}>
                <img 
                  src={profileImage} 
                  alt={account} 
                  style={{
                    width: '80px', 
                    height: '80px', 
                    borderRadius: '50%', 
                    marginBottom: '15px', 
                    objectFit: 'cover', 
                    border: '2px solid rgba(255,255,255,0.1)'
                  }}
                  onError={(e) => {
                    e.target.src = `https://steemitimages.com/u/${account}/avatar`;
                  }}
                />
                <div className="burnpool-card-title" style={{color: '#F26A4B'}}>
                  Burn Pool STEEM Power
                </div>
                <div className="burnpool-card-value burnpool-steempower-value">
                  {typeof steemPower === 'number' 
                    ? `${steemPower.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} SP`
                    : steemPower
                  }
                </div>
              </div>
            ) : (
              <>
                <div className="burnpool-card-title" style={{color: '#F26A4B'}}>
                  Burn Pool STEEM Power
                </div>
                <div className="burnpool-card-value burnpool-steempower-value">
                  {isLoadingSteemPower ? 'Loading...' : 
                    (typeof steemPower === 'number' 
                      ? `${steemPower.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} SP`
                      : steemPower)
                  }
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Regular Dashboard Cards Grid */}
      <div className="dashboard" id="dashboard-cards">
      <div className="card">
        <div className="card-header">
          <div className="card-icon"><i className="fas fa-cube"></i></div>
          <h3 className="card-title">Token Supply</h3>
        </div>
        <div className="card-value" style={{ whiteSpace: 'pre-line' }}>
          {dashboardData.currentSupply}
        </div>
        <p className="card-description">Total STEEM & SBD supply available on the blockchain.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon"><i className="fas fa-chart-line"></i></div>
          <h3 className="card-title">Inflation</h3>
        </div>
        <div className="card-value" style={{ whiteSpace: 'pre-line' }}>
          {dashboardData.inflation}
        </div>
        <p className="card-description">Annual inflation rate & estimated STEEM created daily.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-icon"><i className="fas fa-dollar-sign"></i></div>
          <h3 className="card-title">SBD Rates</h3>
        </div>
        <div className="card-value" style={{ whiteSpace: 'pre-line' }}>
          {dashboardData.sbdSupply}
        </div>
        <p className="card-description">Total SBD circulation print rate & interest rate.</p>
      </div>

      <div className="card contributors-card">
        <div className="card-header">
          <div className="card-icon"><i className="fas fa-users"></i></div>
          <h3 className="card-title">Burn Pool Contributors</h3>
        </div>
        <div className="card-description">
          {isLoadingContributors ? (
            <div className="contributors-loading">
              <div className="loading-spinner"></div>
              <p>Loading active delegators...</p>
            </div>
          ) : (
            <>
              {contributorsData.total > 0 ? (
                <>
                  <div className="contributors-header">
                    <div className="contributors-stats">
                      <span className="total-contributors">Total: {contributorsData.total} Contributors</span>
                      <span className="page-info">
                        Showing {((contributorsData.currentPage - 1) * contributorsData.contributorsPerPage) + 1}-{Math.min(contributorsData.currentPage * contributorsData.contributorsPerPage, contributorsData.total)} of {contributorsData.total}
                      </span>
                    </div>
                  </div>
                  
                  <div className="modern-contributors-grid">
                    {getCurrentPageContributors().map((contributor, idx) => {
                      const globalRank = ((contributorsData.currentPage - 1) * contributorsData.contributorsPerPage) + idx + 1;
                      return (
                        <div key={contributor.contributor} className="modern-contributor-card">
                          <div className="contributor-rank">#{globalRank}</div>
                          <div className="contributor-content">
                            <div className="contributor-avatar">
                              <img 
                                src={contributor.avatarUrl} 
                                alt={contributor.contributor}
                                onError={(e) => {
                                  e.target.src = 'https://cdn.steemitimages.com/0x0/https://steemit.com/images/profile-placeholder.png';
                                }}
                              />
                            </div>
                            <div className="contributor-name">@{contributor.contributor}</div>
                            <div className="contributor-sp">
                              {contributor.steem.toLocaleString(undefined, {maximumFractionDigits:0})} SP
                            </div>
                          </div>
                          <a 
                            href={`https://steemit.com/@${contributor.contributor}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="contributor-link"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </a>
                        </div>
                      );
                    })}
                  </div>

                  {getTotalPages() > 1 && (
                    <div className="pagination-controls">
                      <button 
                        onClick={() => setContributorsData(prev => ({...prev, currentPage: Math.max(1, prev.currentPage - 1)}))}
                        disabled={contributorsData.currentPage === 1}
                        className="pagination-btn"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <span className="pagination-info">
                        Page {contributorsData.currentPage} of {getTotalPages()}
                      </span>
                      <button 
                        onClick={() => setContributorsData(prev => ({...prev, currentPage: Math.min(getTotalPages(), prev.currentPage + 1)}))}
                        disabled={contributorsData.currentPage === getTotalPages()}
                        className="pagination-btn"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-contributors">
                  <p>No contributors found.</p>
                  <button onClick={() => window.location.reload()} className="retry-btn">
                    <i className="fas fa-sync-alt"></i> Retry
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
