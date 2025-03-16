import React, { useState, useEffect, useContext } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch teams
        const teamsRes = await axios.get('http://localhost:5000/api/teams');
        setTeams(teamsRes.data.teams);
        
        // If there are teams, fetch upcoming matches for the first team
        if (teamsRes.data.teams.length > 0) {
          const matchesRes = await axios.get(`http://localhost:5000/api/matches/team/${teamsRes.data.teams[0]._id}`);
          // Filter for upcoming matches only
          const upcoming = matchesRes.data.matches.filter(match => match.status === 'upcoming');
          setUpcomingMatches(upcoming);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user.name}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          {/* Teams Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" component="h2">
                  Your Teams
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link} 
                  to="/teams"
                >
                  View All
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {teams.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <Typography variant="body1" color="textSecondary">
                    You don't have any teams yet.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    component={Link} 
                    to="/teams" 
                    sx={{ mt: 2 }}
                  >
                    Create Team
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {teams.slice(0, 3).map(team => (
                    <Grid item xs={12} key={team._id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" component="h3">
                            {team.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {team.players.length} Players
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            component={Link} 
                            to={`/teams/${team._id}`}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="small" 
                            component={Link} 
                            to={`/teams/${team._id}/players`}
                          >
                            Players
                          </Button>
                          <Button 
                            size="small" 
                            component={Link} 
                            to={`/teams/${team._id}/matches`}
                          >
                            Matches
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
          
          {/* Upcoming Matches Section */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h2" mb={2}>
                Upcoming Matches
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              {upcomingMatches.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <Typography variant="body1" color="textSecondary">
                    No upcoming matches scheduled.
                  </Typography>
                  {teams.length > 0 && (
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      component={Link} 
                      to={`/teams/${teams[0]._id}/matches`} 
                      sx={{ mt: 2 }}
                    >
                      Schedule Match
                    </Button>
                  )}
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {upcomingMatches.map(match => (
                    <Grid item xs={12} key={match._id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" component="h3">
                            vs. {match.opponent}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(match.date).toLocaleDateString()} at {match.location}
                          </Typography>
                          <Typography variant="body2">
                            Formation: {match.formation}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            component={Link} 
                            to={`/matches/${match._id}`}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="small" 
                            color="primary" 
                            variant="contained" 
                            component={Link} 
                            to={`/matches/${match._id}/live`}
                          >
                            Start Match
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
          
          {/* Quick Stats Section */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" component="h2" mb={2}>
                Platform Overview
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box className="stat-box">
                    <Typography variant="h6" className="stat-label">
                      Teams
                    </Typography>
                    <Typography variant="h3" className="stat-value">
                      {teams.length}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box className="stat-box">
                    <Typography variant="h6" className="stat-label">
                      Players
                    </Typography>
                    <Typography variant="h3" className="stat-value">
                      {teams.reduce((total, team) => total + team.players.length, 0)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Box className="stat-box">
                    <Typography variant="h6" className="stat-label">
                      Upcoming Matches
                    </Typography>
                    <Typography variant="h3" className="stat-value">
                      {upcomingMatches.length}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
