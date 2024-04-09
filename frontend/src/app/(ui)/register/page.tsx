'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';

import ResponsiveAppBar from '../app-bar'
import { Login, HowToReg } from '@mui/icons-material'
import { TutorCard } from '../tutor-card';
const links = [
  {name: 'Login', href: '/login', icon: Login},
  {name: 'Register', href: '/register', icon: HowToReg},
];
const tabLabels = ["Register as Peer Tutor", "Register as Tutee"];

import { 
  Avatar, Button, CssBaseline, TextField, Link, Grid, Box, Typography, Container, Paper, InputLabel, MenuItem, Select, SelectChangeEvent,
  OutlinedInput, InputAdornment, Tabs, Tab, Step, Stepper, StepLabel, FormGroup, Checkbox, FormControlLabel, Alert, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, IconButton, Snackbar
} from '@mui/material';

import DeleteIcon 
  from '@mui/icons-material/Delete';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeField } from '@mui/x-date-pickers/TimeField';

import AccountBoxIcon from '@mui/icons-material/AccountBox';

import { useTuteeMutation, TableFetch, TablePush } from '@/app/_lib/data';
import { Dashboard, School, CalendarMonth } 
from '@mui/icons-material';

import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';

import { scheduleToTimes }
  from '@/app/_lib/utils';


const steps = ['General Info', 'Transcript', 'Submit Registration','Tutor Preferences'];

const settings: Link[] = [
  { name: 'Profile', href: '/dashboard/profile', icon: Dashboard },
  { name: 'Log Out', href: '/', icon: Dashboard },
];

