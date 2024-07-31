import * as React from "react";
import { Stack } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventInput } from "@fullcalendar/core/index.js";
import { toTitleCase } from "@/app/_lib/utils";
import EventItem from "./event-item";

function mapEventColor(isConfirmed: boolean, isCancelled: boolean) {
  if (!isConfirmed && !isCancelled) {
    return "#b4b4b8";
  } else if (isConfirmed && !isCancelled) {
    return "#baffc9";
  } else if (isConfirmed && isCancelled) {
    return "#ffb3ba";
  }

  return "black";
}

export default function Schedule({
  tutorEventData,
  tuteeEventData,
  refetch: [tutorRefetch, tuteeRefetch],
}: {
  tutorEventData: Appointment[];
  tuteeEventData: Appointment[];
  refetch: [Function, Function];
}) {
  const currentTime = new Date();
  const [event, setEvent] = React.useState<Appointment>();
  const [eventOpen, setEventOpen] = React.useState(false);
  const [view, setView] = React.useState("timeGridWeek"); // Track the current view
  const [events, setEvents] = React.useState<EventInput[]>([]); // State to hold events

  // Effect to update events when view changes
  React.useEffect(() => {
    // Function to fetch events based on current view
    const fetchEvents = () => {
      if (view === "dayGridMonth") {
        setEvents(formatMonth()); // This is used to ensure that Months doesnt display the topic.
      } else {
        setEvents(formatEvents());
      }
    };

    fetchEvents(); // Fetch events initially
  }, [view, tutorEventData, tuteeEventData]); // Update when view or event data changes

  const formatEvents = () => {
    return tutorEventData
      ?.map<EventInput>((appointment: Appointment) => ({
        title: toTitleCase(
          `Tutee: ${appointment.tuteeFirstName} ${appointment.tuteeLastName}`
        ),
        description: `Topic: ${
          appointment.tuteeRequestComment
            ? appointment.tuteeRequestComment
            : "No details"
        }`,
        start: appointment.startDateTimeString,
        end: appointment.endDateTimeString,
        data: appointment,
        textColor: "black",
        color: mapEventColor(appointment.isConfirmed, appointment.isCancelled),
        url: "click",
      }))
      .concat(
        tuteeEventData?.map<EventInput>((appointment: Appointment) => ({
          title: toTitleCase(
            `Tutor: ${appointment.tutorFirstName} ${appointment.tutorLastName}`
          ),
          description: toTitleCase(
            `Topic: ${
              appointment.tuteeRequestComment
                ? appointment.tuteeRequestComment
                : "No details"
            }`
          ),
          start: appointment.startDateTimeString,
          end: appointment.endDateTimeString,
          data: appointment,
          color: mapEventColor(
            appointment.isConfirmed,
            appointment.isCancelled
          ),
          textColor: "black",
          url: "click",
          isConfirmed: appointment.isConfirmed,
          isCancelled: appointment.isCancelled,
        })) as ConcatArray<EventInput>
      );
  };

  const formatMonth = () => {
    return tutorEventData
      ?.map<EventInput>((appointment: Appointment) => ({
        title: toTitleCase(
          `Tutee: ${appointment.tuteeFirstName} ${appointment.tuteeLastName}`
        ),

        start: appointment.startDateTimeString,
        end: appointment.endDateTimeString,
        data: appointment,
        textColor: "black",
        color: mapEventColor(appointment.isConfirmed, appointment.isCancelled),
        url: "click",
      }))
      .concat(
        tuteeEventData?.map<EventInput>((appointment: Appointment) => ({
          title: toTitleCase(
            `Tutor: ${appointment.tutorFirstName} ${appointment.tutorLastName}`
          ),

          start: appointment.startDateTimeString,
          end: appointment.endDateTimeString,
          data: appointment,
          color: mapEventColor(
            appointment.isConfirmed,
            appointment.isCancelled
          ),
          textColor: "black",
          url: "click",
          isConfirmed: appointment.isConfirmed,
          isCancelled: appointment.isCancelled,
        })) as ConcatArray<EventInput>
      );
  };

  const handleEventClick = (currentEvent: EventClickArg) => {
    currentEvent.jsEvent.preventDefault();
    setEventOpen(true);
    setEvent(currentEvent.event.extendedProps.data as Appointment);
  };

  return (
    <Stack direction="column" spacing={2} width="100%">
      <FullCalendar
        plugins={[interactionPlugin, dayGridPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        height="70vh"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        buttonText={{
          today: "Today",
          month: "Month",
          week: "Week",
          day: "Day",
        }}
        allDaySlot={false}
        slotDuration="00:15:00"
        slotLabelInterval="01:00"
        events={events}
        eventClick={handleEventClick}
        eventOverlap={false}
        nowIndicator
        scrollTime={currentTime.toLocaleTimeString("it-IT")}
        scrollTimeReset={false}
        eventContent={function (arg) {
          return (
            <>
              <b>{arg.event.title}</b>
              <br />
              {arg.event.extendedProps.description}
            </>
          );
        }}
        viewDidMount={(info) => {
          setView(info.view.type);

          info.view.type === "dayGridMonth"
            ? setEvents(formatMonth())
            : setEvents(formatEvents());
        }}
      />
      <EventItem
        appointment={event}
        event={[eventOpen, setEventOpen]}
        refetch={[tutorRefetch, tuteeRefetch]}
      />
    </Stack>
  );
}
