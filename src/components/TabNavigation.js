import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const TabNavigation = () => {
  const location = useLocation();
  
  const tabs = [
    { id: 'dashboard', path: '/', icon: 'fas fa-home', label: 'Dashboard' },
    { id: 'analytics', path: '/analytics', icon: 'fas fa-chart-bar', label: 'Analytics' },
    { id: 'roadmap', path: '/roadmap', icon: 'fas fa-road', label: 'Roadmap' },
    { id: 'delegation', path: '/delegate', icon: 'fas fa-hand-holding-usd', label: 'Delegate' },
    { id: 'about', path: '/about', icon: 'fas fa-info-circle', label: 'About' }
  ];

  return (
    <div className="tab-navigation">
      <div className="tab-container">
        {tabs.map(tab => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`tab-button ${location.pathname === tab.path ? 'active' : ''}`}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
