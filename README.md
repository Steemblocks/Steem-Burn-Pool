# Steem Burn Pool - React.js Version

This is the React.js version of the Steem Burn Pool dashboard, converted from the original HTML/JavaScript implementation while maintaining all functionality and design.

## Features

- **Dashboard**: Real-time display of STEEM supply, inflation rates, and SBD metrics
- **Analytics**: Interactive burn history charts with Chart.js integration
- **Roadmap**: Development progress tracking with visual indicators
- **Delegation**: Interface for delegating STEEM Power to the burn pool

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd "Steem Burn Pool"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.js       # Application header with stats
│   ├── TabNavigation.js # Tab navigation component
│   ├── Dashboard.js    # Main dashboard with metrics
│   ├── Analytics.js    # Burn history charts
│   ├── Roadmap.js      # Development roadmap
│   └── Delegation.js   # Delegation interface
├── services/           # API services
│   └── steemApi.js     # Steem blockchain API integration
├── utils/              # Utility functions
│   ├── LoadingStateManager.js # Loading state management
│   └── CacheManager.js # Data caching utilities
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Main styles
```

## Technologies Used

- **React** 18.2.0 - Frontend framework
- **Chart.js** & **react-chartjs-2** - Data visualization
- **Font Awesome** - Icons
- **CSS3** - Styling with gradients and animations

## API Integration

The app integrates with:
- SteemWorld API for blockchain data
- Steem.js library for blockchain interactions

## Deployment

To build for production:

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Original Features Preserved

All features from the original HTML version have been preserved:

✅ **Visual Design**: Identical UI/UX with gradients, animations, and responsiveness  
✅ **Dashboard Metrics**: Real-time STEEM supply, inflation, and SBD data  
✅ **Interactive Charts**: Burn history visualization  
✅ **Tab Navigation**: Smooth transitions between sections  
✅ **Loading States**: Proper loading indicators and fallback data  
✅ **Responsive Design**: Mobile-optimized layouts  
✅ **API Integration**: SteemWorld API connectivity  
✅ **Caching System**: Efficient data caching  
✅ **Error Handling**: Graceful fallbacks for network issues  

## Enhancements in React Version

- **Component-based Architecture**: Better code organization and reusability
- **State Management**: Improved data flow with React hooks
- **Performance**: Optimized re-rendering and bundle splitting
- **Developer Experience**: Hot reloading and better debugging
- **Maintainability**: Cleaner separation of concerns

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and support, please open an issue in the GitHub repository.

---

**Delegation Pays, Supply Decays!** 🔥
# steem-burn-pool
