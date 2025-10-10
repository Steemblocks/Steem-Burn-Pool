import React, { useState, useEffect } from 'react';
import { useBurnPoolData } from '../hooks/useBurnPoolData';
import InvitationCard from './InvitationCard';
import SupplyImpactCalculator from '../utils/SupplyImpactCalculator';
import './InvitationCard.css';

const Roadmap = () => {
  const [daysActive, setDaysActive] = useState(550);
  const [deflationRate, setDeflationRate] = useState('Loading...');
  
  // Use the global burn pool data hook
  const {
    totalBurned,
    contributorsCount,
    isLoadingBurnData,
    isLoadingContributors
  } = useBurnPoolData();

  useEffect(() => {
    // Calculate days active since January 1, 2025 (demo data period)
    const startDate = new Date('2025-01-01');
    const now = new Date();
    const days = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    setDaysActive(days);
  }, []);

  // Calculate dynamic deflation rate using shared calculator
  useEffect(() => {
    const calculateDeflationRate = async () => {
      if (isLoadingBurnData) {
        setDeflationRate('Loading...');
        return;
      }

      try {
        // Use shared calculator to ensure consistency with Analytics component
        const fallbackTotal = totalBurned ? parseFloat(totalBurned) : 0;
        const deflationRateValue = SupplyImpactCalculator.getDeflationRate(fallbackTotal);
        setDeflationRate(deflationRateValue);
        
      } catch (error) {
        // Console log removed
        setDeflationRate('Calculating...');
      }
    };

    calculateDeflationRate();
  }, [totalBurned, isLoadingBurnData]);

  return (
    <div className="modern-roadmap-container">
      {/* Header Section */}
      <div className="roadmap-modern-header">
        <div className="roadmap-header-icon">
          <div className="roadmap-icon-bg">
            <i className="fas fa-road"></i>
          </div>
        </div>
        <div className="roadmap-header-content">
          <h2 className="roadmap-main-title">Project Roadmap</h2>
          <p className="roadmap-subtitle">Building the Future of STEEM Deflationary Economics</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="modern-timeline">
        <div className="timeline-item completed" data-step="1">
          <div className="timeline-marker">
            <div className="marker-inner">
              <i className="fas fa-check"></i>
            </div>
            <div className="timeline-line"></div>
          </div>
          <div className="timeline-card">
            <div className="timeline-badge completed">Phase 1</div>
            <h3 className="timeline-title">STEEM Power Delegation System</h3>
            <p className="timeline-description">
              Users delegate their STEEM Power to the Burn Pool account, creating a decentralized network of participants committed to the deflationary mechanism.
            </p>
            <div className="timeline-stats">
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value completed">✓ Active</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Contributors</span>
                <span className="stat-value">
                  {isLoadingContributors ? (
                    <><i className="fas fa-spinner fa-spin"></i> Loading...</>
                  ) : (
                    `${contributorsCount}+ Delegators`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="timeline-item completed" data-step="2">
          <div className="timeline-marker">
            <div className="marker-inner">
              <i className="fas fa-check"></i>
            </div>
            <div className="timeline-line"></div>
          </div>
          <div className="timeline-card">
            <div className="timeline-badge completed">Phase 2</div>
            <h3 className="timeline-title">100% Curation Rewards Distribution</h3>
            <p className="timeline-description">
              All curation rewards earned by the Burn Pool are automatically distributed back to delegators, ensuring passive income for participants.
            </p>
            <div className="timeline-stats">
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value completed">✓ Operational</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rewards</span>
                <span className="stat-value">Weekly Distribution</span>
              </div>
            </div>
          </div>
        </div>

        <div className="timeline-item active" data-step="3">
          <div className="timeline-marker">
            <div className="marker-inner">
              <i className="fas fa-fire"></i>
            </div>
            <div className="timeline-line"></div>
          </div>
          <div className="timeline-card">
            <div className="timeline-badge active">Phase 3</div>
            <h3 className="timeline-title">Author Rewards Burn Mechanism</h3>
            <p className="timeline-description">
              100% of author rewards are permanently burned to @null, thus removing them from circulation and contributing to the deflationary model.
            </p>
            <div className="timeline-stats">
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value active">🔥 In Progress</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Burned</span>
                <span className="stat-value">
                  {isLoadingBurnData ? (
                    <><i className="fas fa-spinner fa-spin"></i> Loading...</>
                  ) : (
                    `${totalBurned} STEEM`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="timeline-item upcoming" data-step="4">
          <div className="timeline-marker">
            <div className="marker-inner">
              <i className="fas fa-coins"></i>
            </div>
            <div className="timeline-line"></div>
          </div>
          <div className="timeline-card">
            <div className="timeline-badge upcoming">Phase 4</div>
            <h3 className="timeline-title">Passive Income Opportunity</h3>
            <p className="timeline-description">
              Effortless passive income for investors through seamless STEEM Power delegation. Simply delegate your SP and earn consistent returns without any portfolio management or active involvement required.
            </p>
            <div className="timeline-stats">
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value">✓ Operational</span>
              </div>
            </div>
          </div>
        </div>

        <div className="timeline-item upcoming" data-step="5">
          <div className="timeline-marker">
            <div className="marker-inner">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="timeline-line"></div>
          </div>
          <div className="timeline-card">
            <div className="timeline-badge upcoming">Phase 5</div>
            <h3 className="timeline-title">Deflationary Impact on STEEM Blockchain</h3>
            <p className="timeline-description">
              Monitoring and analyzing the deflationary impact effects on STEEM's circulating supply and long-term price stability.
            </p>
            <div className="timeline-stats">
              <div className="stat-item">
                <span className="stat-label">Status</span>
                <span className="stat-value">Planning</span>
              </div>
            </div>
          </div>
        </div>

        <div className="timeline-item future" data-step="6">
          <div className="timeline-marker">
            <div className="marker-inner">
              <i className="fas fa-rocket"></i>
            </div>
          </div>
          <div className="timeline-card">
            <div className="timeline-badge future">Phase 6</div>
            <h3 className="timeline-title">Ecosystem Expansion</h3>
            <p className="timeline-description">
              Cross-platform integration and strategic partnerships to maximize the deflationary impact across the entire STEEM ecosystem.
            </p>
            <div className="timeline-stats">
              <div className="stat-item">
                <span className="stat-label">Vision</span>
                <span className="stat-value">2026+</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Scope</span>
                <span className="stat-value">Full Ecosystem</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invitation Card */}
      <InvitationCard 
        totalBurned={totalBurned}
        deflationRate={deflationRate}
        contributorsCount={contributorsCount}
        daysActive={daysActive}
        isLoadingBurnData={isLoadingBurnData}
        isLoadingContributors={isLoadingContributors}
      />
    </div>
  );
};

export default Roadmap;
