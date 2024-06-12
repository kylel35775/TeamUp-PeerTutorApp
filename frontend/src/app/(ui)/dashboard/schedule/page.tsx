'use client';

import * as React from 'react';

import { useUser } from '@auth0/nextjs-auth0/client';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Box, Container, Paper, Stack, Tabs, Tab } 
  from '@mui/material';

import ListIcon from '@mui/icons-material/List';

import { DataGrid, GridColDef } 
  from '@mui/x-data-grid';

import { toPhoneNumber, toAppointmentTime } 
  from '@/app/_lib/utils';
import { TableFetch } 
  from '@/app/_lib/data';
import Schedule from './schedule';


// Column definitions for the MUI DataGrid component
const columns: GridColDef[] = [
  {
    field: 'fullName',
    headerName: 'Full name',
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  },
  {
    field: 'firstName',
    headerName: 'First name',
    width: 100,
    // editable: true,
  },
  {
    field: 'lastName',
    headerName: 'Last name',
    width: 100,
    // editable: true,
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 150,
  },
  {
    field: 'phone',
    headerName: 'Phone',
    width: 150,
  },
  {
    field: 'time',
    headerName: 'Time',
    width: 250,
  },
  
  {
    field: 'location',
    headerName: 'Location',
    width: 200,
  },
];


/**
 * @function React Component for the Schedule Page
 * @returns JSX Component for the Schedule Page
 */
export default function SchedulePage() {
  const { user } = useUser();


  // GET queries for the signed in user's tutor and tutee appointments
  const { data: tutorAppointments, refetch: tutorRefetch } = TableFetch<AppointmentQuery>("appointment", [user, "tutor"], `tutor_email_contains=${user?.email}`);
  const { data: tuteeAppointments, refetch: tuteeRefetch } = TableFetch<AppointmentQuery>("appointment", [user, "tutee"], `tutee_email_contains=${user?.email}`);


  // State variable and handler function for changing the current view from schedule to list
  const [tab, setTab] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent<Element, Event>, value: any) => {
    setTab(value);
  };


  // Row data for the MUI DataGrid List
  const rows = tutorAppointments?.data?.map((appointment: Appointment, index) => (
    {
      id: index,
      firstName: appointment.tuteeFirstName,
      lastName: appointment.tuteeLastName,
      email: appointment.tuteeEmail,
      phone: toPhoneNumber(appointment.tuteePhoneNumber.toString()),
      time: toAppointmentTime(new Date(appointment.startDateTimeString), new Date(appointment.endDateTimeString)),
      date: '',
      location: appointment.locationName,
    }
  ));
  

  return (
    <Box position="static" p={4}>
      <Container maxWidth="lg" sx={{ minWidth: 750 }}>
        <Paper variant="outlined" sx={{ px: 4, pb: 4 }}>
          <Stack direction="column" spacing={4}>
            <Tabs value={tab} onChange={handleTabChange} aria-label="tabs-my_schedule_view" sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab icon={<CalendarMonthIcon fontSize="medium" />} iconPosition="top" label="Calendar" sx={{ p: 0 }} />
              <Tab icon={<ListIcon />} iconPosition="top" label="List" sx={{ p: 0 }} />
            </Tabs>

            { (tab === 0) ?

            <Schedule 
              tutorEventData={tutorAppointments ? tutorAppointments.data : []} 
              tuteeEventData={tuteeAppointments ? tuteeAppointments.data : []} 
              refetch={[tutorRefetch, tuteeRefetch]}
            />
            :
            <DataGrid 
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                },
              }}
              pageSizeOptions={[5]}
              checkboxSelection disableRowSelectionOnClick
            />
            }
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
