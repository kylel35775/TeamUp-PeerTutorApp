'use client';


import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Container, Grid, Stack, TextField, Pagination, Typography, ToggleButtonGroup, ToggleButton, ButtonBase 
, Tooltip, IconButton }
from '@mui/material';

import { TutorCard, TutorSkeleton }
  from '@/app/(ui)/tutor-card';
import TutorFilter from './tutor-filter';
import TutorProfile from './tutor-profile';
import { TableFetch } 
from '@/app/_lib/data';


// Values displayed in button group for the total amount of tutors queried
const tutorsPerPageOptions = [ 5, 10, 15 ];

/**
 * @function React Component for Tutor Page
 * @returns JSX Component for Tutor Page
 */
export default function TutorPage() {
  // State variables for filter fields used in tutor-filter.tsx and 
  const [search, setSearch] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sort, setSort] = React.useState("average_rating_descending");
  const [rate, setRate] = React.useState([0, 200]);
  const [major, setMajor] = React.useState<string | null>(null);
  const [course, setCourse] = React.useState<string | null>(null);
  const [seniority, setSeniority] = React.useState<string>("freshman, sophomore, junior, senior, graduate");
  const [selectedTutor, setSelectedTutor] = React.useState<Tutor | null>(null);
  const [profileOpen, setProfileOpen] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // State variables and handler functions for pagination
  const [tutorsPerPage, setTutorsPerPage] = React.useState(5);
  const handleTutorsPerPageChange = (event: any, value: number) => {
    setTutorsPerPage(value);
  };
  
  const [page, setPage] = React.useState(1);
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.moveTo(0, 0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  // Set the search state if the URL contains the query parameter
  React.useEffect(() => {
    const searchParam = searchParams.get('query');
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParams, setSearchQuery]);

  // Database Fetching
  const { data: tutorData, isLoading: tutorIsLoading, isFetching: tutorIsFetching } = 
  TableFetch<TutorQuery>("tutor", [tutorsPerPage, page, sort, rate, major, course, seniority, searchQuery], 
    `number_entries_per_page=${tutorsPerPage}`, 
    `page_number=${page}`, 
    `sort_by=${sort}`,
    `pay_rate_greater_than_or_equals=${rate[0]}`,
    `pay_rate_less_than_or_equals=${rate[1]}`,
    `course_preference_major_abbreviation_contains=${major ? major : ""}`,
    `course_preference_number_equals=${course ? course : ""}`,
    `seniority_name_in=${seniority}`,
    `contains=${searchQuery}`,
  );
  
  // Listen to page or tutorData change. Restrains page number to less than total pages from pagination data
  // If page is larger than total pages, set to max page to prevent display error, i.e. Current Page 3 > Total Pages 2
  React.useEffect(() => {
    setPage(Math.max(Math.min(page, (tutorData ? tutorData?.metaData?.totalNumberPages : page)), 1));
  }, [page, tutorData]);


  // Display tutor information as tutor cards
  const printTutors = () => {
    if (tutorIsLoading) {
      return ( <TutorSkeleton /> );
    } 
    else if (tutorData && tutorData?.data?.length > 0) { 
      return tutorData?.data?.map((tutor: Tutor, index: number) => (
        <ButtonBase key={index} disableRipple disabled={tutorIsFetching}
          onClick={() => { setSelectedTutor(tutor); setProfileOpen(true); }}
        > 
          <TutorCard key={index} tutor={tutor} disabled={tutorIsFetching} />
        </ButtonBase>
      ));
    }
    
    return (
      <Typography variant="h4"> Could not find any tutors. . . </Typography>
    )
  };

  // Search bar adornments
  const startSearchAdornment: React.JSX.Element = (
    <IconButton onClick={ () => setSearchQuery(search) }> 
      <SearchIcon /> 
    </IconButton> 
  );

  const endSearchAdornment: React.JSX.Element = (
    search ? 
    <Tooltip title="Clear">
      <IconButton aria-label="Clear" 
        onClick={ () => {
          setSearch("");
          setSearchQuery("");
        } }
      > 
        <ClearIcon />
      </IconButton> 
    </Tooltip>
    : <></>
  );


  return (
    <Box position="static" mb="40px">
      <Container maxWidth="lg" sx={{ width: '100%' }}>
        <Grid container direction="row" spacing={2} my="10px">
          {/* Left side of grid */}
          <Grid item xs={12} md={4}>
            <TutorFilter 
              rate={[rate, setRate]} 
              sort={[sort, setSort]} 
              major={[major, setMajor]} course={[course, setCourse]} 
              seniority={[seniority, setSeniority]} 
            />
          </Grid>

          {/* Pop-up modal box for tutor profile */}
          <TutorProfile tutor={selectedTutor} open={[profileOpen, setProfileOpen]} />
          
          {/* Right side of grid */}
          <Grid item xs={12} md={8}>
            <Stack direction="column" spacing={2} height="100%">
              {/* Search Bar */}
              <TextField 
                id="outlined-tutor-search" label="Search"
                variant="outlined" fullWidth
                value={search} onChange={handleSearchChange} onKeyUp={ (event) => {if (event.key === "Enter") setSearchQuery(search);} }
                InputProps={{ startAdornment: startSearchAdornment, endAdornment: endSearchAdornment }} 
                sx={{ bgcolor: 'white' }}
              />

              { printTutors() }

              {/* Pagination Row at bottom of screen */}
              <Stack direction="row" width="100%" height="100%" alignItems="end">
                <Box display="flex" flexGrow={1} justifyContent="center">
                  <Pagination 
                    color="primary" size="large"
                    count={tutorData ? tutorData?.metaData?.totalNumberPages : 0} page={page} onChange={handlePageChange} 
                    disabled={tutorIsFetching}
                  />
                </Box>

                <Stack direction="column" marginLeft="auto" alignItems="end">
                  <Typography variant="body1" fontWeight="bold" alignSelf="end"> Tutors Per Page: </Typography>
                  <ToggleButtonGroup value={tutorsPerPage} onChange={handleTutorsPerPageChange} exclusive>
                    { 
                      tutorsPerPageOptions.map((option) => (
                        <ToggleButton value={option} key={option}> 
                          <Typography variant="body1"> {option} </Typography> 
                        </ToggleButton>
                      )) 
                    }
                  </ToggleButtonGroup>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}