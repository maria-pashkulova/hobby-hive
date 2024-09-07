import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import bgLocale from '@fullcalendar/core/locales/bg'
import interactionPlugin from '@fullcalendar/interaction';

import { Box, Flex, Spinner } from '@chakra-ui/react'
import addDefaultTimeToSelectedDate from '../../utils/addTimeToSelectedDate';
import './GroupEventsCalendar.css';
import EventInCalendarDateBox from './event-display/EventInCalendarDateBox';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';


const GroupEventsCalendar = ({ groupEvents, onDateClick, onEventClick, fetchEventsForRange, isLoading }) => {

    //window resizing related
    const [lastStart, setLastStart] = useState();
    const [lastEnd, setLastEnd] = useState();
    //State used to dynamically define the initial view for fullcalendar
    //on first page load. Also used to determine if the calendar is setup so .gotoDate() works properly both on first
    //page load and if calendar page has been previously viewed by user when he received notification for event create/delete
    const [initialView, setInitialView] = useState(null);


    //If user is has come on group events page by notification
    //for event create / delete , goToDate is used to show the month in which a group was created / deleted
    //because by default FullCalendar loads the current month

    const location = useLocation();
    //if user does not go to group events page from notification - in this case location.state is null
    //end error will be thrown if trying to destucture null; fallback {} -> destructuring empty object assigns 
    //eventStart undefined value (which is falsy and works ok in this case)
    const { eventStart } = location.state || {};

    const calendarRef = useRef(null);

    //determine initial view dynamically on component mount
    useEffect(() => {
        const isSmallerScreen = window.innerWidth <= 600;
        setInitialView(isSmallerScreen ? 'dayGridWeekThreeDays' : 'dayGridMonth');
    }, [])


    useEffect(() => {

        if (initialView && eventStart) {

            // Use a microtask to defer the operation until after the render
            Promise.resolve().then(() => {
                //optional chaining is needed because of initial null value of calendarRef
                const calendarApi = calendarRef.current?.getApi();
                calendarApi?.gotoDate(new Date(eventStart));
            });
        }
    }, [initialView, eventStart]);



    const dayClickAction = (dateClickInfo) => {

        //Group events component does provide onDateClick function prop, in order to open create event modal with selected date as event's start date
        //My calendar component does not provide a prop function onDateClick (so it is undefined)
        if (typeof onDateClick === 'function') {
            const selectedDateAndDefaultTime = addDefaultTimeToSelectedDate(dateClickInfo.dateStr);
            onDateClick(selectedDateAndDefaultTime);
        }

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
            mt={20}
            className={isLoading ? 'calendar-disabled' : ''}
        >
            {/* timeZone prop is local - default for FullCalendar */}
            <FullCalendar
                ref={calendarRef}
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
                    ownerId: event._ownerId //goes to extendedProps object in the object given from full calendar on event click
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
