import React from 'react';

const InvitationCard = ({ 
  totalBurned, 
  deflationRate, 
  contributorsCount, 
  daysActive,
  isLoadingBurnData,
  isLoadingContributors 
}) => {
  return (
    <div className="deflationary-invitation">
      <div className="invitation-content">
        <h2 className="invitation-main-title">Join the Deflationary Revolution</h2>
        <p className="invitation-description">
          Delegate your STEEM Power today and earn passive income while contributing to a deflationary STEEM economy.
        </p>
        
        <div className="invitation-buttons">
          <button 
            className="btn-start-delegating"
            onClick={() => {
              // Navigate to delegate page
              window.location.href = '/delegate';
            }}
          >
            <i className="fas fa-arrow-down"></i>
            Start Delegating
          </button>
          <button 
            className="btn-learn-more"
            onClick={() => {
              // Open Steemit profile in new tab
              window.open('https://steemit.com/@global-steem', '_blank');
            }}
          >
            <i className="fas fa-external-link-alt"></i>
            Learn More
          </button>
        </div>

        {/* Current Stats */}
        <div className="invitation-stats">
          <div className="stat-item">
            <span className="stat-value">
              {isLoadingBurnData ? 'Loading...' : `${totalBurned} STEEM`}
            </span>
            <span className="stat-label">Total Burned</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{deflationRate}</span>
            <span className="stat-label">Deflation Rate</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {isLoadingContributors ? 'Loading...' : `${contributorsCount}+`}
            </span>
            <span className="stat-label">Active Delegators</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationCard;
