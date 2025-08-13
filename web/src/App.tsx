import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme, CircularProgress } from '@mui/material';
import { AppProvider } from './contexts/AppProvider';
import Login from './components/common/Login';
import Dashboard from './components/views/Dashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/common/Layout';
import './App.css';
import {sdk} from '@embrace-io/web-sdk';

// Initialize Embrace SDK
sdk.initSDK({
  appID: 'ftudh',
});

// const App = () => {
//   // rest of App...
// };

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3', // Blue
    },
    secondary: {
      main: '#ff9800', // Orange
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <ErrorBoundary>
          <Login>
            <Router>
              <Layout>
                <Suspense fallback={<CircularProgress />}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {/* Add more routes as needed */}
                  </Routes>
                </Suspense>
              </Layout>
            </Router>
          </Login>
        </ErrorBoundary>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;