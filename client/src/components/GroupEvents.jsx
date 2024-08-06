import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import * as eventService from '../services/eventService';
import AuthContext from '../contexts/authContext';
import { useDisclosure } from '@chakra-ui/react';
import CreateEventModal from './CreateEventModal';
import GroupEventsCalendar from './eventCalendar/GroupEventsCalendar';
import EventDetailsModal from './eventCalendar/EventDetailsModal';

const GroupEvents = () => {

    const navigate = useNavigate();
    const [groupId, isMember, activityTags, groupRegionCity] = useOutletContext();
    const { logoutHandler, socket } = useContext(AuthContext);


    const createEventModal = useDisclosure();
    const showEventDetailsModal = useDisclosure();

    //Group events in current visible date range
    const [groupEvents, setGroupEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedEventDetails, setSelectedEventDetails] = useState({});


    useEffect(() => {

        return () => {
            socket.emit('leave event calendar', groupId);
        }

    }, [groupId]);

    const fetchEventsForRange = (startDate, endDate) => {
        eventService.getGroupEvents(groupId, startDate, endDate)
            .then((groupEvents) => {
                setGroupEvents(groupEvents);
                socket?.emit('visit event calendar', groupId);
            })
            .catch(error => {

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle other errors
                    console.log(error.message);
                }
            });

    }

    // Handler to update selected date and open modal
    const handleDateClick = (date) => {
        setSelectedDate(date);
        createEventModal.onOpen();
    };

    const handleEventClick = (eventDetailsObj) => {
        setSelectedEventDetails(eventDetailsObj);
        showEventDetailsModal.onOpen();
    }

    //Add new event to the local state of the event creator
    const handleAddNewEvent = (newEvent) => {
        //unify newEvent with other events format (because groupId field of newEvent is populated because of notifications)
        //Extract groupId from newly created event and override it in newEventWithGroupIdOnly object
        const { _id: groupId } = newEvent.groupId;
        const newEventWithGroupIdOnly = { ...newEvent, groupId };
        setGroupEvents((prevGroupEvents) => [...prevGroupEvents, newEventWithGroupIdOnly]);
    }

    //Update group event states
    //for the users currently viewing the calendar in which a new event was created so that
    //they can see it immediately (no re-fetch needed)
    useEffect(() => {
        const handleUpdateEvents = (newEvent) => {
            //unify newEvent with other events format (because groupId field of newEvent is populated because of notifications)
            //Extract groupId from newly created event and override it in newEventWithGroupIdOnly object
            const { _id: groupId } = newEvent.groupId;
            const newEventWithGroupIdOnly = { ...newEvent, groupId };
            setGroupEvents((prevGroupEvents) => [...prevGroupEvents, newEventWithGroupIdOnly]);
        };

        socket?.on('update event calendar', handleUpdateEvents);

        //Cleanup the event listener on component unmount or when groupId / socket changes and use effect is triggered again
        return () => {
            socket?.off('update event calendar', handleUpdateEvents);
        }
    }, [socket, groupId]);


    //може би тази заявка трябва да се изпълни чак след като се намери успешно група
    //ако това е възможно изобщо да хвърли грешка, то ще се хване от catch?
    return (
        <>

            {
                createEventModal.isOpen && <CreateEventModal
                    isOpen={createEventModal.isOpen}
                    onClose={createEventModal.onClose}
                    groupId={groupId}
                    groupRegionCity={groupRegionCity}
                    activityTags={activityTags}
                    selectedDate={selectedDate}
                    handleAddNewEvent={handleAddNewEvent}
                    existingEvents={groupEvents} // Pass existing events as a prop
                />
            }

            <GroupEventsCalendar
                groupEvents={groupEvents}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                fetchEventsForRange={fetchEventsForRange}
            />

            {
                showEventDetailsModal.isOpen && <EventDetailsModal
                    isOpen={showEventDetailsModal.isOpen}
                    onClose={showEventDetailsModal.onClose}
                    eventDetailsObj={selectedEventDetails}
                />
            }


        </>

    )
}

export default GroupEvents
