import ResponsiveAppBar from '../../app-bar';

import { Box, Container, Paper, Typography } from '@mui/material';
import { Dashboard, School, CalendarMonth } from '@mui/icons-material';

const links = [
  {name: '', href: '', icon: Box},
];

const settings = [
  { name: 'Profile', href: '/dashboard/profile', icon: Dashboard },
  { name: 'Log Out', href: '/', icon: Dashboard },
];

export default function DashboardPage() {
  return (
    <>
      <header>
        <ResponsiveAppBar position="static" display={{ xs: 'none', md: 'flex' }} links={links} settings={settings} />
      </header>
      <main>
        <Box position="relative" sx={{top: 50}}>
          <Container maxWidth="sm">
            <Paper elevation={4} sx={{mt:5}}>
              <Typography variant="h2" align="center">
                Profile
              </Typography>
            </Paper>
          </Container>
        </Box>
      </main>
    </>
  );
}
