import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import bgLocale from '@fullcalendar/core/locales/bg'
import interactionPlugin from '@fullcalendar/interaction';

import { Box } from '@chakra-ui/react'
import addDefaultTimeToSelectedDate from '../../utils/addTimeToSelectedDate';


const GroupEventsCalendar = ({ groupEvents, onDateClick }) => {


    const dayClickAction = (dateClickInfo) => {

        const selectedDateAndDefaultTime = addDefaultTimeToSelectedDate(dateClickInfo.dateStr);
        onDateClick(selectedDateAndDefaultTime);

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
                events={groupEvents}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}

                // eventContent={(eventInfo) => {

                //     console.log(new Date(eventInfo.event.end));
                //     const startTime = format(new Date(eventInfo.event.start), 'HH:MM'); //format from date-fns library
                //     const endTime = format(new Date(eventInfo.event.end), 'HH:MM');
                //     return (
                //         <div>
                //             <b>{startTime} - {endTime}</b>
                //             <i>{eventInfo.event.title}</i>
                //         </div>
                //     );
                // }}

                dateClick={dayClickAction}
            />
        </Box>
    )
}

export default GroupEventsCalendar
