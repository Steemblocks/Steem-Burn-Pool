import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import ConstructionPopup from './components/ConstructionPopup';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RoadmapPage from './pages/RoadmapPage';
import DelegationPage from './pages/DelegationPage';
import CacheManager from './utils/CacheManager';
import GlobalDataStore from './utils/GlobalDataStore';
import { fetchSteemData } from './services/steemApi';
import './index.css';

function App() {
  useEffect(() => {
    // Initialize all managers and stores
    CacheManager.init();
    GlobalDataStore.init();
    
    // Preload STEEM supply data for Analytics
    const loadGlobalSupplyData = async () => {
      try {
        const steemData = await fetchSteemData();
        GlobalDataStore.updateSteemData(steemData);
      } catch (error) {
        // Failed to preload STEEM supply data
      }
    };
    
    loadGlobalSupplyData();
  }, []);

  return (
    <Router>
      <div className="container">
        <Header />
        <TabNavigation />
        
        <div className="tab-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/delegate" element={<DelegationPage />} />
          </Routes>
        </div>
        
        {/* Construction Popup */}
        <ConstructionPopup />
      </div>
    </Router>
  );
}

export default App;
