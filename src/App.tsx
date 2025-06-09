import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

import Login from './components/Login';
import Register from './components/Register';
import Verify from './components/Verify';
import TestConnection from './components/TestConnection';
import HomePage from './components/HomePage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import authService from './services/api';

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = authService.isLoggedIn();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const App: React.FC = () => {
  // Check authentication status when the app loads to ensure token validity
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isLoggedIn()) {
          // Verify token by fetching user data
          const response = await authService.getCurrentUser();
          if (!response.success) {
            // If token is invalid, logout
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // If there's an error, logout
        authService.logout();
      }
    };
    
    checkAuth();
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <Container component="main" maxWidth="xs">
              <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Login />
              </Box>
            </Container>
          } 
        />
        <Route 
          path="/register" 
          element={
            <Container component="main" maxWidth="xs">
              <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Register />
              </Box>
            </Container>
          } 
        />
        <Route 
          path="/verify" 
          element={
            <Container component="main" maxWidth="xs">
              <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Verify />
              </Box>
            </Container>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <Container component="main" maxWidth="xs">
              <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ForgotPassword />
              </Box>
            </Container>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <Container component="main" maxWidth="xs">
              <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ResetPassword />
              </Box>
            </Container>
          } 
        />
        <Route 
          path="/test-connection" 
          element={
            <Container component="main" maxWidth="xs">
              <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TestConnection />
              </Box>
            </Container>
          } 
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App; 