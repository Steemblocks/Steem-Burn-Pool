import React, { useState, useEffect } from 'react';
import './ConstructionPopup.css';

const ConstructionPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup today
    const lastShown = localStorage.getItem('construction-popup-last-shown');
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      // Show popup after a brief delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Remember that user has seen the popup today
    localStorage.setItem('construction-popup-last-shown', new Date().toDateString());
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="construction-popup-overlay" onClick={handleBackdropClick}>
      <div className="construction-popup">
        <div className="construction-header">
          <div className="construction-icon">
            <i className="fas fa-hard-hat"></i>
          </div>
          <h2>🚧 Project Under Construction 🚧</h2>
          <button className="close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="construction-content">
          <div className="demo-notice">
            <h3>
              <i className="fas fa-info-circle"></i>
              Demo Environment Notice
            </h3>
            <p>
              This Steem Burn Pool application is currently in <strong>development phase</strong> and using demo accounts for testing purposes.
            </p>
          </div>

          <div className="demo-accounts">
            <h4>Current Demo Accounts:</h4>
            <div className="account-list">
              <div className="account-item">
                <i className="fas fa-user-circle"></i>
                <div className="account-info">
                  <span className="account-label">Burn Account:</span>
                  <span className="account-name">@steemburnup</span>
                </div>
              </div>
              <div className="account-item">
                <i className="fas fa-server"></i>
                <div className="account-info">
                  <span className="account-label">Burn Pool Witness:</span>
                  <span className="account-name">@steemburnpool</span>
                </div>
              </div>
            </div>
          </div>

          <div className="status-info">
            <h4>Development Status:</h4>
            <ul>
              <li><i className="fas fa-check text-success"></i> Core burn tracking functionality</li>
              <li><i className="fas fa-check text-success"></i> Real-time analytics dashboard</li>
              <li><i className="fas fa-check text-success"></i> Supply impact calculations</li>
              <li><i className="fas fa-spinner text-warning"></i> Final account setup pending</li>
              <li><i className="fas fa-spinner text-warning"></i> Production deployment preparation</li>
            </ul>
          </div>

          <div className="warning-box">
            <i className="fas fa-exclamation-triangle"></i>
            <p>
              <strong>Important:</strong> Data shown is for demonstration purposes only. 
              The actual burn pool accounts and statistics will be different in the production version.
            </p>
          </div>

          <div className="construction-actions">
            <button className="btn-primary" onClick={handleClose}>
              <i className="fas fa-rocket"></i>
              Continue to Demo
            </button>
            <a 
              href="https://steemit.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-secondary"
            >
              <i className="fas fa-external-link-alt"></i>
              Visit Steemit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionPopup;