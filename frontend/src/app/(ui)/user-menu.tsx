'use client';


import * as React from 'react';

import { Box, Menu, MenuItem, Typography, Tooltip, IconButton, Avatar, Link }
  from '@mui/material';

import { useUser } from "@auth0/nextjs-auth0/client";

// Settings for the Profile menu
const settings = [ 'Profile', 'Log Out' ];

/**
 * @function React Component for user's Profile
 * @returns JSX Component for user's Profile
 */
export default function UserMenu() {
  // State variable for controlling the Menu's anchor
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);


  // Handler functions for opening and closing the Menu, and signing out
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const { user } = useUser();

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title="Open settings">
        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
          { user && 
            <Avatar src={user?.image?.toString()} alt="" />
          }
        </IconButton>
      </Tooltip>

      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem key={settings[0]} component={Link} href={'/dashboard/profile'}>
          <Typography variant="inherit" textAlign="center">
            {settings[0]}
          </Typography>
        </MenuItem>
        
        <MenuItem key={settings[1]} component={Link} href={'/api/auth/logout'} >
          <Typography variant="inherit" textAlign="center">
            {settings[1]}
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}
