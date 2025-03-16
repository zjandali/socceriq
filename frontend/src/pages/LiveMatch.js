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
  Divider,
  Alert,
  Tabs,
  Tab,
  List,
  Avatar,
  Chip
} from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SpeedIcon from '@mui/icons-material/Speed';
import axios from 'axios';
import { io } from 'socket.io-client';
import LoadingSpinner from '../components/LoadingSpinner';

const LiveMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        
        // Fetch match details
        const matchRes = await axios.get(`http://localhost:5000/api/matches/${id}`);
        setMatch(matchRes.data.match);
        
        // Fetch team details
        const teamRes = await axios.get(`http://localhost:5000/api/teams/${matchRes.data.match.teamId}`);
        setTeam(teamRes.data.team);
        
        // Fetch players
        const playersRes = await axios.get(`http://localhost:5000/api/teams/${matchRes.data.match.teamId}/players`);
        setPlayers(playersRes.data.players);
        
        // Fetch performance data
        const performanceRes = await axios.get(`http://localhost:5000/api/matches/${id}/performance`);
        setPerformanceData(performanceRes.data.performanceData);
        
        // Fetch insights
        const insightsRes = await axios.get(`http://localhost:5000/api/matches/${id}/insights`);
        setInsights(insightsRes.data.insights);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching match data:', err);
        setError('Failed to load match data');
        setLoading(false);
      }
    };

    fetchMatchData();

    // Set up Socket.IO connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join match room
    newSocket.emit('join-match', id);

    // Listen for player updates
    newSocket.on('player-update', (data) => {
      setPerformanceData(prevData => {
        // Add new data point or update existing one
        const exists = prevData.some(item => 
          item.playerId === data.playerId && 
          item.timestamp === data.timestamp
        );
        
        if (exists) {
          return prevData.map(item => 
            (item.playerId === data.playerId && item.timestamp === data.timestamp) 
              ? data 
              : item
          );
        } else {
          return [...prevData, data];
        }
      });
    });

    // Listen for insights
    newSocket.on('insight', (data) => {
      setInsights(prevInsights => [data, ...prevInsights]);
    });

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEndMatch = async () => {
    if (window.confirm('Are you sure you want to end this match?')) {
      try {
        await axios.post(`http://localhost:5000/api/matches/${id}/end`);
        navigate(`/matches/${id}`);
      } catch (err) {
        console.error('Error ending match:', err);
        setError('Failed to end match');
      }
    }
  };

  // Simulate sending player data (for demo purposes)
  const simulatePlayerData = () => {
    if (!match || !players.length) return;
    
    // Get active players
    const activePlayers = [...match.lineups.starters];
    
    // Generate random data for each player
    activePlayers.forEach(playerId => {
      const player = players.find(p => p._id === playerId);
      if (!player) return;
      
      // Create random performance metrics
      const data = {
        matchId: match._id,
        playerId: player._id,
        timestamp: new Date().toISOString(),
        metrics: {
          position: {
            x: Math.random() * 100,
            y: Math.random() * 100
          },
          speed: Math.random() * 25,
          heartRate: 120 + Math.random() * 60,
          distance: Math.random() * 0.1, // km per update
          acceleration: Math.random() * 5 - 2.5,
          workRate: 60 + Math.random() * 40
        }
      };
      
      // Send to server
      socket.emit('player-data', data);
      
      // Generate insights occasionally
      if (Math.random() > 0.8) {
        const insightTypes = ['tactical', 'physical', 'substitution'];
        const insightType = insightTypes[Math.floor(Math.random() * insightTypes.length)];
        
        const insight = {
          matchId: match._id,
          timestamp: new Date().toISOString(),
          type: insightType,
          priority: Math.floor(Math.random() * 5) + 1,
          message: generateInsightMessage(player, insightType),
          relatedPlayers: [player._id],
          data: {}
        };
        
        socket.emit('tactical-insight', insight);
      }
    });
  };

  // Generate random insight messages for demo
  const generateInsightMessage = (player, type) => {
    const tacticalMessages = [
      `${player.name} is consistently finding space on the right wing`,
      `${player.name} is dropping too deep, creating a gap in midfield`,
      `${player.name} is making effective overlapping runs`,
      `Opposition is targeting ${player.name}'s side for attacks`,
      `${player.name} is winning most aerial duels in the center`
    ];
    
    const physicalMessages = [
      `${player.name} is showing signs of fatigue`,
      `${player.name}'s sprint speed has decreased by 15%`,
      `${player.name} has covered 8.2km so far`,
      `${player.name}'s work rate has dropped significantly`,
      `${player.name} is maintaining high intensity despite long playing time`
    ];
    
    const substitutionMessages = [
      `Consider replacing ${player.name} due to fatigue`,
      `${player.name} would benefit from a tactical substitution`,
      `${player.name} has been on yellow card for 30 minutes`,
      `${player.name}'s effectiveness has decreased, consider a substitution`,
      `Optimal time to substitute ${player.name} based on performance metrics`
    ];
    
    switch(type) {
      case 'tactical':
        return tacticalMessages[Math.floor(Math.random() * tacticalMessages.length)];
      case 'physical':
        return physicalMessages[Math.floor(Math.random() * physicalMessages.length)];
      case 'substitution':
        return substitutionMessages[Math.floor(Math.random() * substitutionMessages.length)];
      default:
        return `Insight about ${player.name}`;
    }
  };

  // Calculate player statistics from performance data
  const getPlayerStats = (playerId) => {
    const playerData = performanceData.filter(data => data.playerId === playerId);
    
    if (playerData.length === 0) {
      return {
        distance: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        avgHeartRate: 0,
        sprints: 0
      };
    }
    
    const totalDistance = playerData.reduce((sum, data) => sum + (data.metrics.distance || 0), 0);
    const avgSpeed = playerData.reduce((sum, data) => sum + (data.metrics.speed || 0), 0) / playerData.length;
    const maxSpeed = Math.max(...playerData.map(data => data.metrics.speed || 0));
    const avgHeartRate = playerData.reduce((sum, data) => sum + (data.metrics.heartRate || 0), 0) / playerData.length;
    
    // Count sprints (speed > 20 km/h)
    const sprints = playerData.filter(data => (data.metrics.speed || 0) > 20).length;
    
    return {
      distance: totalDistance.toFixed(2),
      avgSpeed: avgSpeed.toFixed(1),
      maxSpeed: maxSpeed.toFixed(1),
      avgHeartRate: avgHeartRate.toFixed(0),
      sprints
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!match || !team) {
    return (
      <Container maxWidth="md">
        <Box my={4} textAlign="center">
          <Alert severity="error">Match not found</Alert>
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
    <Container maxWidth="xl">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Live Match: {team.name} vs. {match.opponent}
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              component={Link} 
              to={`/teams/${team._id}/matches`}
              sx={{ mr: 2 }}
            >
              Back to Matches
            </Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleEndMatch}
            >
              End Match
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* For demo purposes - button to simulate data */}
        <Box mb={3} textAlign="center">
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={simulatePlayerData}
            size="large"
          >
            Simulate Player Data (Demo)
          </Button>
          <Typography variant="caption" display="block" mt={1}>
            Click this button to simulate real-time player data and insights for demonstration purposes
          </Typography>
        </Box>
        
        <Paper elevation={2} sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Live Insights" />
            <Tab label="Player Performance" />
            <Tab label="Field View" />
          </Tabs>
          
          <Box p={3}>
            {/* Live Insights Tab */}
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  Real-time Coaching Insights
                </Typography>
                
                {insights.length === 0 ? (
                  <Box textAlign="center" py={3}>
                    <Typography variant="body1" color="textSecondary">
                      No insights generated yet. Insights will appear here as the match progresses.
                    </Typography>
                    <Typography variant="body2" color="textSecondary" mt={1}>
                      Click the "Simulate Player Data" button above to generate sample insights.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {insights.map((insight, index) => {
                      const priorityColor = 
                        insight.priority >= 4 ? 'error' :
                        insight.priority === 3 ? 'warning' : 'success';
                      
                      const typeLabel = 
                        insight.type === 'tactical' ? 'Tactical' :
                        insight.type === 'physical' ? 'Physical' : 'Substitution';
                      
                      return (
                        <Paper 
                          key={index} 
                          elevation={1} 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            borderLeft: `4px solid ${
                              insight.priority >= 4 ? '#f44336' :
                              insight.priority === 3 ? '#ff9800' : '#4caf50'
                            }`
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Chip 
                              label={typeLabel} 
                              size="small" 
                              color={
                                insight.type === 'tactical' ? 'primary' :
                                insight.type === 'physical' ? 'secondary' : 'warning'
                              }
                            />
                            <Typography variant="caption" color="textSecondary">
                              {new Date(insight.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                          <Typography variant="body1">
                            {insight.message}
                          </Typography>
                        </Paper>
                      );
                    })}
                  </List>
                )}
              </Box>
            )}
            
            {/* Player Performance Tab */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  Player Performance Metrics
                </Typography>
                
                <Grid container spacing={3}>
                  {match.lineups.starters.map(playerId => {
                    const player = players.find(p => p._id === playerId);
                    if (!player) return null;
                    
                    const stats = getPlayerStats(playerId);
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={playerId}>
                        <Card>
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Avatar sx={{ mr: 2, bgcolor: 
                                player.position === 'Goalkeeper' ? 'orange' : 
                                player.position === 'Defender' ? 'blue' : 
                                player.position === 'Midfielder' ? 'green' : 'red' 
                              }}>
                                {player.jerseyNumber}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" component="h3">
                                  {player.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {player.position}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Divider sx={{ mb: 2 }} />
                            
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Box display="flex" alignItems="center">
                                  <DirectionsRunIcon color="primary" sx={{ mr: 1 }} />
                                  <Box>
                                    <Typography variant="body2" color="textSecondary">
                                      Distance
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {stats.distance} km
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box display="flex" alignItems="center">
                                  <SpeedIcon color="primary" sx={{ mr: 1 }} />
                                  <Box>
                                    <Typography variant="body2" color="textSecondary">
                                      Speed
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {stats.avgSpeed} km/h
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box display="flex" alignItems="center">
                                  <FavoriteIcon color="primary" sx={{ mr: 1 }} />
                                  <Box>
                                    <Typography variant="body2" color="textSecondary">
                                      Heart Rate
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {stats.avgHeartRate} bpm
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box display="flex" alignItems="center">
                                  <SpeedIcon color="primary" sx={{ mr: 1 }} />
                                  <Box>
                                    <Typography variant="body2" color="textSecondary">
                                      Max Speed
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {stats.maxSpeed} km/h
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box display="flex" alignItems="center">
                                  <DirectionsRunIcon color="primary" sx={{ mr: 1 }} />
                                  <Box>
                                    <Typography variant="body2" color="textSecondary">
                                      Sprints
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                      {stats.sprints}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
            
            {/* Field View Tab */}
            {tabValue === 2 && (
              <Box>
                {/* Field View content */}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LiveMatch;