'use client'

import * as React from 'react';

import { useSession }
  from 'next-auth/react';

import { useUser } from "@auth0/nextjs-auth0/client";

import { Skeleton, Button, Typography, Avatar, Paper, Tab, Tabs, Snackbar, Alert, CircularProgress } 
  from '@mui/material';

import { TableFetch, TablePush }
  from '@/app/_lib/data';

import { TutorUpdatePage }
  from './tutorUpdate'

import { TuteeUpdatePage }
  from './tuteeUpdate'

const tabLabels = ["Peer Tutor Profile Information", "Tutee Profile Information"];

/**
 * Sets default values for Tutor variable (used for initializations)
 */
const initialTutorProfileData: Tutor = {
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
  seniorityName: "Senior",
  numberOneStarRatings: 0,
  numberTwoStarRatings: 0,
  numberThreeStarRatings: 0,
  numberFourStarRatings: 0,
  numberFiveStarRatings: 0,
};

/**
 * Sets default values for Tutee variable (used for initializations)
 */
const initialTuteeProfileData: Tutee = {
  activeStatusName: "active",
  email: "",
  firstName: "",
  lastName: "",
  majorAbbreviation: "",
  phoneNumber: 0,
  seniorityName: "Senior",
  pictureUrl: ""
};

/**
 * @function React Component for Profile Page
 * @returns JSX Component for Profile Page
 */
