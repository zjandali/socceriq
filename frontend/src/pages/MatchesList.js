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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const MatchesList = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [newMatch, setNewMatch] = useState({
    opponent: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    formation: '4-4-2',
    lineups: {
      starters: [],
      substitutes: []
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch team details
        const teamRes = await axios.get(`http://localhost:5000/api/teams/${teamId}`);
        setTeam(teamRes.data.team);
        
        // Fetch team matches
        const matchesRes = await axios.get(`http://localhost:5000/api/matches/team/${teamId}`);
        setMatches(matchesRes.data.matches);
        
        // Fetch team players for lineup selection
        const playersRes = await axios.get(`http://localhost:5000/api/teams/${teamId}/players`);
        setPlayers(playersRes.data.players);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  const handleOpenDialog = (match = null) => {
    if (match) {
      // Edit existing match
      setEditingMatch(match);
      setNewMatch({
        opponent: match.opponent,
        date: new Date(match.date).toISOString().split('T')[0],
        location: match.location,
        formation: match.formation,
        lineups: {
          starters: match.lineups.starters.map(player => typeof player === 'object' ? player._id : player),
          substitutes: match.lineups.substitutes.map(player => typeof player === 'object' ? player._id : player)
        }
      });
    } else {
      // Create new match
      setEditingMatch(null);
      setNewMatch({
        opponent: '',
        date: new Date().toISOString().split('T')[0],
        location: '',
        formation: team.settings?.defaultFormation || '4-4-2',
        lineups: {
          starters: [],
          substitutes: []
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMatch(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMatch({
      ...newMatch,
      [name]: value
    });
  };

  const handleLineupChange = (e, type) => {
    const selectedPlayers = Array.from(e.target.selectedOptions, option => option.value);
    setNewMatch({
      ...newMatch,
      lineups: {
        ...newMatch.lineups,
        [type]: selectedPlayers
      }
    });
  };

  const handleCreateMatch = async () => {
    try {
      if (!newMatch.opponent || !newMatch.date || !newMatch.location) {
        setError('Opponent, date, and location are required');
        return;
      }

      if (editingMatch) {
        // Update existing match
        const res = await axios.put(`http://localhost:5000/api/matches/${editingMatch._id}`, newMatch);
        setMatches(matches.map(m => m._id === editingMatch._id ? res.data.match : m));
      } else {
        // Create new match
        const res = await axios.post('http://localhost:5000/api/matches', {
          ...newMatch,
          teamId
        });
        setMatches([...matches, res.data.match]);
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving match:', err);
      setError('Failed to save match');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      try {
        await axios.delete(`http://localhost:5000/api/matches/${matchId}`);
        setMatches(matches.filter(m => m._id !== matchId));
      } catch (err) {
        console.error('Error deleting match:', err);
        setError('Failed to delete match');
      }
    }
  };

  const handleStartMatch = async (matchId) => {
    try {
      await axios.post(`http://localhost:5000/api/matches/${matchId}/start`);
      navigate(`/matches/${matchId}/live`);
    } catch (err) {
      console.error('Error starting match:', err);
      setError('Failed to start match');
    }
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
            {team.name} - Matches
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              component={Link} 
              to={`/teams/${teamId}`}
              sx={{ mr: 2 }}
            >
              Back to Team
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Schedule Match
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {matches.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No matches scheduled for this team yet
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Schedule your first match to start getting real-time coaching insights
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              size="large"
            >
              Schedule Your First Match
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {/* Upcoming Matches */}
            <Grid item xs={12}>
              <Typography variant="h5" component="h2" gutterBottom>
                Upcoming Matches
              </Typography>
              <Grid container spacing={2}>
                {matches.filter(match => match.status === 'upcoming').length === 0 ? (
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body1" color="textSecondary">
                        No upcoming matches scheduled
                      </Typography>
                    </Paper>
                  </Grid>
                ) : (
                  matches
                    .filter(match => match.status === 'upcoming')
                    .map(match => (
                      <Grid item xs={12} sm={6} md={4} key={match._id}>
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
                            <Typography variant="body2">
                              Status: Upcoming
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button 
                              size="small" 
                              component={Link} 
                              to={`/matches/${match._id}`}
                            >
                              Details
                            </Button>
                            <Button 
                              size="small" 
                              color="primary" 
                              variant="contained" 
                              onClick={() => handleStartMatch(match._id)}
                            >
                              Start Match
                            </Button>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDialog(match)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteMatch(match._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))
                )}
              </Grid>
            </Grid>
            
            {/* Live Matches */}
            <Grid item xs={12}>
              <Typography variant="h5" component="h2" gutterBottom>
                Live Matches
              </Typography>
              <Grid container spacing={2}>
                {matches.filter(match => match.status === 'live').length === 0 ? (
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body1" color="textSecondary">
                        No matches currently in progress
                      </Typography>
                    </Paper>
                  </Grid>
                ) : (
                  matches
                    .filter(match => match.status === 'live')
                    .map(match => (
                      <Grid item xs={12} sm={6} md={4} key={match._id}>
                        <Card sx={{ border: '2px solid #f44336' }}>
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
                            <Typography variant="body2" color="error" fontWeight="bold">
                              Status: LIVE
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button 
                              size="small" 
                              color="error" 
                              variant="contained" 
                              component={Link} 
                              to={`/matches/${match._id}/live`}
                              fullWidth
                            >
                              Continue Match
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))
                )}
              </Grid>
            </Grid>
            
            {/* Completed Matches */}
            <Grid item xs={12}>
              <Typography variant="h5" component="h2" gutterBottom>
                Completed Matches
              </Typography>
              <Grid container spacing={2}>
                {matches.filter(match => match.status === 'completed').length === 0 ? (
                  <Grid item xs={12}>
                    <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body1" color="textSecondary">
                        No completed matches yet
                      </Typography>
                    </Paper>
                  </Grid>
                ) : (
                  matches
                    .filter(match => match.status === 'completed')
                    .map(match => (
                      <Grid item xs={12} sm={6} md={4} key={match._id}>
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
                            <Typography variant="body2">
                              Status: Completed
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button 
                              size="small" 
                              component={Link} 
                              to={`/matches/${match._id}`}
                            >
                              View Analysis
                            </Button>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteMatch(match._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))
                )}
              </Grid>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Add/Edit Match Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingMatch ? 'Edit Match' : 'Schedule New Match'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                name="opponent"
                label="Opponent Team"
                type="text"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="date"
                label="Date"
                type="date"
                fullWidth
                value={newMatch.date}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="location"
                label="Location"
                type="text"
                fullWidth
                value={newMatch.location}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="formation"
                label="Formation"
                type="text"
                fullWidth
                value={newMatch.formation}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Starters</InputLabel>
                <Select
                  multiple
                  value={newMatch.lineups.starters}
                  onChange={(e) => handleLineupChange(e, 'starters')}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {players.map((player) => (
                    <MenuItem key={player._id} value={player._id}>
                      {player.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Substitutes</InputLabel>
                <Select
                  multiple
                  value={newMatch.lineups.substitutes}
                  onChange={(e) => handleLineupChange(e, 'substitutes')}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {players.map((player) => (
                    <MenuItem key={player._id} value={player._id}>
                      {player.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateMatch}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MatchesList;