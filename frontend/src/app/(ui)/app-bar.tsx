'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

import TheoLogo from './theo-logo';

export default function ResponsiveAppBar(props: any) {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="sticky" color="tertiary" >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <TheoLogo flexGrow="1"/>

          <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' }, }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="primary"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
            { 
              (props.links).map((link: any) => (
              <MenuItem key={link.name} onClick={handleCloseNavMenu} sx={{ p: 0 }}>
                  <Button key={link.name} component={Link} href={link.href} fullWidth sx={{ p: 3 }}>
                      <link.icon />
                      {link.name}
                  </Button>
              </MenuItem>
              ))
            }
            </Menu>
          </Box>
          
          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
            {
              (props.links).map((link: any) => {
                let LinkIcon = link.icon;
                return (
                  <Button
                    key={link.name}
                    onClick={handleCloseNavMenu}
                    component={Link}
                    href={link.href}
                    sx={{ my: 2, display: 'block' }}
                  >
                    <LinkIcon />
                    {link.name}
                  </Button>
                );
              })
            }
          </Box>
          
          { (usePathname().startsWith("/dashboard")) && (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Log In" />
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
                {props.settings.map((setting: any) => (
                  <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                    <Button component={Link} href={setting.href}>{setting.name}</Button>
                  </MenuItem>
                ))}
              </Menu>
            </Box> )
          }
        </Toolbar>
      </Container>
    </AppBar>
  );
}
