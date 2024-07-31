

import type { Metadata } 
  from 'next';

import { ThemeProvider } 
  from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from '@/app/(ui)/theme';
import QueryProvider from "@/app/QueryProvider";
import { UserProvider } from "@auth0/nextjs-auth0/client";

import './(ui)/global.css';


export const metadata: Metadata = {
  title: "Theo Peer Tutoring",
  description: "A peer tutoring service for matching tutors with tutees",
};


/**
 * Layout component for all children under /dashboard/*. Initializes the top App Bar with links and profile settings
 * @param children - Child components passed from React
 * @returns 
 */  
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Material UI - Proper rendering and touch zooming for all devices */}
      <head> <meta name="viewport" content="initial-scale=1, width=device-width" /> </head>
      
      <body>
        <QueryProvider>
          <UserProvider>
            <ThemeProvider theme={ theme }>
              <CssBaseline /> {children}
            </ThemeProvider>
          </UserProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
