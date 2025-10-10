import React, { useState, useEffect } from 'react';
import useBurnPoolData from '../hooks/useBurnPoolData';

const Header = () => {
  const {
    totalBurned,
    burnsToday,
    isLoadingBurnData
  } = useBurnPoolData();

  const [headerStats, setHeaderStats] = useState({
    burnsToday: '--',
    totalBurned: '--'
  });

  // Update header stats when burn pool data changes
  useEffect(() => {
    if (!isLoadingBurnData && totalBurned && burnsToday !== undefined) {
      setHeaderStats({
        burnsToday: parseFloat(burnsToday) > 0 ? `${parseFloat(burnsToday).toFixed(2)} STEEM` : '0 STEEM',
        totalBurned: totalBurned !== 'Loading...' ? `${parseFloat(totalBurned).toFixed(2)} STEEM` : '--'
      });
    }
  }, [totalBurned, burnsToday, isLoadingBurnData]);

  return (
    <header id="main-header">
      <div className="modern-header">
        <div className="header-backdrop"></div>
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo-glow"></div>
              <img 
                src="https://steemitimages.com/p/6VvuHGsoU2QBt9MXeXNdDuyd4Bmd63j7zJymDTWgdcJjnzhQTq4LSkr2mFjdEkNXnLDst1GLDgqZ6hnZAefGjx6b6JgdNUiMV4sQ3uaKDVZvwAeJWX688ZBThaaVk2" 
                alt="STEEM Logo" 
                className="logo-img"
              />
            </div>
            <div className="brand-info">
              <h1 className="brand-title">STEEM BURN POOL</h1>
              <p className="brand-tagline">Delegation Pays, Supply Decays!</p>
              <div className="brand-accent"></div>
            </div>
          </div>
          <div className="header-right">
            <div className="live-indicator">
              <div className="pulse-dot"></div>
              <span>LIVE</span>
            </div>
            <div className="stats-preview">
              <div className="stat-mini">
                <span className="stat-label">Burns Today</span>
                <span className="stat-value">{headerStats.burnsToday}</span>
              </div>
              <div className="stat-mini">
                <span className="stat-label">Total Burned</span>
                <span className="stat-value">{headerStats.totalBurned}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
