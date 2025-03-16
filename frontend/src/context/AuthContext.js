import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on page load
    const loadUser = async () => {
      if (token) {
        try {
          // Set auth token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get user profile
          const res = await axios.get('http://localhost:5000/api/auth/profile');
          setUser(res.data.user);
        } catch (err) {
          console.error('Error loading user:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      
      // Save token to localStorage and state
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      
      // Set auth token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setError(null);
      const res = await axios.post('http://localhost:5000/api/auth/login', userData);
      
      // Save token to localStorage and state
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      
      // Set auth token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage and state
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    
    // Remove auth token from axios headers
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const res = await axios.put('http://localhost:5000/api/auth/profile', userData);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
