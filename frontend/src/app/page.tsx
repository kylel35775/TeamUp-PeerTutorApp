'use client';


import Link from 'next/link';

import { Box, Typography, Button, Divider, Stack, TextField, InputAdornment, Grid, Paper, Fab}
  from '@mui/material'
import { Login, Logout, HowToReg, Search, Chat}
  from '@mui/icons-material'

import ResponsiveAppBar from './(ui)/app-bar'
import React, { useEffect, useState } from 'react';
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from 'next/navigation';
import AIChatBox from './(ui)/aichat-box'

/**
 * @function React Component for Landing Page
 * @returns
 */
export default function LandingPage() {
    const { user } = useUser();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    // Links for buttons in app bar on the landing page
    const links : Link[] = [];
    if (!user) {
        links.push({name: 'Login', href: '/api/auth/login', icon: Login});
        links.push({name: 'Register', href: '/api/auth/signup', icon: HowToReg});
    }
    else {
        links.push({name: 'Logout', href: '/api/auth/logout', icon: Logout});
    }

    const handleCourseClick = (course) => {
        const next = `/dashboard/tutors?major=${encodeURIComponent(course)}`;
        if (!user) {
            router.push(`/api/auth/login?next=${encodeURIComponent(next)}`);
        } else {
            router.push(next);
        }
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (searchQuery.trim() !== '') {
            const next = `/dashboard/tutors?query=${encodeURIComponent(searchQuery)}`;
            if (!user) {
                router.push(`/api/auth/login?next=${encodeURIComponent(next)}`);
            } else {
                router.push(next);
            }
        }
    };

    const [isChatOpen, setIsChatOpen] = useState(false);
    const handleChatOpen = () => setIsChatOpen(true);
    const handleChatClose = () => setIsChatOpen(false);

    return (
        <>
            <header>
              <ResponsiveAppBar links={links} settings={[]} />
            </header>

<<<<<<< HEAD
            <AIChatBox isChatOpen={isChatOpen} handleChatClose={handleChatClose}/>
=======
            <AIChatBox
                open={chatOpen} handleClose={handleChatClose} conversation={conversation} message={message} setMessage={setMessage} sendMessage={sendMessage}
            />
>>>>>>> 9c89a5478300deb2ea19f807ccb11335caa74edf

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

                    <Divider variant="middle" orientation="horizontal" sx={{ width: '75%' }} />

                    <Box width="50%" mx="auto" textAlign="center">
                        <Typography variant="h5" align="center" mb={2} sx={{ fontWeight: 'bold', fontSize: '2rem' }}>
                            Find the perfect tutor right here!
                        </Typography>
                        <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="What do you want to learn?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 4 }}
                            />
                        </form>
                    </Box>

                    <Box width="75%" mx="auto" textAlign="center" pb={4}>
                        <Grid container spacing={4}>
                            {['CSCE', 'MATH', 'PHYS', 'ENGL', 'HIST', 'BIOL'].map((course, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    <div onClick={() => handleCourseClick(course)}>
                                        <Paper
                                            elevation={3}
                                            sx={{
                                                width: '100%',
                                                height: 200,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                backgroundImage: `url(/${course.toLowerCase()}.png)`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        >
                                        </Paper>
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Stack>
            </main>
            <Fab color="primary" aria-label="chat" onClick={handleChatOpen} sx={{ position: 'fixed', bottom: 16, right: 16,}}>
                <Chat />
            </Fab>
        </>
    );
}
