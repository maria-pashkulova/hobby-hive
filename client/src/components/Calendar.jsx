import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!s
import interactionPlugin from '@fullcalendar/interaction';


const Calendar = ({ groupEvents }) => {

    // console.log(groupEvents);

    const handleDateClick = (arg) => {
        alert(arg.dateStr + ' ' + arg.allDay);
    }
    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale='bg'
                firstDay={1}

                headerToolbar={{
                    left: 'prev next',
                    center: 'title',
                    right: ''
                }}
                events={groupEvents?.map(event => (
                    { title: event.title, date: '2024-05-01T14:30:00' }
                ))}
                dateClick={handleDateClick}
                eventColor='#F6E05E'
                eventTextColor='black'
                displayEventTime='true'
            />

        </div>
    )
}

export default Calendar