function PeerTutorForm(props: any) {

  const { formData, setFormData } = props;  

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({ ...prevData, [name]: value }));
  };

  const seniorityOptions = [
    { value: 'Freshman', label: 'Freshman' },
    { value: 'Sophomore', label: 'Sophomore' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Graduate', label: 'Graduate Student' }
  ];
  
  const changeSeniority = (event: SelectChangeEvent) => {
    setFormData((prevData: any) => ({ ...prevData, ['seniority']: event.target.value as Seniority}));
  };


  return (
    <Box component="form" noValidate sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            autoComplete="given-name"
            name="firstName"
            required
            fullWidth
            id="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange}
            autoFocus
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="phoneNumber"
            label="Phone Number (No dashes or spaces)"
            name="phoneNumber"
            autoComplete="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="title"
            label="Title (Ex. Computer Science Tutor)"
            name="title"
            autoComplete="title"
            value={formData.title}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
        <InputLabel id="senioritySelect">Seniority</InputLabel>
        <Select
          labelId="seniorityLabel"
          id="seniority"
          value={formData.seniority}
          label="seniority"
          onChange={changeSeniority}
          defaultValue=''
        >
          {seniorityOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
        </Select>
        </Grid>

        <Grid item xs={12} sm={6}>
          <InputLabel htmlFor="payrate">Pay Rate/Hr</InputLabel>
          <OutlinedInput
            name="payRate"
            id="payrate"
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            label="payrate"
            value={formData.payRate}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="major"
            label="Undergraduate Department (4 letter abbreviation)"
            name="major"
            autoComplete="major"
            value={formData.major}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="bioText"
            label="Biography Text (This can be changed later)"
            name="bioText"
            autoComplete="bioText"
            multiline  // Add this prop for multiline textarea
            rows={4}   // Optionally set the number of rows
            value={formData.bioText}
            onChange={handleChange}
          />
        </Grid>

      </Grid>
    </Box>
  );
}

function TuteeForm(props: any) {

  const seniorityOptions = [
    { value: 'freshman', label: 'Freshman' },
    { value: 'sophomore', label: 'Sophomore' },
    { value: 'junior', label: 'Junior' },
    { value: 'senior', label: 'Senior' },
    { value: 'graduate', label: 'Graduate Student' }
  ];
  
  const [seniority, setSeniority] = React.useState('');

  const { setTuteeRegistered, setAlertOpen, setAlertMessage } = props;
  
  const changeSeniority = (event: SelectChangeEvent) => {
    setSeniority(event.target.value as string);
  };

  // Google Account Specific Info ----------------------------------------

  const { data: session, status } = useSession();

  // Form submission -----------------------------------------------------

  const tuteeMutationUpdate = TablePush("/tutee");

  const TuteeGeneralInfoErrorChecking = (formData: any) => {
      
    if (formData.first_name.length > 20) {
      return "First name must be 20 characters or less.";
    }

    // Check lastName length
    if (formData.last_name.length > 20) {
        return "Last name must be 20 characters or less.";
    }

    // Check phoneNumber
    if (!/^[1-9]\d{9}$/.test(formData.phone_number)) {
        return("Phone number must be 10 digits long and contain only numbers.");
    }

    return('');
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const registrationData = {
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      phone_number: formData.get('phoneNumber') as string,
      seniority_name: seniority,
      email: session?.user?.email as string,
      major_abbreviation: formData.get('major') as string,
      picture_url: session?.user?.image as string
    };

    const error = TuteeGeneralInfoErrorChecking(registrationData);
    if (error) {
      setAlertOpen(true);
      setAlertMessage(error);
      return;
    }
    
    tuteeMutationUpdate.mutate(registrationData, {
      onSuccess: () => {
        setTuteeRegistered(true);
      }
    });

  };

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            autoComplete="given-name"
            name="firstName"
            required
            fullWidth
            id="firstName"
            label="First Name"
            autoFocus
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="phoneNumber"
            label="Phone Number (No dashes or spaces)"
            name="phoneNumber"
            autoComplete="phoneNumber"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
        <InputLabel id="senioritySelect">Seniority</InputLabel>
        <Select
          labelId="seniorityLabel"
          id="seniority"
          value={seniority}
          label="seniority"
          onChange={changeSeniority}
        >
          {seniorityOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
        </Select>
        </Grid>

        <Grid item xs={12} sm={6}>
          <InputLabel htmlFor="major">Undergrad Major (4 letters)</InputLabel>
          <OutlinedInput
            name="major"
            id="major"
            label="Major"
          />
        </Grid>

      </Grid>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Register
      </Button>
    </Box>
  );
}

function TranscriptUpload(props: any) {
  const { setTranscript } = props;
  
  useEffect(() => {
    setTranscript(null);  
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Access the first file in the files array
      const file = files[0];
      setTranscript(file);
    } else {
      console.log("No file selected");
    }
  };

  return (
    <div>
    <Typography component="h2" variant="h5"> Please upload a pdf of your most current transcript </Typography>
    <form id="uploadForm">
      <div >
        <label>Select Transcript File: </label>
        <input type="file" accept=".pdf" onChange={handleFileChange} required/>
      </div>
    </form>
  </div>
  );
}

function TutorCardPage(props: any) {

  const { tutor } = props;

  return (
    <Grid container rowSpacing={3}>
    <Grid item xs={12}> <Typography align="center"> Here is your Tutor Card!! </Typography> </Grid>
    <Grid item xs={12}> <TutorCard tutor={tutor} /> </Grid>
    <Grid item xs={12}> 
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
      </Box>
    </Grid>
  </Grid>
  );


}

import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput }
  from '@fullcalendar/core/index.js';

import type { DateSelectArg, EventClickArg, EventDropArg, EventAddArg } 
  from '@fullcalendar/core/index.js';


