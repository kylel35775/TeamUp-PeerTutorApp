'use client';


import * as React from 'react';

import Link from 'next/link';
import { usePathname } 
  from 'next/navigation';

import { AppBar, Box, Toolbar, IconButton, Menu, Container, Button, MenuItem, Stack, Tabs, Tab } 
  from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import TheoLogo from '@/app/(ui)/theo-logo';
import UserMenu from '@/app/(ui)/user-menu';


/**
 * Component for displaying the website's top navigation app bar
 * @param links - List of Link variables containing the link's display label, href link, and icon to display on the app bar
 * @param settings - List of Link variables containing the link's display label, href link, and icon to display on the app bar's profile icon button
 * @returns 
 */  
export default function ResponsiveAppBar({ links, settings } : { links : Link[], settings : Link[] }) {
  // State variable for setting the MUI Menu anchor
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);

  const pathname = usePathname();
  const pathToTabIndex: { [key: string]: number } = {};
  links.forEach((link, index) => {pathToTabIndex[link.href] = index});

  // State variable for displaying the currently routed page on the navigation bar
  const [tab, setTab] = React.useState(pathToTabIndex[pathname]);
  
  // Handlers for opening and closing the collapsible menu visible in width-condensed mode (When the 'xs' breakpoint is triggered)
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };


  return (
    <AppBar position="static" color="tertiary">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <TheoLogo flexGrow="1"/>

          {/* Collapsible Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, }}>
            <IconButton size="large" aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleOpenNavMenu} color="primary">
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
              (links).map((link: Link) => (
              <MenuItem key={link.name} onClick={handleCloseNavMenu} sx={{ p: 0 }}>
                  <Button key={link.name} component={Link} href={link.href} fullWidth sx={{ p: 3 }}>
                    <link.icon />
                    { link.name }
                  </Button>
              </MenuItem>
              ))
            }
            </Menu>
          </Box>
          
          {/* Stack row displaying navigation links and profile setting links */}
          <Stack direction="row" my={0} spacing={2} alignItems="center" display={{ xs: "none", md: "flex" }}>
            <Tabs value={tab} onChange={(event, newValue) => setTab(newValue)} 
              aria-label="app-bar-navigation" role="navigation"
              sx={{ '& .MuiTab-root:not(.Mui-selected)': { color: 'background.default' } }}
            >
              {
                (links).map((link: Link, index) => {
                  let LinkIcon = link.icon;
                  return (
                    <Tab
                      key={index}
                      component={Link}
                      href={link.href} label={link.name} 
                      icon={ <LinkIcon /> } iconPosition="start"
                    />
                  );
                })
              }
            </Tabs>
            
            {/* User Profile Component */}
            { (usePathname().startsWith("/dashboard")) && <UserMenu /> }
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
