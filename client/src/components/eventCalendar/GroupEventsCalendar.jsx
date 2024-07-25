import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import bgLocale from '@fullcalendar/core/locales/bg'
import interactionPlugin from '@fullcalendar/interaction';

import { Box } from '@chakra-ui/react'
import addDefaultTimeToSelectedDate from '../../utils/addTimeToSelectedDate';
import './GroupEventsCalendar.css';
import EventInCalendarDateBox from './EventInCalendarDateBox';


const GroupEventsCalendar = ({ groupEvents, onDateClick, onEventClick }) => {


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
                events={groupEvents.map(event => ({
                    id: event._id,
                    title: event.title,
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
            />
        </Box>
    )
}

export default GroupEventsCalendar
