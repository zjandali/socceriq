import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  CircularProgress,
  Divider
} from '@mui/material';
import axios from 'axios';

const PlayerDetail = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get(`/api/players/${id}`);
        setPlayer(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load player data');
        setLoading(false);
        console.error(err);
      }
    };

    fetchPlayerData();
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

  if (!player) {
    return (
      <Container>
        <Typography variant="h5" align="center" sx={{ mt: 4 }}>
          Player not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                {/* Player image placeholder */}
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    bgcolor: 'grey.300',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                  }}
                >
                  <Typography variant="h3">{player.name?.charAt(0) || 'P'}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {player.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Position: {player.position || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Team: {player.team?.name || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Jersey Number: {player.jerseyNumber || 'N/A'}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Player Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Goals
                  </Typography>
                  <Typography variant="h6">{player.stats?.goals || 0}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Assists
                  </Typography>
                  <Typography variant="h6">{player.stats?.assists || 0}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Matches
                  </Typography>
                  <Typography variant="h6">{player.stats?.matches || 0}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Rating
                  </Typography>
                  <Typography variant="h6">{player.stats?.rating || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PlayerDetail; 