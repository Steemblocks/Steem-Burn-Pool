import React, { useState, useEffect } from 'react';

const Delegation = () => {
  // Separate state for each delegation method
  const [keychainAmount, setKeychainAmount] = useState('');
  const [keychainUsername, setKeychainUsername] = useState('');
  const [steemloginAmount, setSteemloginAmount] = useState('');
  const [steemloginUsername, setSteemloginUsername] = useState('');
  const [isKeychainProcessing, setIsKeychainProcessing] = useState(false);
  const [isSteemloginProcessing, setIsSteemloginProcessing] = useState(false);
  const [isKeychainAvailable, setIsKeychainAvailable] = useState(false);
  const [spToVestsRate, setSpToVestsRate] = useState(1658.74); // Default fallback rate

  // Function to fetch real-time SP to VESTS conversion rate
  const fetchConversionRate = async () => {
    try {
      const response = await fetch('https://api.justyy.workers.dev/api/steemit/vests/?cached');
      const data = await response.json();
      if (data.sp_to_vests) {
        setSpToVestsRate(data.sp_to_vests);
        // Console log removed
      }
    } catch (error) {
        // Console log removed
    }
  };

  // FIXED: Strict Steem Keychain detection only - no other wallets
  useEffect(() => {
    // Fetch conversion rate on component mount
    fetchConversionRate();
    
    const checkSteemKeychainOnly = () => {
      // ONLY check for Steem Keychain specifically - ignore MetaMask, Phantom, etc.
      const hasSteemKeychain = typeof window !== 'undefined' && 
                              window.steem_keychain && 
                              typeof window.steem_keychain === 'object' &&
                              typeof window.steem_keychain.requestDelegation === 'function';
      
      if (hasSteemKeychain) {
        // Console log removed
        setIsKeychainAvailable(true);
        
        // Optional: Verify with handshake (but don't require it)
        try {
          if (window.steem_keychain.requestHandshake && 
              typeof window.steem_keychain.requestHandshake === 'function') {
            window.steem_keychain.requestHandshake((result) => {
        // Console log removed
            });
          }
        } catch (error) {
        // Console log removed
        }
      } else {
        // Console log removed
        setIsKeychainAvailable(false);
      }
    };

    // Single check on component mount
    checkSteemKeychainOnly();
    
    // One delayed check for extension injection
    const delayedCheck = setTimeout(() => {
      checkSteemKeychainOnly();
    }, 1500);
    
    // Cleanup
    return () => {
      clearTimeout(delayedCheck);
    };
  }, []); // No dependencies to prevent re-runs

  const handleKeychainDelegate = async () => {
    // STRICT: Only allow Steem Keychain - works on all operating systems (Windows, Mac, Linux)
    if (!window.steem_keychain || 
        typeof window.steem_keychain !== 'object' ||
        typeof window.steem_keychain.requestDelegation !== 'function') {
      throw new Error('Steem Keychain extension is not properly installed. Please install the Steem Keychain browser extension and refresh the page.');
    }

    // Validate amount
    const numericAmount = parseFloat(keychainAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error('Please enter a valid delegation amount');
    }
    
    // Format amount exactly as Keychain expects: string with 3 decimals
    const formattedAmount = numericAmount.toFixed(3);
    
    // Calling STEEM KEYCHAIN for delegation

    return new Promise((resolve, reject) => {
      try {
        // Direct call to Steem Keychain only
        window.steem_keychain.requestDelegation(
          keychainUsername || null, // username - use specified account or let user choose
          'global-steem',         // delegatee - Burn Pool Steem Power account
          formattedAmount,         // amount as string with 3 decimals
          'SP',                   // unit
          (response) => {         // callback function
        // Console log removed
            
            if (response) {
              if (response.success) {
                resolve(response);
              } else if (response.cancel) {
                reject(new Error('Delegation cancelled by user'));
              } else {
                const errorMsg = response.message || response.error || 'Delegation failed';
                reject(new Error(errorMsg));
              }
            } else {
              reject(new Error('No response from Steem Keychain'));
            }
          }
        );
      } catch (error) {
        // Console log removed
        reject(new Error(`Steem Keychain error: ${error.message}`));
      }
    });
  };

  // Test function - Steem Keychain only
  const testKeychainDelegation = () => {
        // Console log removed
    
    if (!window.steem_keychain) {
      alert('❌ Steem Keychain not available - make sure you installed the STEEM KEYCHAIN extension (not MetaMask or other wallets)');
      return;
    }
    
    if (typeof window.steem_keychain.requestDelegation !== 'function') {
      alert('❌ Steem Keychain detected but requestDelegation method not available');
      return;
    }
    
        // Console log removed
    
    try {
      window.steem_keychain.requestDelegation(
        null,           // username
        'global-steem', // delegatee
        '1.000',        // amount
        'SP',           // unit
        (response) => {
        // Console log removed
          alert(`✅ Test successful: ${JSON.stringify(response, null, 2)}`);
        }
      );
    } catch (error) {
        // Console log removed
      alert(`❌ Test error: ${error.message}`);
    }
  };

  // Add separate handlers for each delegation method
  const handleKeychainDelegation = async (e) => {
    e.preventDefault();
    
    if (!keychainAmount) {
      alert('Please enter delegation amount');
      return;
    }

    if (parseFloat(keychainAmount) < 100) {
      alert('Minimum delegation is 100 SP');
      return;
    }

    setIsKeychainProcessing(true);
    
    try {
      await handleKeychainDelegate();
      alert(`Successfully delegated ${keychainAmount} SP to burn pool via Steem Keychain!`);
      setKeychainAmount('');
      setKeychainUsername('');
    } catch (error) {
        // Console log removed
      
      if (error.message.includes('cancelled')) {
        alert('Delegation was cancelled by user');
      } else if (error.message.includes('Keychain')) {
        alert(`Keychain error: ${error.message}\n\nTip: Make sure Steem Keychain is unlocked and you have sufficient Steem Power.`);
      } else {
        alert(`Delegation failed: ${error.message}`);
      }
    } finally {
      setIsKeychainProcessing(false);
    }
  };

  const handleSteemLoginDelegation = async (e) => {
    e.preventDefault();
    
    if (!steemloginUsername || !steemloginAmount) {
      alert('Please fill in all fields');
      return;
    }

    if (parseFloat(steemloginAmount) < 100) {
      alert('Minimum delegation is 100 SP');
      return;
    }

    setIsSteemloginProcessing(true);
    
    try {
      // Use the stored conversion rate (updated on component mount)
      const vestsAmount = parseFloat(steemloginAmount) * spToVestsRate;
      
      const delegationData = {
        delegator: steemloginUsername,
        delegatee: 'global-steem',
        vesting_shares: `${vestsAmount.toFixed(6)} VESTS`,
      };
      
      const steemLoginUrl = `https://steemlogin.com/sign/delegate_vesting_shares?${new URLSearchParams(delegationData).toString()}`;
      window.open(steemLoginUrl, '_blank');
      
      alert(`Opening SteemLogin in new tab. Please complete your delegation of ${steemloginAmount} SP (${vestsAmount.toFixed(6)} VESTS) to @global-steem`);
      setSteemloginAmount('');
      setSteemloginUsername('');
    } catch (error) {
        // Console log removed
      alert(`Delegation failed: ${error.message}`);
    } finally {
      setIsSteemloginProcessing(false);
    }
  };

  return (
    <div id="delegation-tab-content">
      <div id="delegation-widget">
        {/* Header for delegation section */}
        <div className="delegation-header" style={{textAlign: 'center', marginBottom: '30px', padding: '20px 0'}}>
          <h2 style={{color: '#fff', marginBottom: '0', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', lineHeight: '1.3'}}>
            <i className="fas fa-hand-holding-usd" style={{marginRight: '10px'}}></i>
            Delegate to Burn Pool
          </h2>
        </div>

        <div style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '20px', 
          marginBottom: '40px',
          padding: '0 10px'
        }}>
          
          {/* Keychain Delegation Card */}
          <div className="card delegation-widget-card">
            <div className="card-header">
              <div className="card-icon"><i className="fas fa-key"></i></div>
              <h3 className="card-title">Steem Keychain Delegation</h3>
              {isKeychainAvailable && (
                <div className="keychain-status">
                  <i className="fas fa-check-circle" style={{color: '#28a745'}}></i>
                  <span style={{color: '#28a745', fontSize: '12px', marginLeft: '5px'}}>
                    Available
                  </span>
                </div>
              )}
            </div>
            
            <div className="card-content">
              {!isKeychainAvailable ? (
                <div className="keychain-notice" style={{
                  background: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-info-circle" style={{color: '#ffc107', marginRight: '8px'}}></i>
                  <div style={{color: '#ffc107', fontSize: '14px'}}>
                    <div style={{marginBottom: '8px'}}>
                      Install Steem Keychain (works on Windows, Mac, Linux) for secure delegation:
                    </div>
                    <div style={{display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap'}}>
                      <a href="https://chromewebstore.google.com/detail/steemkeychain/jhgnbkkipaallpehbohjmkbjofjdmeid" 
                         target="_blank" rel="noopener noreferrer" 
                         style={{color: '#ffc107', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                        <i className="fab fa-chrome"></i>
                        Chrome Extension
                      </a>
                      <a href="https://addons.mozilla.org/en-US/firefox/addon/steem-keychain/" 
                         target="_blank" rel="noopener noreferrer" 
                         style={{color: '#ffc107', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                        <i className="fab fa-firefox-browser"></i>
                        Firefox Add-on
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(40, 167, 69, 0.1)',
                  border: '1px solid rgba(40, 167, 69, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <i className="fas fa-shield-alt" style={{color: '#28a745', marginRight: '8px'}}></i>
                  <span style={{color: '#28a745', fontSize: '14px'}}>
                    Secure, one-click delegation with your browser extension
                  </span>
                </div>
              )}
              
              <form onSubmit={handleKeychainDelegation} className="delegation-form">
                <div className="form-group">
                  <label htmlFor="keychain-username">Steem Username</label>
                  <input
                    type="text"
                    id="keychain-username"
                    value={keychainUsername}
                    onChange={(e) => setKeychainUsername(e.target.value)}
                    placeholder="Enter your Steem username"
                    disabled={isKeychainProcessing || !isKeychainAvailable}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="keychain-amount">Delegation Amount (SP)</label>
                  <input
                    type="number"
                    id="keychain-amount"
                    value={keychainAmount}
                    onChange={(e) => setKeychainAmount(e.target.value)}
                    placeholder="Amount to delegate (minimum 100 SP)"
                    min="100"
                    step="0.001"
                    disabled={isKeychainProcessing || !isKeychainAvailable}
                  />
                  {keychainAmount && (
                    <small style={{color: '#a0a0a0', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                      ≈ {(parseFloat(keychainAmount) * spToVestsRate).toFixed(6)} VESTS (Rate: {spToVestsRate.toFixed(2)} VESTS/SP)
                    </small>
                  )}
                </div>
                
                <div className="delegation-info">
                  <div className="info-item">
                    <i className="fas fa-shield-alt"></i>
                    <span>Secure delegation via browser extension</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-user-check"></i>
                    <span>Choose specific account or let Keychain select</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-desktop"></i>
                    <span>Works on Windows, Mac, and Linux</span>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="delegate-btn"
                  disabled={isKeychainProcessing || !isKeychainAvailable}
                  style={{
                    background: isKeychainAvailable ? 'linear-gradient(45deg, #28a745, #20c997)' : '#6c757d',
                    cursor: isKeychainAvailable ? 'pointer' : 'not-allowed'
                  }}
                >
                  {isKeychainProcessing ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key"></i>
                      {isKeychainAvailable ? 'Delegate with Keychain' : 'Install Keychain First'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* SteemLogin Delegation Card */}
          <div className="card delegation-widget-card">
            <div className="card-header">
              <div className="card-icon"><i className="fas fa-sign-in-alt"></i></div>
              <h3 className="card-title">SteemLogin Delegation</h3>
              <div className="keychain-status">
                <i className="fas fa-globe" style={{color: '#007bff'}}></i>
                <span style={{color: '#007bff', fontSize: '12px', marginLeft: '5px'}}>
                  Web-based
                </span>
              </div>
            </div>
            
            <div className="card-content">
              <div style={{
                background: 'rgba(0, 123, 255, 0.1)',
                border: '1px solid rgba(0, 123, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <i className="fas fa-globe" style={{color: '#007bff', marginRight: '8px'}}></i>
                <span style={{color: '#007bff', fontSize: '14px'}}>
                  Official Steem web authentication service
                </span>
              </div>
              
              <form onSubmit={handleSteemLoginDelegation} className="delegation-form">
                <div className="form-group">
                  <label htmlFor="steemlogin-username">Steem Username</label>
                  <input
                    type="text"
                    id="steemlogin-username"
                    value={steemloginUsername}
                    onChange={(e) => setSteemloginUsername(e.target.value)}
                    placeholder="Enter your Steem username"
                    disabled={isSteemloginProcessing}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="steemlogin-amount">Delegation Amount (SP)</label>
                  <input
                    type="number"
                    id="steemlogin-amount"
                    value={steemloginAmount}
                    onChange={(e) => setSteemloginAmount(e.target.value)}
                    placeholder="Amount to delegate (minimum 100 SP)"
                    min="100"
                    step="0.001"
                    disabled={isSteemloginProcessing}
                  />
                  {steemloginAmount && (
                    <small style={{color: '#a0a0a0', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                      ≈ {(parseFloat(steemloginAmount) * spToVestsRate).toFixed(6)} VESTS (Rate: {spToVestsRate.toFixed(2)} VESTS/SP)
                    </small>
                  )}
                </div>
                
                <div className="delegation-info">
                  <div className="info-item">
                    <i className="fas fa-globe"></i>
                    <span>Official Steem authentication</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-user-edit"></i>
                    <span>Enter your username manually</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-external-link-alt"></i>
                    <span>Redirects to SteemLogin.com</span>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="delegate-btn"
                  disabled={isSteemloginProcessing}
                  style={{
                    background: 'linear-gradient(45deg, #007bff, #0056b3)'
                  }}
                >
                  {isSteemloginProcessing ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      Delegate with SteemLogin
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Debug section for Keychain troubleshooting */}
        {isKeychainAvailable && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(0, 123, 255, 0.1)',
            border: '1px solid rgba(0, 123, 255, 0.3)',
            borderRadius: '8px'
          }}>
            <h4 style={{color: '#007bff', marginBottom: '10px', fontSize: '14px'}}>
              <i className="fas fa-bug"></i> Debug Info
            </h4>
            <div style={{fontSize: '12px', color: '#6c757d'}}>
              <p>Keychain Status: {isKeychainAvailable ? '✅ Available' : '❌ Not Available'}</p>
              <p>Window.steem_keychain: {window.steem_keychain ? '✅ Present' : '❌ Missing'}</p>
              <p>RequestDelegation Method: {window.steem_keychain?.requestDelegation ? '✅ Available' : '❌ Missing'}</p>
            </div>
            <button 
              type="button"
              onClick={() => {
        // Console log removed
        // Console log removed
        // Console log removed
                
                if (window.steem_keychain) {
                  if (window.steem_keychain.requestHandshake) {
        // Console log removed
                    window.steem_keychain.requestHandshake((result) => {
        // Console log removed
                      const resultText = result !== undefined ? JSON.stringify(result) : 'undefined (this is normal for some Keychain versions)';
                      alert(`Keychain handshake result: ${resultText}\n\nKeychain is working if this popup appeared!`);
                    });
                  } else {
                    alert('Keychain detected but requestHandshake method not available.\nThis is normal - Keychain should still work for delegation.');
                  }
                } else {
                  alert('Keychain not detected. Please install and refresh the page.');
                }
              }}
              style={{
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Test Keychain Connection
            </button>
            <button 
              type="button"
              onClick={testKeychainDelegation}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '10px',
                marginLeft: '10px'
              }}
            >
              Test Delegation (1 SP)
            </button>
          </div>
        )}
      </div>

      <div className="delegation-placeholder">
        <div className="placeholder-icon">
          <i className="fas fa-tools"></i>
        </div>
        <h3>More Delegation Tools Coming Soon</h3>
        <p>We're working on enhanced delegation features. Stay tuned for updates!</p>
      </div>
    </div>
  );
};

export default Delegation;
