'use client';


import Link from 'next/link';

import { Box, Typography, Button, Divider, Stack }
  from '@mui/material'
import { Login, Logout, HowToReg }
  from '@mui/icons-material'

import ResponsiveAppBar from './(ui)/app-bar'
import { useUser } from "@auth0/nextjs-auth0/client";

// Links for buttons in app bar on the landing page
const links = [
  {name: 'Login', href: '/api/auth/login', icon: Login},
  // {name: 'Logout', href: '/api/auth/logout', icon: Logout},
  {name: 'Register', href: '/api/auth/signup', icon: HowToReg},
];


/**
 * @function React Component for Landing Page
 * @returns 
 */
export default function LandingPage() {
  const { user } = useUser();

  if(user) {
    links.pop();
    links.pop();
    links.push({name: 'Logout', href: '/api/auth/logout', icon: Logout});
  }

  return (
    <>
      <header>
        <ResponsiveAppBar links={links} settings={[]} />
      </header>
      <main>
        <Stack direction="column" width="100%" height="100%" spacing={8} alignItems="center">
          <Stack bgcolor="#e0e0e0" width="100%" sx={{ flexDirection: {xs: "column", md: "row"} }} justifyContent="center" alignItems="center" p={4} spacing={4}>
            <Stack direction="column" textAlign="left" pr={4} spacing={4}>
              <Stack direction="column" display="inline">
                <Typography color='secondary' variant="h3" fontWeight="bold" display="inline">
                  Find Peer Tutors With Experience In 
                </Typography>
                <Typography color='primary' variant="h3" fontWeight="bold" display="inline">
                  &nbsp;Your Course
                </Typography>
                <Typography  color='secondary' variant="h3" fontWeight="bold" display="inline">
                  .
                </Typography>
              </Stack>

              <Button variant="contained" color="tertiary" LinkComponent={Link} href="/register" sx={{ width: 150 }}>
                <Typography color='primary' variant="h6">
                  Sign Up
                </Typography>
              </Button>
            </Stack>
            
            <img src="/landingpage.png" alt="Your Image" width={600} height={400} />
          </Stack>

          <Divider variant="middle" orientation="horizontal" sx={{ width: '75%' }} /> 

          <Box width="50%" mx="auto" textAlign="center" pb={4}> 
            <Typography align="center" mt={2} sx={{ fontSize: '40px', fontWeight: 'bold'}}> 
              Our Mission
            </Typography>

            <Typography variant="h5" align="center" mt={2} sx={{ fontWeight: 'bold'}}> 
              Theo is an online tutoring marketplace within university domains where students can turn subject matter expertise into a side hustle. 
            </Typography>

            <Typography variant="h5" align="center" mt={2} sx={{ fontWeight: 'bold'}}> 
              By handling bookings and scheduling on their behalf, the tool allows enrolled tutors to focus on teaching while getting discovered by relevant tutees seeking specific course guidance. 
            </Typography>
          </Box>
        </Stack>
      </main>
    </>
  );
}
