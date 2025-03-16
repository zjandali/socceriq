import React, { useState, useContext } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  Link as MuiLink,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'coach'
  });
  const [formError, setFormError] = useState('');
  const { register, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword, role } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      await register({ name, email, password, role });
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      // Error is handled by AuthContext
    }
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Register for SoccerIQ
          </Typography>
          
          {(error || formError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError || error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            
            <TextField
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            
            <TextField
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              helperText="Password must be at least 6 characters"
            />
            
            <TextField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={role}
                label="Role"
                onChange={handleChange}
              >
                <MenuItem value="coach">Coach</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
            
            <Box textAlign="center">
              <Typography variant="body2">
                Already have an account?{' '}
                <MuiLink component={Link} to="/login">
                  Login here
                </MuiLink>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
