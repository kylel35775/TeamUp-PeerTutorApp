import React from "react";

import {
  Dashboard,
  School,
  CalendarMonth,
  ContactMail,
} from "@mui/icons-material";

import ResponsiveAppBar from "@/app/(ui)/app-bar";

// Links to appear in the App Bar with associated href routes and route icons
const links: Link[] = [
  { name: "Dashboard", href: "/dashboard", icon: Dashboard },
  { name: "Peer Tutors", href: "/dashboard/tutors", icon: School },
  { name: "My Schedule", href: "/dashboard/schedule", icon: CalendarMonth },
  { name: "Help/Contact us", href: "/dashboard/help", icon: ContactMail },
];

// Settings to appear in the App Bar's profile icon menu
const settings: Link[] = [
  { name: "Profile", href: "/dashboard/profile", icon: Dashboard },
  { name: "Log Out", href: "/", icon: Dashboard },
];

/**
 * Layout component for all children under /dashboard/*. Initializes the top App Bar with links and profile settings
 * @param children - Child components passed from React
 * @returns
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <ResponsiveAppBar links={links} settings={settings} />
      </header>
      <main>{children}</main>
    </>
  );
}
