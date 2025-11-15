import React from 'react';

const About = () => {
  return (
    <div className="about-container">
      {/* Mission Section */}
      <section className="about-section">
        <div className="about-card">
          <h2 className="about-card-title">
            <i className="fas fa-bullseye"></i> Our Mission
          </h2>
          <p className="about-card-text">
            The STEEM Burn Pool is dedicated to permanently reducing the circulating supply of STEEM through strategic delegation and managed burns. By encouraging community participation through delegation rewards, we work to increase the scarcity and value of the STEEM token while promoting long-term network health.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="about-section">
        <div className="about-card">
          <h2 className="about-card-title">
            <i className="fas fa-cogs"></i> How It Works
          </h2>
          <div className="about-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Delegate STEEM Power</h3>
                <p>Users delegate their STEEM Power to the burn pool account</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Earn Rewards</h3>
                <p>Delegators receive rewards for their participation in the burn initiative</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Burn STEEM</h3>
                <p>The pool systematically burns STEEM by sending it to @null beneficiary</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Reduce Supply</h3>
                <p>Every burned STEEM permanently reduces the total circulating supply</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Accounts Section */}
      <section className="about-section">
        <div className="about-card">
          <h2 className="about-card-title">
            <i className="fas fa-users"></i> Key Accounts
          </h2>
          <div className="accounts-grid">
            <div className="account-box">
              <div className="account-icon">🏛️</div>
              <h3>Burn Pool Account</h3>
              <p className="account-name">@steemburnpool</p>
              <p className="account-description">
                Receives delegations from the community and manages the burn pool's STEEM Power
              </p>
              <a 
                href="https://steemit.com/@steemburnpool" 
                target="_blank" 
                rel="noopener noreferrer"
                className="account-link"
              >
                Visit on Steemit <i className="fas fa-external-link-alt"></i>
              </a>
            </div>
            <div className="account-box">
              <div className="account-icon">🔥</div>
              <h3>Burn Tracking Account</h3>
              <p className="account-name">@steemburnup</p>
              <p className="account-description">
                Posts burn transactions with @null beneficiary to permanently remove STEEM from circulation
              </p>
              <a 
                href="https://steemit.com/@steemburnup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="account-link"
              >
                Visit on Steemit <i className="fas fa-external-link-alt"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="about-section">
        <div className="about-card">
          <h2 className="about-card-title">
            <i className="fas fa-star"></i> Benefits
          </h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <i className="fas fa-arrow-up"></i>
              <h3>Increased Scarcity</h3>
              <p>Reduced STEEM supply can contribute to higher token value over time</p>
            </div>
            <div className="benefit-item">
              <i className="fas fa-gift"></i>
              <h3>Delegator Rewards</h3>
              <p>Earn rewards for participating in the burn initiative</p>
            </div>
            <div className="benefit-item">
              <i className="fas fa-heartbeat"></i>
              <h3>Network Health</h3>
              <p>Promoting sustainable token economics and long-term network growth</p>
            </div>
            <div className="benefit-item">
              <i className="fas fa-globe"></i>
              <h3>Transparent Tracking</h3>
              <p>Real-time analytics showing all burns and pool statistics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="about-section">
        <div className="about-card">
          <h2 className="about-card-title">
            <i className="fas fa-chart-line"></i> Transparency & Analytics
          </h2>
          <p className="about-card-text">
            The STEEM Burn Pool maintains complete transparency through our Analytics dashboard. Track all burn transactions in real-time, view historical burn data across multiple timeframes, and monitor the effectiveness of our supply reduction initiatives. Every transaction is permanently recorded on the STEEM blockchain.
          </p>
          <div className="stats-highlight">
            <p>Visit our <strong>Analytics</strong> page to see detailed burn statistics and trends</p>
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="about-section">
        <div className="about-card about-cta">
          <h2 className="about-card-title">
            <i className="fas fa-handshake"></i> Get Involved
          </h2>
          <p className="about-card-text">
            Join the STEEM Burn Pool community and participate in reducing the circulating supply. By delegating your STEEM Power, you're contributing to the long-term sustainability and value of the STEEM network.
          </p>
          <a href="/delegate" className="about-button">
            <i className="fas fa-hand-holding-usd"></i> Delegate Now
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;
