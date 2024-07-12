
'use client';


import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Paper, Stack, Typography, FormControl, InputLabel, Select, Autocomplete, MenuItem, TextField, Box, Slider, SelectChangeEvent, Divider }
  from '@mui/material';

import { TableFetch } 
  from '@/app/_lib/data';


function valuetext(value: number) {
  return `$${value}`;
}

function valueLabelFormat(value: number) {
  return `$${value}`;
}


// Interval between knobs on the Tutor Pay Rate slider component
const minKnobDistance = 10;

// Sorting options when querying tutors
const sortOptions = [
  { label: "Rating",          query: "average_rating_descending" },
  { label: "Lowest Payrate",  query: "pay_rate_ascending" },
  { label: "Highest Payrate", query: "pay_rate_descending" }
];

// Seniority options when querying tutors
const seniorityOptions: { label: Seniority, query: string }[] = [
  { label: "All",       query: "freshman, sophomore, junior, senior, graduate" }, 
  { label: "Freshman",  query: "freshman" }, 
  { label: "Sophomore", query: "sophomore" }, 
  { label:"Junior",     query: "junior" }, 
  { label: "Senior",    query: "senior" }, 
  { label: "Graduate",  query: "graduate" }
];


/**
 * Component for displaying tutor filter box on Tutor Page
 * @param rate - State variable and setter function for the tutor's pay rate
 * @param sort - State variable and setter function for the tutor sort query (i.e. Rating, Lowest Payrate, Highest Payrate)
 * @param major - State variable and setter function for the tutor's major
 * @param course - State variable and setter function for the tutor's courses
 * @param seniority - State variable and setter function for the tutor's seniority
 * @returns 
 */  
export default function TutorFilter(
  { 
    rate: [rate, setRate], 
    sort: [sort, setSort], 
    major: [major, setMajor], 
    course: [course, setCourse], 
    seniority: [seniority, setSeniority],  
  } 
  : 
  { 
    rate:      [number[],      Function],
    sort:      [string,        Function], 
    major:     [string | null, Function],
    course:    [string | null, Function],
    seniority: [string,        Function],
  }
){
  const [slider, setSlider] = React.useState([0, 200]);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Set the major state if the URL contains the major parameter
  React.useEffect(() => {
    const majorParam = searchParams.get('major');
    if (majorParam !== null) {
      setMajor(majorParam.toUpperCase());
    } else {
      setMajor(null); 
    }
  }, [searchParams, setMajor]);
  
  // Handler functions for setting state variables
  const handleRateChange = (
    event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      setSlider([Math.min(newValue[0], slider[1] - minKnobDistance), slider[1]]);
    } else {
      setSlider([slider[0], Math.max(newValue[1], slider[0] + minKnobDistance)]);
    }
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    let newSortBy: string = event.target.value;
    setSort(newSortBy);
  };

  const handleMajorChange = (event: any, value: string | null) => {
    setMajor(value);
    setCourse(null);
  };

  const handleCourseChange = (event: any, value: string | null) => {
    setCourse(value);
  };

  const handleSeniorityChange = (event: SelectChangeEvent) => {
    setSeniority(event.target.value);
  };


  // Database Fetching
  const { data: majorData, isLoading: majorIsLoading } = 
    TableFetch<Major[]>("major", []);

  const { data: courseData } =
    TableFetch<Course[]>("course", [major], `major_abbreviation_contains=${major}`);


  // Functions to populate the Autocomplete MUI components with selectable values
  const populateMajorOptions = () => {
    if (majorData) 
      return (
        majorData.map( 
          (major: Major) => (major.majorAbbreviation.toUpperCase()) 
        )
      ).sort( 
        (a, b) => (-b.localeCompare(a)) 
      );

    return [];
  };

  const populateCourseOptions = () => {
    if (courseData) 
      return (
        courseData.map( 
          (course: Course) => (course.courseNumber.toString()) 
        )
      ).sort( 
        (a, b) => (-b.localeCompare(a)) 
      );

    return [];
  };


  return (
    <Paper variant="outlined" sx={{ p: 2, minWidth: '0%', position: 'sticky', top: 10 }}>
      <Stack direction="column" spacing={3} divider={ <Divider orientation="horizontal" flexItem /> }>
        <Typography variant="h4" textAlign="center"> Filters </Typography>

        {/* Sort Box */}
        <FormControl fullWidth>
          <InputLabel id="select-sort-label"> Sort By </InputLabel>
          <Select labelId="select-sort-label" id="select-sort" value={sort} label="Sort By" onChange={handleSortChange}>
            { sortOptions.map((option, index) => (<MenuItem value={option.query} key={index}> {option.label} </MenuItem>)) }
          </Select>
        </FormControl>

        {/* Payrate slider */}
        <Stack direction="column" spacing={2}>
          <Typography variant="body1" fontWeight="bold"> Hourly Rate </Typography>
          <Box px={1}>
            <Slider 
              valueLabelDisplay="on" valueLabelFormat={valueLabelFormat} getAriaLabel={() => ""} getAriaValueText={valuetext}
              min={0} max={200} step={5} 
              value={slider} onChange={handleRateChange} onChangeCommitted={ () => setRate(slider) }
              disableSwap sx={{ '& .MuiSlider-valueLabel': { top: 4, backgroundColor: 'unset', '& *': { background: 'transparent', color: '#000' } } }}
            />
          </Box>
        </Stack>

        {/* Major and Course Autocomplete Boxes */}
        <Stack direction="row" spacing={2}>
          {/* Major */}
          <Stack direction="column" width="50%" spacing={1}>
            <Typography fontWeight="bold"> Tutor&apos;s Major </Typography>
            <Autocomplete 
              fullWidth loading={majorIsLoading}
              id="autocomplete-major" 
              options={populateMajorOptions()} 
              isOptionEqualToValue={ (option, value) => (option === value) }
              groupBy={ (option) => option[0] }
              value={major || null} onChange={handleMajorChange} 
              renderInput={ (params) => <TextField {...params} label="Major" /> } 
            />
          </Stack>

          {/* Course */}
          <Stack direction="column" width="50%" spacing={1}>
            <Typography fontWeight="bold"> Tutor&apos;s Course </Typography>
            <Autocomplete 
              fullWidth 
              id="autocomplete-course" 
              options={populateCourseOptions()}
              isOptionEqualToValue={ (option, value) => (option === option) }
              groupBy={ (option) => option.toString()[0] }
              value={course || null} onChange={handleCourseChange}
              renderInput={ (params) => <TextField {...params} label="Course" /> }
              disabled={!major}
            />
          </Stack>
        </Stack>

        {/* Seniority Box */}
        <FormControl fullWidth>
          <InputLabel id="select-seniority-label"> Seniority </InputLabel>
          <Select labelId="select-seniority-label" id="select-seniority" value={seniority} label="Seniority" onChange={handleSeniorityChange}>
            { seniorityOptions?.map((option, index) => (<MenuItem value={option.query} key={index}> {option.label} </MenuItem>)) }
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
}