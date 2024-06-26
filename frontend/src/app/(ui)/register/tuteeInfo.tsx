import * as React from 'react';

import { useSession } 
  from 'next-auth/react';

import { Grid, Autocomplete, TextField, Box, InputLabel, Select, MenuItem, Button, SelectChangeEvent }
  from '@mui/material';

import { TablePush, TableFetch }
  from '@/app/_lib/data';

/**
 * Component for displaying Tutee Registration Page
 * @param data - Tutee Data 
 * @returns 
 */
export function TuteeInformation(
  {data : [data, setData]
  }
  :
  {data : [Tutee, Function],
  }
) {

  /**
   * Options for seniority
   */
  const seniorityOptions = [
    { value: 'freshman', label: 'Freshman' },
    { value: 'sophomore', label: 'Sophomore' },
    { value: 'junior', label: 'Junior' },
    { value: 'senior', label: 'Senior' },
    { value: 'graduate', label: 'Graduate Student' }
  ];

  // Database fetching for majors
  const { data: majorData, isLoading: majorIsLoading } = 
    TableFetch<Major[]>("major", []);

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

  /////////////////////////////////////////////
  //      functions for handling changes     //
  /////////////////////////////////////////////

  const handleSeniorityChange = (event: SelectChangeEvent) => {
    setData((prevData: any) => ({ ...prevData, ['seniorityName']: event.target.value as Seniority}));
  };

  const handleMajorChange = (event: any, value: string | null) => {
    setData({...data, majorAbbreviation: value});
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setData((prevData: any) => ({ ...prevData, [name]: value }));
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
            value={data.firstName}
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
            value={data.lastName}
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
            value={(data.phoneNumber === 0) ? '' : data.phoneNumber}
            onChange={handleChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
        <InputLabel id="senioritySelect">Seniority</InputLabel>
        <Select
          labelId="seniorityLabel"
          id="seniority"
          value={data.seniorityName}
          label="seniority"
          onChange={handleSeniorityChange}
        >
          {seniorityOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
        </Select>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <InputLabel htmlFor="major">Undergrad Major (4 letters)</InputLabel>
          <Autocomplete 
                fullWidth loading={majorIsLoading}
                id="autocomplete-major" 
                options={populateMajorOptions()} 
                isOptionEqualToValue={ (option, value) => (option === value) }
                groupBy={ (option) => option[0] }
                value={data.majorAbbreviation} onChange={handleMajorChange}
                renderInput={ (params) => <TextField {...params} label="Major" /> } 
            />
        </Grid>

      </Grid>
    </Box>
  );
}