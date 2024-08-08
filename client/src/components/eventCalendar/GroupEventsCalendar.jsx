import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import bgLocale from '@fullcalendar/core/locales/bg'
import interactionPlugin from '@fullcalendar/interaction';

import { Box, Flex, Spinner, useBreakpointValue } from '@chakra-ui/react'
import addDefaultTimeToSelectedDate from '../../utils/addTimeToSelectedDate';
import './GroupEventsCalendar.css';
import EventInCalendarDateBox from './event-display/EventInCalendarDateBox';
import { useEffect, useState } from 'react';


const GroupEventsCalendar = ({ groupEvents, onDateClick, onEventClick, fetchEventsForRange }) => {

    //window resizing related
    const [lastStart, setLastStart] = useState();
    const [lastEnd, setLastEnd] = useState();
    //State used to dynamically define the initial view for fullcalendar
    const [initialView, setInitialView] = useState(null);


    useEffect(() => {
        const isSmallerScreen = window.innerWidth <= 600;
        setInitialView(isSmallerScreen ? 'dayGridWeekThreeDays' : 'dayGridMonth');
    }, [])

    const dayClickAction = (dateClickInfo) => {

        const selectedDateAndDefaultTime = addDefaultTimeToSelectedDate(dateClickInfo.dateStr);
        onDateClick(selectedDateAndDefaultTime);

    }

    //Change default event display from fullCalendar library
    const renderEventContent = (eventInfo) => {

        return (
            <EventInCalendarDateBox
                event={eventInfo.event}
            />
        );
    }

    const eventClickAction = (eventInfo) => {
        //eventInfo includes fields from FullCalendar -> event prop we defined and other defaut fields
        onEventClick(eventInfo.event);
    }

    const handleDatesSet = (datesInfo) => {
        //console.log(datesInfo);
        // console.log(lastStart, lastEnd);


        //end date is exclusive - for example visible days incuding 11.08 -> end : 12.08
        const { start, end } = datesInfo;

        // Check if the date range has actually changed or the window has been resized without changing the view (dayGridMonth / dayGridWeek)
        if (start.getTime() !== lastStart?.getTime() || end.getTime() !== lastEnd?.getTime()) {
            // Save the new date range
            setLastStart(start);
            setLastEnd(end);

            //fetch events for new range 
            fetchEventsForRange(start, end);

        }
    }

    // Conditional rendering to avoid rendering FullCalendar until the initial view is determined
    if (!initialView) {
        return <Flex justifyContent={'center'} my={5}>
            <Spinner size='xl' />
        </Flex>
    }


    return (
        <Box
            mt={20}>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView={initialView}
                locale={bgLocale}
                headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'today' // user would not have opportunity to change view; view is changed programmatically only
                }}
                //All events have solid background
                eventDisplay='block'
                // add event info - title,color,start,end (Fullcalendar expects these certain prop names) + extendedProps
                events={groupEvents.map(event => ({
                    id: event._id,
                    title: event.title,
                    color: event.color, //if event has no color, or color value is invalid a default blue color is set by FullCalendar
                    start: event.start,
                    end: event.end,
                    // my calendar - groupId field is populated : {_id:group id, name:...}
                    // group events - groupId is just the group id as string
                    groupId: typeof event.groupId === 'object'
                        ? JSON.stringify(event.groupId)
                        : event.groupId,
                    ownerId: event._ownerId
                }))}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}

                eventContent={renderEventContent}
                dateClick={dayClickAction}
                eventClick={eventClickAction}
                datesSet={handleDatesSet}
                views={{
                    dayGridWeekThreeDays: {
                        type: 'dayGrid',
                        duration: { days: 3 }
                        // dayCount: 3 //works the same as duration in this specific case
                    }
                }}
                windowResize={(arg) => {
                    const calendarApi = arg.view.calendar;
                    const isSmallerScreen = window.innerWidth <= 600;
                    calendarApi.changeView(isSmallerScreen ? 'dayGridWeekThreeDays' : 'dayGridMonth');
                }}
            />
        </Box>
    )
}

export default GroupEventsCalendar