export default function ProfilePage() {
  const { user } = useUser();

  // State variables for showing things on the page
  const [tab, setTab] = React.useState(0);
  const [loadingWheelOpen, setLoadingWheelOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [tutorPopupOpen, setTutorPopupOpen] = React.useState(false);
  const [tuteePopupOpen, setTuteePopupOpen] = React.useState(false);

  // State Variable to tracking if database should be modified
  const [tutorUpdate, setTutorUpdate] = React.useState(false);
  const [tuteeUpdate, setTuteeUpdate] = React.useState(false);
  const [transcriptUpdate, setTranscriptUpdate] = React.useState(false);
  const [coursePreferencesUpdate, setCoursePreferencesUpdate] = React.useState(false);
  const [locationPreferencesUpdate, setLocationPreferencesUpdate] = React.useState(false);
  const [timePreferencesUpdate, setTimePreferencesUpdate] = React.useState(false);

  // State variables for storing tutor and tutee data
  const [tutorProfileData, setTutorProfileData] = React.useState<Tutor>(initialTutorProfileData);
  const [tuteeProfileData, setTuteeProfileData] = React.useState<Tutee>(initialTuteeProfileData);
  const [transcript, setTranscript] = React.useState<File>();

  /////////////////////////////////////////////////////////////////////////////////////////////
  //               Database Queries                                                          //
  /////////////////////////////////////////////////////////////////////////////////////////////

  const { data: tutorData, isLoading: tutorIsLoading, isFetching: tutorIsFetching, isSuccess: tutorIsSuccess, refetch: tutorRefetch } = 
  TableFetch<TutorQuery>("tutor", [user], `email_contains=${user?.email}`);
  
  const { data: tuteeData, isLoading: tuteeIsLoading, isFetching: tuteeIsFetching, isSuccess: tuteeIsSuccess, refetch: tuteeRefetch } = 
  TableFetch<TuteeQuery>("tutee", [user], `email_contains=${user?.email}`);
  
  const tutorMutationUpdate = TablePush("/tutor/update");
  const tutorTimeMutationUpdate = TablePush("/tutor_time_preference/update");
  const tuteeMutationUpdate = TablePush("/tutee/update");

  /////////////////////////////////////////////////////////////////////////////////////////////
  //               Listen for database modifications                                         //
  /////////////////////////////////////////////////////////////////////////////////////////////

  React.useEffect(() => {
  const updates = [
    { flag: tutorUpdate, updateFunction: UpdateTutorInformation },
    { flag: transcriptUpdate, updateFunction: UpdateTutorTranscript },
    { flag: coursePreferencesUpdate, updateFunction: UpdateTutorCoursePreferences },
    { flag: locationPreferencesUpdate, updateFunction: UpdateTutorLocationPreferences },
    { flag: timePreferencesUpdate, updateFunction: UpdateTutorTimePreferences },
    { flag: tuteeUpdate, updateFunction: UpdateTuteeInformation }
  ];

  updates.forEach(({ flag, updateFunction }) => {
    if (flag) {
    updateFunction();
    }
  });
  }, [tutorUpdate, transcriptUpdate, coursePreferencesUpdate, locationPreferencesUpdate, timePreferencesUpdate, tuteeUpdate]);
  
  // Update state variables on refetching
  React.useEffect(() => {
  if (tutorData?.data && (tutorData.data.length > 0)) {
    setTutorProfileData(tutorData?.data[0]);
  }
  }, [tutorData]);

  React.useEffect(() => {
  if (tuteeData && (tuteeData.length > 0)) {
    setTuteeProfileData(tuteeData[0]);

  }
  }, [tuteeData]);

  /////////////////////////////////////////////////////////////////////////////////////////////
  //               Helper Functions                                                          //
  /////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Displays a successful alert and turns off loading wheel
   */
  const successfulUpdate = () => {
  setAlertOpen(true);
  setLoadingWheelOpen(false);
  setAlertMessage("success");
  }

  /**
   * Displays an error alert and turns off loading wheel
   * @param message Error message to be displayed
   */
  const errorUpdate = (message: string) => {
  setAlertOpen(true);
  setLoadingWheelOpen(false);
  setAlertMessage(message);
  }

  /**
   * Updates Tutee Profile based on tuteeProfileData variable
   */
  const UpdateTuteeInformation = () => {

  setTuteeUpdate(false);

  const newTuteeInformation = {
    email_old: tuteeProfileData.email,
    active_status_name_new: tuteeProfileData.activeStatusName,
    first_name_new: tuteeProfileData.firstName,
    last_name_new: tuteeProfileData.lastName,
    major_abbreviation_new: tuteeProfileData.majorAbbreviation,
    phone_number_new: tuteeProfileData.phoneNumber,
    seniority_name_new: tuteeProfileData.seniorityName
  }

  setLoadingWheelOpen(true);

  tuteeMutationUpdate.mutate(newTuteeInformation, {
    onSuccess: () => {
    successfulUpdate();
    tuteeRefetch();
    },
    onError: (error: Error) => {
    errorUpdate("Failed to update tutee information, please try again later");
    return;
    }
  });
  
  };

  /**
   * Updates Tutor General Information with data in tutorProfileData variable
   */
  const UpdateTutorInformation = () => {

  setTutorUpdate(false);

  const newTutorInformation = {
    // Unique Key
    email_old: tutorProfileData.email,

    first_name_new: tutorProfileData.firstName, last_name_new: tutorProfileData.lastName,
    phone_number_new: tutorProfileData.phoneNumber,
    major_abbreviation_new: tutorProfileData.majorAbbreviation, pay_rate_new: tutorProfileData.payRate,

    listing_title_new: tutorProfileData.listingTitle,
    bio_text_new: tutorProfileData.bioText,
  }

  setLoadingWheelOpen(true);

  tutorMutationUpdate.mutate(newTutorInformation, {
    onSuccess: () => {
    successfulUpdate();
    tutorRefetch();
    },
    onError: (error: Error) => {
    errorUpdate("Failed to update tutor general information, please try again later");
    return;
    }
  });
  };

  /**
   * Updates Tutor transcript (eligible courses)
   */
  const UpdateTutorTranscript = () => {

  setTranscriptUpdate(false);

  const newEligible = {
    email_old: tutorProfileData.email,
    transcript: transcript,
    first_name_old: tutorProfileData.firstName,
    last_name_old: tutorProfileData.lastName
  }

  if (!newEligible.transcript) {
    errorUpdate("Please upload a transcript");
    return;
  }

  setLoadingWheelOpen(true);

  tutorMutationUpdate.mutate(newEligible, {
    onSuccess: () => {
    successfulUpdate();
    tutorRefetch();
    },
    onError: (error: Error) => {
    console.log(error);
    errorUpdate("Transcript failed to upload. Make sure profile name matches transcript name");
    return;
    }
  });

  };

  /**
   * Updates Tutor course preferences with data in tutorProfileData variable
   */
  const UpdateTutorCoursePreferences = () => {

  const generateCourseString = (courses: Course[]): string => courses.map(course => `${course.majorAbbreviation} ${course.courseNumber} ${course.courseGrade}`).join(", ");

  setCoursePreferencesUpdate(false);

  const newPreferences = {
    email_old: tutorProfileData.email,
    course_preferences_new: generateCourseString(tutorProfileData?.coursePreferences)
  }

  if (!newPreferences.course_preferences_new) {
    errorUpdate("Please select at least one course preference");
    return;
  }

  setLoadingWheelOpen(true);

  tutorMutationUpdate.mutate(newPreferences, {
    onSuccess: () => {
    successfulUpdate();
    tutorRefetch();
    },
    onError: (error: Error) => {
    errorUpdate("Failed to update course preferences, please try again later");
    return;
    }
  });

  };

  /**
   * Updates Tutor location preferences with data in tutorProfileData variable
   */
  const UpdateTutorLocationPreferences = () => {

  const generateLocationString = (locations: { locationName: LocationType; tutorEmail: string; }[]): string => {
    const locationNames = locations.map(location => location.locationName);
    return locationNames.join(", ");
  };

  setLocationPreferencesUpdate(false);

  const newLocation = {
    email_old: tutorProfileData.email,
    location_preferences_new: generateLocationString(tutorProfileData.locationPreferences)
  }

  if (!newLocation.location_preferences_new) {
    errorUpdate("Please select at least one location preference");
    return;
  }

  setLoadingWheelOpen(true);
  
  tutorMutationUpdate.mutate(newLocation, {
    onSuccess: () => {
    successfulUpdate();
    tutorRefetch();
    },
    onError: (error: Error) => {
    errorUpdate("Failed to update location preferences, please try again later");
    return;
    }
  });
  

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
    
      result.tutor_email = session?.user?.email;
    
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

  setTimePreferencesUpdate(false);

  setLoadingWheelOpen(true);

  tutorTimeMutationUpdate.mutate(formatTimePreferences(tutorProfileData.timePreferences), {
    onSuccess: () => {
    successfulUpdate();
    tutorRefetch();
    },
    onError: (error: Error) => {
    errorUpdate("Failed to update time preferences, please try again later");
    return;
    }
  });

  };

  
  /////////////////////////////////////////////////////////////////////////////////////////////
  //               Button Functions                                                          //
  /////////////////////////////////////////////////////////////////////////////////////////////

  const handleAlertClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
  if (reason === "clickaway") return;

  setAlertOpen(false);
  };

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
  setTab(newValue);
  };

  return (
  <div style={{ paddingTop: '30px'}}>
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
    <Avatar src={user?.image?.toString()} alt="" style={{ marginRight: '10px' }} />
    <Typography variant="h4" gutterBottom>
      My Profile
    </Typography>
    </div>
    <Tabs value={tab} onChange={handleChangeTab} centered>
      <Tab label={tabLabels[0]} />
      <Tab label={tabLabels[1]} />
    </Tabs>


    {(() => {

    // Tutor Update Page
    if (tab === 0) {

      // Initial Fetch Complete
      if (tutorIsSuccess) {

      // If tutor exists
      if (tutorData?.data?.length > 0) {
        return (
        <>
        <TutorUpdatePage 
          popupOpen={[tutorPopupOpen, setTutorPopupOpen]}
          transcript={[transcript, setTranscript]}
          timeUpdate={[timePreferencesUpdate, setTimePreferencesUpdate]}
          locationUpdate={[locationPreferencesUpdate, setLocationPreferencesUpdate]}
          eligibleUpdate={[transcriptUpdate, setTranscriptUpdate]}
          coursePreferencesUpdate={[coursePreferencesUpdate, setCoursePreferencesUpdate]}
          tutorUpdate={[tutorUpdate, setTutorUpdate]}
          data={[tutorProfileData, setTutorProfileData]}
        />
        </>
        );
      }

      // If Tutor doesn't exists
      else {
        return (
        <>
        <Paper variant="outlined" style={{ padding: '20px', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
          We cannot find a Tutor Account with this Email
          </Typography>
          <Typography variant="h4" gutterBottom>
          <Button variant="contained" color="primary" href='/register'>
            Click Here to Register!!
          </Button>
          </Typography>
        </Paper>
        </>
        );
      }

      }

      // Data is loading in
      else {
      return (
        <>
        <Skeleton animation="wave" variant="rounded" width="100%"> </Skeleton>
        </>
      );
      }

    }

    // Tutee Update Page
    if (tab === 1) {

      // Initial Fetch complete
      if (tuteeIsSuccess) {

      // If tutee exists
      if (tuteeData?.length > 0) {
        return (
        <>
        <TuteeUpdatePage 
          popupOpen={[tuteePopupOpen, setTuteePopupOpen]}
          tuteeUpdate={[tuteeUpdate, setTuteeUpdate]}
          data={[tuteeProfileData, setTuteeProfileData]}
        />
        </>
        );
      }

      // If Tutee doesn't exists
      else {
        return (
        <>
        <Paper variant="outlined" style={{ padding: '20px', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
          We cannot find a Tutee Account with this Email
          </Typography>
          <Typography variant="h4" gutterBottom>
          <Button variant="contained" color="primary" href='/register'>
            Click Here to Register!!
          </Button>
          </Typography>
        </Paper>
        </>
        );
      }
      }

      // Data is loading
      else if (tuteeIsFetching || tuteeIsLoading) {
      return (
        <>
        <Skeleton animation="wave" variant="rounded" width="100%"> </Skeleton>
        </>
      );
      }
    }

    return (<></>);

    })()}

    <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={alertOpen} autoHideDuration={5000} onClose={handleAlertClose}>
    <Alert
      onClose={handleAlertClose}
      severity={alertMessage === "success" ? "success" : "error"}
      sx={{ width: '100%' }}
    >
      {alertMessage === "success" ? "Profile Successfully Updated"
                    : alertMessage }
    </Alert>
    </Snackbar>
    <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right'}} open={!alertOpen && loadingWheelOpen}>
    <CircularProgress color='secondary' size='10vh'/>
  </Snackbar>
    
  </div>
  );
}
