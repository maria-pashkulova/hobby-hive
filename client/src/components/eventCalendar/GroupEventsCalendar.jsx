import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import bgLocale from '@fullcalendar/core/locales/bg'
import interactionPlugin from '@fullcalendar/interaction';

import { Box } from '@chakra-ui/react'
import addDefaultTimeToSelectedDate from '../../utils/addTimeToSelectedDate';
import './GroupEventsCalendar.css';
import EventInCalendarDateBox from './EventInCalendarDateBox';


const GroupEventsCalendar = ({ groupEvents, onDateClick, onEventClick, fetchEventsForRange }) => {


    const dayClickAction = (dateClickInfo) => {

        const selectedDateAndDefaultTime = addDefaultTimeToSelectedDate(dateClickInfo.dateStr);
        onDateClick(selectedDateAndDefaultTime);

    }

    //Change default event display from fullCalendar library
    const renderEventContent = (eventInfo) => {
        //console.log(eventInfo);

        return (
            <EventInCalendarDateBox
                event={eventInfo.event}
            />
        );
    }

    const eventClickAction = (eventInfo) => {
        // console.log(eventInfo);
        onEventClick(eventInfo.event);
    }

    const handleDatesSet = (datesInfo) => {
        //console.log(datesInfo);

        //end date is exclusive - for example visible days incuding 11.08 -> end : 12.08
        const { start, end } = datesInfo;
        fetchEventsForRange(start, end);
    }

    return (
        <Box
            mt={20}>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={bgLocale}
                headerToolbar={{
                    left: 'prev,next',
                    center: 'title',
                    right: 'dayGridMonth'
                }}
                eventDisplay='block'
                events={groupEvents.map(event => ({
                    id: event._id,
                    title: event.title,
                    color: event.color, //if event has no color, or color value is invalid a default blue color is set by FullCalendar
                    start: event.start,
                    end: event.end,
                    description: event.description,
                    specificLocation: event.specificLocation.name,
                    activityTags: event.activityTags,
                    groupId: event.groupId,
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
            />
        </Box>
    )
}

export default GroupEventsCalendar
