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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton
} from '@mui/material';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const PlayersList = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: 'Midfielder',
    jerseyNumber: '',
    physicalProfile: {
      height: '',
      weight: '',
      maxHeartRate: '200',
      maxSpeed: ''
    },
    deviceId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch team details
        const teamRes = await axios.get(`http://localhost:5000/api/teams/${teamId}`);
        setTeam(teamRes.data.team);
        
        // Fetch team players
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

  const handleOpenDialog = (player = null) => {
    if (player) {
      // Edit existing player
      setEditingPlayer(player);
      setNewPlayer({
        name: player.name,
        position: player.position,
        jerseyNumber: player.jerseyNumber,
        physicalProfile: {
          height: player.physicalProfile.height || '',
          weight: player.physicalProfile.weight || '',
          maxHeartRate: player.physicalProfile.maxHeartRate || '200',
          maxSpeed: player.physicalProfile.maxSpeed || ''
        },
        deviceId: player.deviceId || ''
      });
    } else {
      // Create new player
      setEditingPlayer(null);
      setNewPlayer({
        name: '',
        position: 'Midfielder',
        jerseyNumber: '',
        physicalProfile: {
          height: '',
          weight: '',
          maxHeartRate: '200',
          maxSpeed: ''
        },
        deviceId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlayer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewPlayer({
        ...newPlayer,
        [parent]: {
          ...newPlayer[parent],
          [child]: value
        }
      });
    } else {
      setNewPlayer({
        ...newPlayer,
        [name]: value
      });
    }
  };

  const handleCreatePlayer = async () => {
    try {
      if (!newPlayer.name || !newPlayer.position || !newPlayer.jerseyNumber) {
        setError('Name, position, and jersey number are required');
        return;
      }

      if (editingPlayer) {
        // Update existing player
        const res = await axios.put(`http://localhost:5000/api/players/${editingPlayer._id}`, newPlayer);
        setPlayers(players.map(p => p._id === editingPlayer._id ? res.data.player : p));
      } else {
        // Create new player
        const res = await axios.post('http://localhost:5000/api/players', {
          ...newPlayer,
          teamId
        });
        setPlayers([...players, res.data.player]);
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving player:', err);
      setError('Failed to save player');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (window.confirm('Are you sure you want to delete this player?')) {
      try {
        await axios.delete(`http://localhost:5000/api/players/${playerId}`);
        setPlayers(players.filter(p => p._id !== playerId));
      } catch (err) {
        console.error('Error deleting player:', err);
        setError('Failed to delete player');
      }
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
            {team.name} - Players
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
              Add Player
            </Button>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={2} sx={{ p: 3 }}>
          {players.length === 0 ? (
            <Box textAlign="center" py={3}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No players added to this team yet
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Add players to start tracking their performance and getting real-time insights
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                size="large"
              >
                Add Your First Player
              </Button>
            </Box>
          ) : (
            <List>
              {players.map(player => (
                <ListItem 
                  key={player._id}
                  button
                  component={Link}
                  to={`/players/${player._id}`}
                  divider
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: player.position === 'Goalkeeper' ? 'orange' : 
                                          player.position === 'Defender' ? 'blue' : 
                                          player.position === 'Midfielder' ? 'green' : 'red' }}>
                      {player.jerseyNumber}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={player.name} 
                    secondary={`Position: ${player.position} | Device ID: ${player.deviceId || 'Not assigned'}`} 
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="edit"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenDialog(player);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeletePlayer(player._id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      {/* Add/Edit Player Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPlayer ? 'Edit Player' : 'Add New Player'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Player Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newPlayer.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="position-label">Position</InputLabel>
                <Select
                  labelId="position-label"
                  name="position"
                  value={newPlayer.position}
                  label="Position"
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="Goalkeeper">Goalkeeper</MenuItem>
                  <MenuItem value="Defender">Defender</MenuItem>
                  <MenuItem value="Midfielder">Midfielder</MenuItem>
                  <MenuItem value="Forward">Forward</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="jerseyNumber"
                label="Jersey Number"
                type="number"
                fullWidth
                variant="outlined"
                value={newPlayer.jerseyNumber}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Physical Profile
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="physicalProfile.height"
                label="Height (cm)"
                type="number"
                fullWidth
                variant="outlined"
                value={newPlayer.physicalProfile.height}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="physicalProfile.weight"
                label="Weight (kg)"
                type="number"
                fullWidth
                variant="outlined"
                value={newPlayer.physicalProfile.weight}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="physicalProfile.maxHeartRate"
                label="Max Heart Rate (bpm)"
                type="number"
                fullWidth
                variant="outlined"
                value={newPlayer.physicalProfile.maxHeartRate}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="physicalProfile.maxSpeed"
                label="Max Speed (km/h)"
                type="number"
                fullWidth
                variant="outlined"
                value={newPlayer.physicalProfile.maxSpeed}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="deviceId"
                label="Device ID"
                type="text"
                fullWidth
                variant="outlined"
                value={newPlayer.deviceId}
                onChange={handleInputChange}
                helperText="Unique identifier for player's GPS tracking device"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreatePlayer} color="primary" variant="contained">
            {editingPlayer ? 'Save Changes' : 'Add Player'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlayersList;
