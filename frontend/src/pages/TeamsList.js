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
  IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    logo: '/default-team-logo.png'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/teams');
        setTeams(res.data.teams);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to load teams');
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTeam({
      name: '',
      logo: '/default-team-logo.png'
    });
  };

  const handleInputChange = (e) => {
    setNewTeam({
      ...newTeam,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateTeam = async () => {
    try {
      if (!newTeam.name) {
        setError('Team name is required');
        return;
      }

      const res = await axios.post('http://localhost:5000/api/teams', newTeam);
      setTeams([...teams, res.data.team]);
      handleCloseDialog();
      navigate(`/teams/${res.data.team._id}`);
    } catch (err) {
      console.error('Error creating team:', err);
      setError('Failed to create team');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Your Teams
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Create Team
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {teams.length === 0 ? (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              You don't have any teams yet
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Create your first team to start tracking performance and getting real-time insights
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              size="large"
            >
              Create Your First Team
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {teams.map(team => (
              <Grid item xs={12} sm={6} md={4} key={team._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {team.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {team.players.length} Players
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Default Formation: {team.settings?.defaultFormation || '4-4-2'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Subscription: {team.subscription?.plan.charAt(0).toUpperCase() + team.subscription?.plan.slice(1)}
                    </Typography>
                  </CardContent>
                  <Divider />
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
      </Box>

      {/* Create Team Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Create New Team</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Team Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newTeam.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="logo"
            label="Team Logo URL (optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={newTeam.logo}
            onChange={handleInputChange}
            helperText="Leave default for a placeholder logo"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreateTeam} color="primary" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamsList;