function TimePreferences(props: any) {
  const { setTimePreferences } = props;

  const scheduleRef = React.useRef<FullCalendar | null>(null);
  var selectedEvent: EventClickArg;

  const Day: { [key: string]: number } = { 
    "sunday": 0, 
    "monday": 1, 
    "tuesday": 2, 
    "wednesday": 3, 
    "thursday": 4, 
    "friday": 5, 
    "saturday": 6 
  };

  const userEmail = useSession()?.data?.user?.email;
  const { data: tutor } = TableFetch<TutorQuery>("tutor", [userEmail], `email_contains=${userEmail}`);
  const [events, setEvents] = React.useState<EventInput[]>();

  React.useEffect(() => {
    setEvents(tutor?.data[0].timePreferences.map<EventInput>((time) => (
      {
        startTime: time.startTimeString,
        endTime: time.endTimeString,
        daysOfWeek: [ Day[time.weekdayName] ],
      }
    )));
  }, [tutor]);

  const handleEventRemove = () => {
    if (selectedEvent) selectedEvent.event.remove();
  };

  const handleEventSubmit = () => {
    const timeEvents = scheduleToTimes(scheduleRef);
    let times: TutorTimePreference[] = [];

    timeEvents?.map((timeSlot, index) => {
      times.push({tutorEmail: userEmail || '',
                  weekdayName: timeSlot.dow[0],
                  startTimeString: timeSlot.time[0],
                  endTimeString: timeSlot.time[1]})
    });

    setTimePreferences(times);

  };

  // Callback function after releasing click on date selection
  const handleDateSelect = (event: DateSelectArg) => {
    scheduleRef.current?.getApi().addEvent(event);
    scheduleRef.current?.getApi().unselect();
  };

  // Callback function after clicking event
  const handleEventClick = (info: EventClickArg) => {
    if (selectedEvent) selectedEvent.el.style.outline = "";
    info.el.style.outline = "2px solid black";
    selectedEvent = info;
  };

  return (
    <FullCalendar
      ref={scheduleRef}
      plugins={[ interactionPlugin, dayGridPlugin, timeGridPlugin ]}
      events={events}

      initialView="timeGridWeek"
      height="70vh"
      headerToolbar={{
        left: 'deleteTime',
        right: 'submitTimes',
      }}
      dayHeaderFormat={{ weekday: 'long' }}
      customButtons={{
        deleteTime: {
          text: 'Remove Selected Time',
          click: handleEventRemove,
        },
        submitTimes: {
          text: 'Submit Time Preferences',
          click: handleEventSubmit,
        }
      }}

      allDaySlot={false} slotDuration="00:15:00" slotLabelInterval="01:00"
      unselectAuto={false} editable selectable selectMirror selectOverlap={false} eventOverlap={false}
      eventClick={handleEventClick} select={handleDateSelect}
    />
  );
}

