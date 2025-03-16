import React, { useState, useEffect } from 'react';
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
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        
        // Fetch team details
        const teamRes = await axios.get(`http://localhost:5000/api/teams/${id}`);
        setTeam(teamRes.data.team);
        
        // Fetch team players
        const playersRes = await axios.get(`http://localhost:5000/api/teams/${id}/players`);
        setPlayers(playersRes.data.players);
        
        // Fetch team matches
        const matchesRes = await axios.get(`http://localhost:5000/api/matches/team/${id}`);
        setMatches(matchesRes.data.matches);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('Failed to load team data');
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!team) {
    return (
      <Container maxWidth="md">
        <Box my={4} textAlign="center">
          <Alert severity="error">Team not found</Alert>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/teams" 
            sx={{ mt: 3 }}
          >
            Back to Teams
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            {team.name}
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            component={Link} 
            to="/teams"
          >
            Back to Teams
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={2} sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab icon={<PersonIcon />} label="Players" />
            <Tab icon={<SportsSoccerIcon />} label="Matches" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
          
          <Box p={3}>
            {/* Players Tab */}
            {tabValue === 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="h2">
                    Team Players
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link} 
                    to={`/teams/${id}/players`}
                  >
                    Manage Players
                  </Button>
                </Box>
                
                {players.length === 0 ? (
                  <Box textAlign="center" py={3}>
                    <Typography variant="body1" color="textSecondary">
                      No players added to this team yet.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      component={Link} 
                      to={`/teams/${id}/players`} 
                      sx={{ mt: 2 }}
                    >
                      Add Players
                    </Button>
                  </Box>
                ) : (
                  <List>
                    {players.slice(0, 5).map(player => (
                      <ListItem 
                        key={player._id}
                        button
                        component={Link}
                        to={`/players/${player._id}`}
                        divider
                      >
                        <ListItemAvatar>
                          <Avatar>
                            {player.jerseyNumber}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={player.name} 
                          secondary={`Position: ${player.position}`} 
                        />
                      </ListItem>
                    ))}
                    {players.length > 5 && (
                      <Box textAlign="center" mt={2}>
                        <Button 
                          component={Link} 
                          to={`/teams/${id}/players`}
                        >
                          View All {players.length} Players
                        </Button>
                      </Box>
                    )}
                  </List>
                )}
              </Box>
            )}
            
            {/* Matches Tab */}
            {tabValue === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" component="h2">
                    Team Matches
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    component={Link} 
                    to={`/teams/${id}/matches`}
                  >
                    Manage Matches
                  </Button>
                </Box>
                
                {matches.length === 0 ? (
                  <Box textAlign="center" py={3}>
                    <Typography variant="body1" color="textSecondary">
                      No matches scheduled for this team yet.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      component={Link} 
                      to={`/teams/${id}/matches`} 
                      sx={{ mt: 2 }}
                    >
                      Schedule Match
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {matches.slice(0, 3).map(match => (
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
                              Status: {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
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
                            {match.status === 'upcoming' && (
                              <Button 
                                size="small" 
                                color="primary" 
                                variant="contained" 
                                component={Link} 
                                to={`/matches/${match._id}/live`}
                              >
                                Start Match
                              </Button>
                            )}
                            {match.status === 'live' && (
                              <Button 
                                size="small" 
                                color="secondary" 
                                variant="contained" 
                                component={Link} 
                                to={`/matches/${match._id}/live`}
                              >
                                Continue Match
                              </Button>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                    {matches.length > 3 && (
                      <Grid item xs={12} textAlign="center">
                        <Button 
                          component={Link} 
                          to={`/teams/${id}/matches`}
                        >
                          View All {matches.length} Matches
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Box>
            )}
            
            {/* Settings Tab */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  Team Settings
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Team Information
                        </Typography>
                        <Typography variant="body2">
                          <strong>Name:</strong> {team.name}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Default Formation:</strong> {team.settings?.defaultFormation || '4-4-2'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Subscription Plan:</strong> {team.subscription?.plan.charAt(0).toUpperCase() + team.subscription?.plan.slice(1)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Subscription Status:</strong> {team.subscription?.status.charAt(0).toUpperCase() + team.subscription?.status.slice(1)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Expires:</strong> {new Date(team.subscription?.expiresAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary">
                          Edit Team
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Alert Thresholds
                        </Typography>
                        <Typography variant="body2">
                          <strong>Fatigue Alert:</strong> {team.settings?.alertThresholds?.get('fatigue') || 80}%
                        </Typography>
                        <Typography variant="body2">
                          <strong>Sprint Decline Alert:</strong> {team.settings?.alertThresholds?.get('sprintDecline') || 20}%
                        </Typography>
                        <Typography variant="body2">
                          <strong>Heart Rate Max Alert:</strong> {team.settings?.alertThresholds?.get('heartRateMax') || 90}%
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary">
                          Edit Thresholds
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TeamDetail;
