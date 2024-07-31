"use client";

import * as React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import { Phone, Email } from "@mui/icons-material";

export default function HelpPage() {
  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        textAlign="center"
      >
        <div>
          <Typography variant="h2" component="h1" gutterBottom>
            Help/Contact Us
          </Typography>
          <Typography variant="h5" component="p" gutterBottom>
            How can we assist you?
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            mt={4}
          >
            <Phone fontSize="large" />
            <Typography variant="h6">Phone: 000-000-0000</Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            <Email fontSize="large" />
            <Typography variant="h6">Email: example@peertutor.com</Typography>
          </Stack>
        </div>
      </Box>
    </Container>
  );
}
