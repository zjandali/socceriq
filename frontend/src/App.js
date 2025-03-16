import React, { useState, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthContext } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TeamsList from './pages/TeamsList';
import TeamDetail from './pages/TeamDetail';
import PlayersList from './pages/PlayersList';
import PlayerDetail from './pages/PlayerDetail';
import MatchesList from './pages/MatchesList';
import MatchDetail from './pages/MatchDetail';
import LiveMatch from './pages/LiveMatch';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import LoadingSpinner from './components/LoadingSpinner';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/teams" element={
            <PrivateRoute>
              <TeamsList />
            </PrivateRoute>
          } />
          <Route path="/teams/:id" element={
            <PrivateRoute>
              <TeamDetail />
            </PrivateRoute>
          } />
          <Route path="/teams/:teamId/players" element={
            <PrivateRoute>
              <PlayersList />
            </PrivateRoute>
          } />
          <Route path="/players/:id" element={
            <PrivateRoute>
              <PlayerDetail />
            </PrivateRoute>
          } />
          <Route path="/teams/:teamId/matches" element={
            <PrivateRoute>
              <MatchesList />
            </PrivateRoute>
          } />
          <Route path="/matches/:id" element={
            <PrivateRoute>
              <MatchDetail />
            </PrivateRoute>
          } />
          <Route path="/matches/:id/live" element={
            <PrivateRoute>
              <LiveMatch />
            </PrivateRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
