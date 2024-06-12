'use client';

import * as React from 'react';

import { useState, useEffect } 
from 'react';

import { useUser } from '@auth0/nextjs-auth0/client';

import { CssBaseline, Paper, Box, Tab, Tabs, Avatar, Typography, Button, Stepper, Step, StepLabel, Skeleton, Snackbar, Alert, CircularProgress,
         Container }    
  from '@mui/material';

import AccountBoxIcon
 from '@mui/icons-material/AccountBox';

import { Dashboard, Login, HowToReg, Link }
  from '@mui/icons-material'

import ResponsiveAppBar 
  from '../app-bar'

import { TutorInformation }
  from './tutorInfo';

import { TuteeInformation }
  from './tuteeInfo';

import { TranscriptUpload }
  from './tutorTranscriptUpload';

import { TutorCardPage }
  from './tutorCardPage';

import { CoursePreferences, LocationPreferences, TimePreferences } 
  from './preferences';

import { TableFetch, TablePush } 
  from '@/app/_lib/data';

import { TutorInfoChecking, TuteeInfoChecking } 
  from '@/app/_lib/utils';

/**
 * Links for app bar
 */
const links = [
  {name: 'Login', href: '/login', icon: Login},
  {name: 'Register', href: '/register', icon: HowToReg},
];

/**
 * Labels for different tabs on Registration Page
 */
const tabLabels = ["Register as Peer Tutor", "Register as Tutee"];

/**
 * Labels for steps in tutor registration
 */  
const steps = ['General Info', 'Transcript', 'Submit Registration','Tutor Preferences'];

/**
 * Hyperlinks for avatar icon
 */
const settings: Link[] = [
  { name: 'Profile', href: '/dashboard/profile', icon: Dashboard },
  { name: 'Log Out', href: '/', icon: Dashboard },
];

/**
 * Sets default values for Tutor variable (used for initializations)
 */
const initialTutorData: Tutor = {
  activeStatusName: "active",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: 0,
  pictureUrl: "",
  listingTitle: "",
  bioText: "",
  averageRating: 0,
  numberOfRatings: 0,
  coursePreferences: [],
  eligibleCourses: [],
  locationPreferences: [],
  timePreferences: [],
  majorAbbreviation: "",
  payRate: 0,
  seniorityName: "All",
  numberOneStarRatings: 0,
  numberTwoStarRatings: 0,
  numberThreeStarRatings: 0,
  numberFourStarRatings: 0,
  numberFiveStarRatings: 0,
};

/**
 * Sets default values for Tutee variable (used for initializations)
 */
const initialTuteeData: Tutee = {
  activeStatusName: "active",
  email: "",
  firstName: "",
  lastName: "",
  majorAbbreviation: "",
  phoneNumber: 0,
  seniorityName: "Senior",
  pictureUrl: ""
};

