import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress,
  Button,
  Divider,
  Chip
} from '@mui/material';
import axios from 'axios';

const MatchDetail = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get(`/api/matches/${id}`);
        setMatch(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load match data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchMatchData();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h5" color="error" align="center" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  if (!match) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Match not found
        </Typography>
      </Container>
    );
  }

  const getStatusChip = (status) => {
    let color = 'default';
    
    switch(status?.toLowerCase()) {
      case 'scheduled':
        color = 'info';
        break;
      case 'in progress':
        color = 'warning';
        break;
      case 'completed':
        color = 'success';
        break;
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return <Chip label={status || 'Unknown'} color={color} size="small" />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">Match Details</Typography>
            {getStatusChip(match.status)}
          </Box>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={5} sx={{ textAlign: 'center' }}>
              <Typography variant="h5">{match.homeTeam?.name || 'Home Team'}</Typography>
            </Grid>
            <Grid item xs={2} sx={{ textAlign: 'center' }}>
              <Typography variant="h5">vs</Typography>
              {match.status === 'completed' && (
                <Typography variant="h4">
                  {match.homeScore || 0} - {match.awayScore || 0}
                </Typography>
              )}
            </Grid>
            <Grid item xs={5} sx={{ textAlign: 'center' }}>
              <Typography variant="h5">{match.awayTeam?.name || 'Away Team'}</Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Date & Time
              </Typography>
              <Typography variant="body1">
                {new Date(match.dateTime).toLocaleString() || 'TBD'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" color="text.secondary">
                Venue
              </Typography>
              <Typography variant="body1">
                {match.venue || 'TBD'}
              </Typography>
            </Grid>
          </Grid>
          
          {match.status === 'scheduled' && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button 
                component={Link} 
                to={`/matches/${id}/live`} 
                variant="contained" 
                color="primary"
                size="large"
              >
                Start Live Match
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default MatchDetail; 