function CoursePreferences(props: any) {

  const { eligibleCourses } = props;
  const { checkedItems, setCheckedItems} = props;
  const { locationPreferences, setLocationPreferences } = props;
  const { setTimePreferences } = props;

  const { data: session, status } = useSession();

  const locationOptions: LocationType[] = [
    "in-person on-campus",
    "in-person off-campus",
    "online"
  ];

  const handleCheckboxChange = (index: number) => {
    setCheckedItems({
      ...checkedItems,
      [index]: !checkedItems[index]
    });
  };

  const locationChange = (location: LocationType) => {
    if (locationPreferences.includes(location)) {
      setLocationPreferences(locationPreferences.filter((l: LocationType) => l !== location));
    } else {
      setLocationPreferences([...locationPreferences, location]);
    }
  };

  return (
    <div style={{ width: '80%', margin: 'auto' }}>
      <div style={{ marginBottom: '15vh' }}>
        <Typography variant="h6">Select the courses you want to Peer Tutor For!</Typography>
        <Divider />
        <TableContainer sx={{ maxHeight: '75vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Preferred</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eligibleCourses.map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{`${item.majorAbbreviation} ${item.courseNumber}`}</TableCell>
                  <TableCell>{item.courseGrade}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={checkedItems[index] || false}
                      onChange={() => handleCheckboxChange(index)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
  
      <div style={{ marginBottom: '15vh' }}>
        <Typography variant="h6">Select your location preferences</Typography>
        <Divider />
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Location</TableCell>
                <TableCell>Preferred</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locationOptions.map((location, index) => (
                <TableRow key={index}>
                  <TableCell>{location}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={locationPreferences.includes(location)}
                      onChange={() => locationChange(location)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
  
      <div style={{ marginBottom: '16px' }}>
        <Typography variant="h6">Select your time preferences</Typography>
        <Divider />
        <TimePreferences setTimePreferences={setTimePreferences}/>
      </div>
    </div>
  );
  

}

export default function Registration() {

  // Variable Initializing ------------------------------------------------------------------------

  const [tutorRegistered, setTutorRegistered] = useState(false);   // This will be set to true when registration is submitted
  const [tuteeRegistered, setTuteeRegistered] = useState(false);   // This will be set to true when registration is submitted
  const [preferencesSet, setPreferencesSet] = useState(false);
  const [tutorRefetched, setTutorRefetched] = useState(false);
  const [tutorTimesSet, setTutorTimesSet] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [transcript, setTranscript] = useState(null);
  const [coursePreferences, setCoursePreferences] = useState<Course[]>();
  const [eligibleCourses, setEligibleCourses] = useState<Course[]  | undefined>(undefined);
  const [checkedItems, setCheckedItems] = useState<{ [index: number]: boolean }>({});
  const [locationPreferences, setLocationPreferences] = useState<LocationType[]>([]);
  const [timePreferences, setTimePreferences] = useState<TutorTimePreference[]>([]);

  const { data: session, status } = useSession();
  const email = session?.user?.email;

  const [activeStep, setActiveStep] = React.useState(0);
  
  const [tab, setTab] = React.useState(0);
  
  const [peerTutorFormData, setPeerTutorFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    title: '',
    payRate: '',
    major: '',
    bioText: '',
    seniority: '' as Seniority
  });

  const [tutor, setTutor] = useState<Tutor>({
    firstName: '',
    lastName: '',
    pictureUrl: '',
    payRate: 0,
    averageRating: 5,
    listingTitle: '',
    bioText: '',
    phoneNumber: -1,
    email: '',
    majorAbbreviation: '',
    seniorityName: 'Senior',
    coursePreferences: [],
    eligibleCourses: [],
    locationPreferences: [],
    timePreferences: [],
    activeStatusName: "active",
    numberOfRatings: 0,
    numberOneStarRatings: 0,
    numberTwoStarRatings: 0,
    numberThreeStarRatings: 0,
    numberFourStarRatings: 0,
    numberFiveStarRatings: 0,
  });

  // Button and Update Functions -------------------------------------------------------------

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const convertTimeToString = (time: dayjs.Dayjs) => {
    const hour = time.hour().toString().padStart(2, '0');
    const minute = time.minute().toString().padStart(2, '0');
    
    // Always set seconds to '00'
    const second = '00';
    
    // Return the formatted time string
    return `${hour}:${minute}:${second}`;
  };

  const convertPreferenceToString = (time: TimePreference) => {
    const start = time['startTime'];
    const end = time['endTime'];

    return `${convertTimeToString(start)} ${convertTimeToString(end)}`
  };

  const TutorGeneralInfoErrorChecking = (formData: any) => {
    
    if (formData.firstName.length > 20) {
      return "First name must be 20 characters or less.";
    }
  
    // Check lastName length
    if (formData.lastName.length > 20) {
        return "Last name must be 20 characters or less.";
    }

    // Check phoneNumber
    if (!/^[1-9]\d{9}$/.test(formData.phoneNumber)) {
        return("Phone number must be 10 digits long and contain only numbers.");
    }

    // Check payRate
    const payRateNum = parseFloat(formData.payRate);
    if (isNaN(payRateNum) || payRateNum < 0 || payRateNum > 1000) {
        return("Pay rate must be a non-negative number less than $1,000.");
    }

    // Check title length
    if (formData.title.length > 100) {
      return "Title must be 100 characters or less.";
    }

    // Check bioText length
    if (formData.bioText.length > 1000) {
        return "Bio text must be 1000 characters or less.";
    }

    return('');
  }

  const handleNext = () => {
  
    if (tab == 0) {
  
      if (activeStep === 0) {
  
        for (const key in peerTutorFormData) {
          if (!(peerTutorFormData as any)[key] || (peerTutorFormData['seniority'] === "All")) {
            setAlertOpen(true);
            setAlertMessage("Fill out all fields first before continuing");
            return;
          }

          const errors = TutorGeneralInfoErrorChecking(peerTutorFormData);
          if (errors) {
            setAlertOpen(true);
            setAlertMessage(errors);
            return;
          }
        }
      }
      else if (activeStep === 1) {

        if (!transcript) {
          setAlertOpen(true);
          setAlertMessage("Please upload a transcript before proceeding");
          return;
        }
  
        const newTutor: Tutor = {
          activeStatusName: 'active',
          firstName: peerTutorFormData.firstName,
          lastName: peerTutorFormData.lastName,
          bioText: peerTutorFormData.bioText,
          listingTitle: peerTutorFormData.title,
          payRate: Number(peerTutorFormData.payRate),
          pictureUrl: session?.user?.image || '',
          phoneNumber: Number(peerTutorFormData.phoneNumber),
          email: session?.user?.email || '',
          majorAbbreviation: peerTutorFormData.major,
          seniorityName: peerTutorFormData.seniority,
          coursePreferences: [],
          eligibleCourses: [],
          locationPreferences: [],
          timePreferences: [],
          averageRating: 5,
          numberOfRatings: 0,
          numberOneStarRatings: 0,
          numberTwoStarRatings: 0,
          numberThreeStarRatings: 0,
          numberFourStarRatings: 0,
          numberFiveStarRatings: 0,
        };
  
        setTutor(newTutor);
  
      }
      else if (activeStep === 2) {

        TutorCreation();

      }
      else if (activeStep === 3) {

        const newVariables = eligibleCourses?.filter((_: any, index: any) => checkedItems[index]);
        setCoursePreferences(newVariables);

      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Checks to see if account is already registered --------------------------------------------------------------

  const {data: tutorResult, isSuccess: tutorFinished, refetch: tutorRefetch } = TableFetch<TutorQuery>("tutor", [], `email_contains=${session?.user?.email}`);
  const {data: tuteeResult, isSuccess: tuteeFinished, refetch: tuteeRefetch } = TableFetch<TuteeQuery>("tutee", [], `email_contains=${session?.user?.email}`);

  // Operations for database insertions ---------------------------------------------------------------------------

  const tutorMutation = TablePush("/tutor");
  const tutorMutationUpdate = TablePush("/tutor/update");
  const tutorTimeMutationUpdate = TablePush("/tutor_time_preference/update");

  useEffect(() => {

    if (!tutorRegistered) {
      tutorRefetch();
    }

    if (!tuteeRegistered) {
      tuteeRefetch();
    }

  }, [session?.user?.email]);

  useEffect(() => {

    if (tutorMutation.isSuccess) {
      setTutorRegistered(true);
      tutorRefetch();
    }

  }, [tutorMutation.isSuccess]);

  useEffect(() => {

    if (tutorRegistered && tutorResult) {

      const courses = tutorResult['data'][0]['eligibleCourses'];
      setEligibleCourses(courses);
    }

  }, [tutorResult]);

  useEffect(() => {
    if (tutorRegistered) {
      setPreferencesSet(true);
      UpdateTutorPreferences();
    }
  }, [coursePreferences])

  useEffect(() => {
    if (eligibleCourses) {
      setTutorRefetched(true);
    }
  }, [eligibleCourses])

  async function TutorCreation() {

    const tutorCreateData = {
      active_status_name: 'active',
      bio_text: tutor.bioText,
      email: tutor.email,
      first_name: tutor.firstName,
      last_name: tutor.lastName,
      listing_title: tutor.listingTitle,
      major_abbreviation: tutor.majorAbbreviation,
      pay_rate: tutor.payRate,
      phone_number: tutor.phoneNumber,
      picture_url: tutor.pictureUrl,
      seniority_name: tutor.seniorityName,
      transcript: transcript,

    }

    tutorMutation.mutate(tutorCreateData);

  }

  function formatTimePreferences(timePreferences: any[]): any {
    const formattedData: any = {};
  
    // Iterate through timePreferences array
    timePreferences.forEach((timePreference) => {
      const { tutorEmail, weekdayName, startTimeString, endTimeString } = timePreference;
  
      // Check if there's already an entry for the current day
      if (!formattedData[weekdayName]) {
        // If not, create an entry for the current day
        formattedData[weekdayName] = [];
      }
  
      // Add the time interval to the corresponding day
      formattedData[weekdayName].push(`${startTimeString} ${endTimeString}`);
    });
  
    // Create the final object with email and time intervals for each day
    const result: any = {};
    timePreferences.forEach((timePreference) => {
      const { tutorEmail, weekdayName } = timePreference;
  
      if (!result.tutor_email) {
        result.tutor_email = tutorEmail;
      }
  
      if (formattedData[weekdayName]) {
        if (!result[`${weekdayName}_time_intervals`]) {
          result[`${weekdayName}_time_intervals`] = formattedData[weekdayName].join(', ');
        }
      }
    });
  
    return result;
  }

  function UpdateTutorPreferences() {

    const generateCourseString = (courses: Course[]): string => courses.map(course => `${course.majorAbbreviation} ${course.courseNumber} ${course.courseGrade}`).join(", ");
    const generateLocationString = (locations: LocationType[]): string => locations.join(", ");

    if (coursePreferences && locationPreferences && timePreferences) {
      const tutorPreferences = { 
        email_old: session?.user?.email,
        course_preferences_new: generateCourseString(coursePreferences),
        location_preferences_new: generateLocationString(locationPreferences)
      }

      tutorMutationUpdate.mutate(tutorPreferences);
      tutorTimeMutationUpdate.mutate(formatTimePreferences(timePreferences));
    }


  }

  const handleAlertClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;

    setAlertOpen(false);
  };

  return (
    <>
    <header>
      <ResponsiveAppBar settings={settings} links={links} />
    </header>
    <Container component="main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '5vh'}}>
      <CssBaseline />
      <Paper elevation={4} style={{ width: '80%' }}>
        <Box
          sx={{
            padding: 4,
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            '& > *': {
              marginBottom: 4,
            },
          }}
        >

          <Tabs value={tab} onChange={handleChangeTab} centered>
            <Tab label={tabLabels[0]} />
            <Tab label={tabLabels[1]} />
          </Tabs>

          <Box sx={{ marginBottom: 4, display: 'flex', alignItems: 'center', flexDirection: 'column'  }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <AccountBoxIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              {tabLabels[tab]}
            </Typography>
          </Box>

          {(() => {

            // Tutor Registration Form
            if (tab === 0) {

              if (tutorFinished) {

                // Already registered as Peer Tutor
                if (tutorResult?.data && tutorResult?.data.length !== 0 && !tutorRegistered) {
                  return (
                    <>
                      <Typography align="center"> You have already registered as a Peer Tutor! </Typography>
                      <Button key={'hello'} component={Link} href={'/dashboard/profile'} fullWidth sx={{ p: 3 }}> 
                        <Typography align="center"> Click Here to Update Profile </Typography>
                      </Button>
                    </>
                  );

                }
                // Not registered as Peer Tutor Yet
                else {

                  // General Info Tab
                  if (activeStep === 0) {
                    return (
                      <>
                      <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                          <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                      <PeerTutorForm formData={peerTutorFormData} setFormData={setPeerTutorFormData} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '16px' }}>
                        <Button disabled={true} onClick={handleBack}>
                          Back
                        </Button>
                        <Button onClick={handleNext}>Next</Button>
                      </Box>
                      </>
                    );
                  }

                  // Transcript Page
                  else if (activeStep === 1) {
                    return (
                      <>
                      <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                          <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                      <TranscriptUpload setTranscript={setTranscript} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '16px' }}>
                        <Button onClick={handleBack}>
                          Back
                        </Button>
                        <Button onClick={handleNext}>Next</Button>
                      </Box>
                      </>
                    );
                  }

                  // Tutor Card Page
                  else if (activeStep === 2) {
                    return (
                      <>
                      <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((label) => (
                          <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                      <TutorCardPage tutor={tutor} />
                      <Button color="secondary" onClick={handleNext}>Register as Peer Tutor!</Button> 
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '16px' }}>
                        <Button onClick={handleBack}>
                          Back
                        </Button>
                        <Button disabled={true} onClick={handleNext}>Next</Button>
                      </Box>
                      </>
                    );
                  }

                  // Course Preferences Page
                  else if (activeStep === 3) {
                    if (tutorRegistered && tutorRefetched) {
                      if (!preferencesSet) {
                        return (
                          <>
                          <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label) => (
                              <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                          <CoursePreferences setTimePreferences={setTimePreferences} locationPreferences={locationPreferences} setLocationPreferences={setLocationPreferences} eligibleCourses={eligibleCourses} checkedItems={checkedItems} setCheckedItems={setCheckedItems}/>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '16px' }}>
                            <Button disabled={true} onClick={handleBack}>
                              Back
                            </Button>
                            <Button onClick={handleNext}>Next</Button>
                          </Box>
                          </>
                        );
                      }
                    }
                    else {
                      return (
                        <>
                        <Skeleton animation="wave" variant="rounded" width="100%" height={120}></Skeleton>
                        </>
                      )
                    }
                  }

                  else if (activeStep === 4) {
                    if (preferencesSet) {
                      return (
                      <>
                      <Typography align="center"> Thank you for Registering as a Peer Tutor! </Typography>
                      <Button key={'hello'} component={Link} href={'/dashboard/profile'} fullWidth sx={{ p: 3 }}> 
                        <Typography align="center"> Click Here to See Your Profile! </Typography>
                      </Button>
                      </>
                      );
                    }
                  }
                }
              }
            }
            // Tutee Registtration Form
            else if (tab === 1) {

              if (tuteeFinished) {
                if (tuteeResult && tuteeResult?.length !== 0 && !tuteeRegistered) {
                  return (
                    <>
                      <Typography align="center"> You have already registered as a Tutee! </Typography>
                      <Button key={'hello'} component={Link} href={'/dashboard/profile'} fullWidth sx={{ p: 3 }}> 
                        <Typography align="center"> Click Here to Update Profile </Typography>
                      </Button>
                    </>
                  );
                }
                else if (tuteeResult && tuteeResult?.length === 0 && !tuteeRegistered) {
                  return (
                    <>
                      <TuteeForm setAlertOpen={setAlertOpen} setAlertMessage={setAlertMessage} setTuteeRegistered={setTuteeRegistered}/>
                    </>
                  )
                }

                else if (tuteeResult && tuteeResult?.length === 0 && tuteeRegistered) {
                  return (
                    <>
                    <Typography align="center"> Thank you for Registering as a Tutee! </Typography>
                    <Button key={'hello'} component={Link} href={'/dashboard/profile'} fullWidth sx={{ p: 3 }}> 
                      <Typography align="center"> Click Here to See Your Profile! </Typography>
                    </Button>
                    </>
                  )
                }
              }
            }


          })()}

        </Box>
      </Paper>
    </Container>

    <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={alertOpen} autoHideDuration={5000} onClose={handleAlertClose}>
        <Alert
          onClose={handleAlertClose}
          severity="error"
          sx={{ width: '100%' }}
        >
          {`${alertMessage}`}
        </Alert>
      </Snackbar>

    </>
  );
}