export default function Registration() {
  const { user } = useUser();

  // State variables for tutor and tutee data
  const [tutor, setTutor] = useState<Tutor>(initialTutorData);
  const [tutee, setTutee] = useState<Tutee>(initialTuteeData);
  const [transcript, setTranscript] = useState(null);

  // State variables for controlling what data is being shown on page
  const [tuteeConfirmation, setTuteeConfirmation] = useState(false);
  const [registrationProcess, setRegistrationProcess] = useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [tab, setTab] = React.useState(0);

  // State variables for alert messages
  const [alertOpen, setAlertOpen] = useState(false);
  const [loadingWheelOpen, setLoadingWheelOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  ////////////////////////////////////////////////////////////
  //                   Database Functions                   //                                      
  ////////////////////////////////////////////////////////////

  const {data: tutorResult, isSuccess: tutorFinished, refetch: tutorRefetch } = TableFetch<TutorQuery>("tutor", [user], `email_contains=${user?.email}`);
  const {data: tuteeResult, isSuccess: tuteeFinished, refetch: tuteeRefetch } = TableFetch<TuteeQuery>("tutee", [user], `email_contains=${user?.email}`);

  const tutorMutation = TablePush("/tutor");
  const tuteeMutation = TablePush("/tutee");
  const tutorMutationUpdate = TablePush("/tutor/update");
  const tutorTimeMutationUpdate = TablePush("/tutor_time_preference/update");

  ////////////////////////////////////////////////////////////
  //                    Alert Functions                     //                                      
  ////////////////////////////////////////////////////////////

  /**
   * Sets successful alert message
   */
  const successAlert = () => {
    setAlertOpen(true);
    setAlertMessage("");
  };

  /**
   * Sets error alert message
   * @param message - Alert message to be displayed
   */
  const errorAlert = (message: string) => {
    setAlertOpen(true);
    setAlertMessage(message);
  };

  ////////////////////////////////////////////////////////////
  //                     Button Functions                   //                                      
  ////////////////////////////////////////////////////////////

  /**
   * Handling change between tutor and tutee registration
   */
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  /**
   * Handles back button on tutor registration
   */
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  /**
   * Handles next button on tutor registration, only applicable on tutor registration page
   */
  const handleNext = () => {
  
    // Progress from general information step
    if (activeStep === 0) {

      const requiredFields: TutorKey[] = ['firstName', 'lastName', 'phoneNumber', 'listingTitle', 'payRate', 'majorAbbreviation', 'bioText'];

      requiredFields.forEach((item: TutorKey) => {
        if (!tutor[item] || (tutor['seniorityName'] === "All")) {
          alert(item);
          errorAlert("Fill out all fields first before continuing")
          return;
        }
      })

      const errors = TutorInfoChecking(tutor);
      if (errors) {
        errorAlert(errors)
        return;
      }

      setRegistrationProcess(true);
      
    }
    // Progress from transcript step
    else if (activeStep === 1) {

      if (!transcript) {
        errorAlert("Please upload a transcript before proceeding")
        return;
      }

    }
    // Progress from tutor card step
    else if (activeStep === 2) {

      // Creates the tutor in the database, only progress to next step after tutor is created
      TutorCreation();
      return;

    }
    // Progress from preferences step
    else if (activeStep === 3) {

      const errors = PreferencesCheck(tutor);

      if (errors) {
        errorAlert(errors)
        return;
      }

      UpdatePreferences();

    }
    
    // Advance registration step
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  /**
   * Alert Message Closing Action
   */
  const handleAlertClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;

    setAlertOpen(false);
  };

  ////////////////////////////////////////////////////////////
  //                 Tutor Updating Functions               //                                      
  ////////////////////////////////////////////////////////////

  /**
   *  Updates the tutor variable with the eligible courses
   */
  React.useEffect(() => {

    if (tutorResult) {
      if (tutorResult.data?.length > 0) {
        setTutor(tutorResult?.data[0]);
      }
    }

  }, [tutorResult]);

  /**
   *  Updates the tutor variable with email and picture
   */
  React.useEffect(() => {
      if (user) {
        setTutor({...tutor, email: user?.email || '', pictureUrl: user?.picture || ''});
      }
  },[user]);

  /**
   *  Creates the tutor in the database
   */
  const TutorCreation = () => {

    const tutorCreateData = {
      active_status_name: 'active',
      bio_text: tutor.bioText,
      email: user?.email,
      first_name: tutor.firstName,
      last_name: tutor.lastName,
      listing_title: tutor.listingTitle,
      major_abbreviation: tutor.majorAbbreviation,
      pay_rate: tutor.payRate,
      phone_number: tutor.phoneNumber,
        picture_url: user?.picture,
      seniority_name: tutor.seniorityName,
      transcript: transcript,

    }

    setLoadingWheelOpen(true);

    tutorMutation.mutate(tutorCreateData, {
      onSuccess: () => {
        successAlert();
        setLoadingWheelOpen(false);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        tutorRefetch();
      },
      onError: (error: any) => {
        if (error.response.data.message === 'Invalid transcript.') {
          errorAlert("Transcript Upload Failed, please re-upload transcript on Profile Page");
          setLoadingWheelOpen(false);
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          tutorRefetch();
          return;
        }
        errorAlert("Tutor Creation Failed, please review your info and try again");
      }
    });

  };

  /**
   *  Makes sure tutor has selected course, location, and time preferences
   */
  const PreferencesCheck = (tutor: Tutor) => {

    if (tutor.coursePreferences.length === 0 && tutor.eligibleCourses.length > 0) {
      return("Please select at least one course preference before advancing");
    }

    if (tutor.locationPreferences.length === 0) {
      return("Please select at least one location preference before advancing");
    }

    if (tutor.timePreferences.length === 0) {
      return("Please select at least one time preference before advancing");
    }

    return "";

  };

  /**
   *  Updates the tutor course, location, and time preferences
   */
  const UpdatePreferences = () => {
    UpdateTutorCoursePreferences();
    UpdateTutorLocationPreferences();
    UpdateTutorTimePreferences();
  };

  /**
   * Updates Tutor course preferences with data in tutorProfileData variable
   */
  const UpdateTutorCoursePreferences = () => {

  const generateCourseString = (courses: Course[]): string => courses.map(course => `${course.majorAbbreviation} ${course.courseNumber} ${course.courseGrade}`).join(", ");

  const newPreferences = {
    email_old: tutor.email,
    course_preferences_new: generateCourseString(tutor?.coursePreferences)
  }

  tutorMutationUpdate.mutate(newPreferences);
  };

  /**
   * Updates Tutor location preferences with data in tutorProfileData variable
   */
  const UpdateTutorLocationPreferences = () => {

  const generateLocationString = (locations: { locationName: LocationType; tutorEmail: string; }[]): string => {
    const locationNames = locations.map(location => location.locationName);
    return locationNames.join(", ");
  };

  const newLocation = {
    email_old: tutor.email,
    location_preferences_new: generateLocationString(tutor.locationPreferences)
  }

  tutorMutationUpdate.mutate(newLocation);
  };

  /**
   * Updates Tutor time preferences with data in tutorProfileData variable
   */
  const UpdateTutorTimePreferences = () => {

    const formatTimePreferences = (timePreferences: any[]): any => {
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
    
      result.tutor_email = user?.email;
    
      timePreferences.forEach((timePreference) => {
      const { tutorEmail, weekdayName } = timePreference;
    
      if (formattedData[weekdayName]) {
        if (!result[`${weekdayName}_time_intervals`]) {
        result[`${weekdayName}_time_intervals`] = formattedData[weekdayName].join(', ');
        }
      }
      });
    
      return result;
    };

  tutorTimeMutationUpdate.mutate(formatTimePreferences(tutor.timePreferences));
  };

  /**
   *  Creates tutee in database
   */
  const TuteeRegister = () => {

    const errors = TuteeInfoChecking(tutee);
    if (errors) {
      errorAlert(errors)
      return;
    }

    const tuteeCreateData = {
      active_status_name: tutee.activeStatusName,
      email: user?.email,
      first_name: tutee.firstName,
      last_name: tutee.lastName,
      major_abbreviation: tutee.majorAbbreviation,
      picture_url: user?.picture,
      phone_number: tutee.phoneNumber,
      seniority_name: tutee.seniorityName
    }

    tuteeMutation.mutate(tuteeCreateData, {
      onSuccess: () => {
        setLoadingWheelOpen(false);
        setTuteeConfirmation(true);
      },
      onError: (error: any) => {
        errorAlert("Tutee Creation Failed, please review your info and try again");
      }
    });

  }

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

              // Wait for tutor fetching from database to complete
              if (tutorFinished) {

                // Already registered as Peer Tutor
                if (tutorResult?.data && tutorResult?.data.length !== 0 && !registrationProcess) {
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

                      <TutorInformation 
                        data={[tutor, setTutor]} 
                      />

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

                      <TranscriptUpload 
                        transcript={[transcript, setTranscript]} 
                      />

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
                      <TutorCardPage data={tutor} />
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

                  // Preferences Page
                  else if (activeStep === 3) {

                    // Waiting for refetch to complete
                    if (tutorResult?.data?.length > 0) {
                      return (
                        <>
                        <Stepper activeStep={activeStep} alternativeLabel>
                          {steps.map((label) => (
                            <Step key={label}>
                              <StepLabel>{label}</StepLabel>
                            </Step>
                          ))}
                        </Stepper>

                        <CoursePreferences 
                          data={[tutor, setTutor]}
                        />

                        <LocationPreferences
                          data={[tutor, setTutor]}
                        />

                        <TimePreferences
                          data={[tutor, setTutor]}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '16px' }}>
                          <Button disabled={true} onClick={handleBack}>
                            Back
                          </Button>
                          <Button onClick={handleNext}>Next</Button>
                        </Box>
                        </>
                      );
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
            // Tutee Registration Form
            else if (tab === 1) {

              // Wait for fetch from database to complete
              if (tuteeFinished) {

                if (tuteeConfirmation) {
                  return (
                    <>
                    <Typography align="center"> Thank you for Registering as a Tutee! </Typography>
                    <Button key={'hello'} component={Link} href={'/dashboard/profile'} fullWidth sx={{ p: 3 }}> 
                      <Typography align="center"> Click Here to See Your Profile! </Typography>
                    </Button>
                    </>
                  )
                }

                // Tutee is already registered
                if (tuteeResult && tuteeResult?.length !== 0) {
                  return (
                    <>
                      <Typography align="center"> You have already registered as a Tutee! </Typography>
                      <Button key={'hello'} component={Link} href={'/dashboard/profile'} fullWidth sx={{ p: 3 }}> 
                        <Typography align="center"> Click Here to Update Profile </Typography>
                      </Button>
                    </>
                  );
                }
                // Tutee needs to be registered
                else if (tuteeResult && tuteeResult?.length === 0) {
                  return (
                    <>
                      <TuteeInformation
                        data={[tutee, setTutee]}
                      />

                      <Button onClick={TuteeRegister}>Register</Button>

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
          severity={(alertMessage === '') ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {(alertMessage === '') ? 'Tutor Creation Successful' : `${alertMessage}`}
        </Alert>
      </Snackbar>
    <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right'}} open={!alertOpen && loadingWheelOpen}>
    <CircularProgress color='secondary' size='10vh'/>
    </Snackbar>

    </>
  );
}
