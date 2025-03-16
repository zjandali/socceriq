import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenu = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
    handleMobileClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
          SoccerIQ
        </Typography>

        {/* Mobile menu */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ display: { sm: 'none' } }}
          onClick={handleMobileMenu}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={mobileMenuAnchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(mobileMenuAnchorEl)}
          onClose={handleMobileClose}
        >
          {user ? (
            [
              <MenuItem key="dashboard" component={Link} to="/" onClick={handleMobileClose}>Dashboard</MenuItem>,
              <MenuItem key="teams" component={Link} to="/teams" onClick={handleMobileClose}>Teams</MenuItem>,
              <MenuItem key="logout" onClick={handleLogout}>Logout</MenuItem>
            ]
          ) : (
            [
              <MenuItem key="login" component={Link} to="/login" onClick={handleMobileClose}>Login</MenuItem>,
              <MenuItem key="register" component={Link} to="/register" onClick={handleMobileClose}>Register</MenuItem>
            ]
          )}
        </Menu>

        {/* Desktop menu */}
        <div style={{ display: { xs: 'none', sm: 'block' } }}>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/teams">
                Teams
              </Button>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircleIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  {user.name}
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
