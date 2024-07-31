
// Define utility functions here

import FullCalendar from "@fullcalendar/react";
import { EventApi } 
  from "@fullcalendar/core/index.js";


// Takes a string as input and returns a string in Title Case, i.e. "lorem ipsum" -> "Lorem Ipsum"
export function toTitleCase(sentence: string | null | undefined) {
  if (!sentence) return "";

  const words = sentence.split(" ");

  for (let i = 0; i < words.length; i++) {
    if (words[i])
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" ");
}

// Format a stringified number (1234567890) to phone number format (123-456-7890)
export function toPhoneNumber(phone: string | null | undefined) {
  if (!phone) return "";

  phone = phone.replace(/[^0-9]/g, '');
  phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  return phone;
}

// Format date object or string representation of an ISO time (i.e. 2024-04-28T13:00:31Z) to a custom styled format (1:00 PM)
export function toTime(time: string | Date) {
  const dateTime = new Date(time);

  const hours = ((dateTime.getHours() % 12) == 0 ? 12 : dateTime.getHours() % 12).toString();
  const minutes = dateTime.getMinutes().toString().padStart(2, '0');
  var AM_PM = "AM"
  if ((dateTime.getHours() / 12) >= 1) {
    AM_PM = "PM"
  }
  return `${hours}:${minutes} ${AM_PM}`;
}

// Styles the appearance of the date in the appointment header
export function toAppointmentTime(startDate: Date, endDate: Date) {
  const date = startDate.getDate();
  const month = startDate.getMonth() + 1;
  const year = startDate.getFullYear();

  const startTime = `${startDate.getHours()}:${startDate.getMinutes().toString().padEnd(2, '0')}`;
  const endTime = `${endDate.getHours()}:${endDate.getMinutes().toString().padEnd(2, '0')}`;
  const interval = `${toTime(startDate)} - ${toTime(endDate)}`

  return `${month}/${date}/${year} | ${interval}`;
}

export function toAppointmentTimeOnly(startDate: Date, endDate: Date) {
  const interval = `${toTime(startDate)} - ${toTime(endDate)}`

  return `${interval}`;
}

export function toAppointmentDateOnly(startDate: Date, endDate: Date) {
  const date = startDate.getDate();
  const month = startDate.getMonth() + 1;
  const year = startDate.getFullYear();

  return `${month}/${date}/${year}`;
}

export function toDate(day: Date) {
  const date = day.getDate();
  const month = day.getMonth() + 1;
  const year = day.getFullYear();

  return `${month}/${date}/${year}`;
}

export function scheduleToTimes(schedule: React.RefObject<FullCalendar>) {
  const scheduleEvents = schedule.current?.getApi().getEvents();
  
  enum Day { "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" };

  return scheduleEvents?.map((event: EventApi) => {
    const start = event.start;
    const end = event.end;

    const startDOW = start ? Day[start?.getDay()] : "";
    const endDOW = end ? Day[end?.getDay()] : "";

    const startHours = start?.getHours().toString().padStart(2, '0');
    const startMinutes = start?.getMinutes().toString().padStart(2, '0');
    const endHours = end?.getHours().toString().padStart(2, '0');
    const endMinutes = end?.getMinutes().toString().padStart(2, '0');

    const startTime = `${startHours}:${startMinutes}:00`;
    const endTime = `${endHours}:${endMinutes}:00`;

    return { 
      dow: [ startDOW, endDOW ],
      time: [ startTime, endTime ], 
    };
  });
}

export function TutorInfoChecking (formData: any) {
    
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
  if (formData.listingTitle.length > 100) {
    return "Title must be 100 characters or less.";
  }

  // Check bioText length
  if (formData.bioText.length > 1000) {
      return "Bio text must be 1000 characters or less.";
  }

  return('');
}

export function TuteeInfoChecking (formData: any) {
    
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

  return('');
}

export async function AIChatRequest(message) {
  const aiRequestPath = `/api/ai`;
  try {
    const response = await fetch(aiRequestPath, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI response');
    }

    const aiResponse = await response.json();
    return aiResponse.choices[0].message.content;
  } catch (error) {
    throw new Error('Failed to fetch AI response');
  }
}