import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import * as eventService from '../services/eventService';
import AuthContext from '../contexts/authContext';
import { useDisclosure } from '@chakra-ui/react';
import CreateEventModal from './CreateEventModal';
import GroupEventsCalendar from './eventCalendar/GroupEventsCalendar';
import EventDetailsModal from './eventCalendar/EventDetailsModal';

const GroupEvents = () => {

    const navigate = useNavigate();
    const { groupId } = useParams();
    const { activityTags, groupRegionCity, groupAdmin } = useOutletContext();
    const { logoutHandler, socket } = useContext(AuthContext);

    const createEventModal = useDisclosure();
    const showEventDetailsModal = useDisclosure();

    //Group events in current visible date range
    const [groupEvents, setGroupEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedEventDetails, setSelectedEventDetails] = useState({});


    const fetchEventsForRange = (startDate, endDate) => {
        eventService.getGroupEvents(groupId, startDate, endDate)
            .then((groupEvents) => {
                setGroupEvents(groupEvents);
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


    //UPDATE UI HANDLERS

    //Working with the callback form of setState (with updater function) ensures access to the latest state value regardless of when or where it is called.
    //regardless of the refernce given in useEffect used for managing event listeners for events from socket server 
    //FOR THE CURRENT GROUP context (because groupId is in its dependecy array) 

    //Add new event to the local state of the event creator + update other members' calendars who are viewing event calendar for the current group in the moment of event creation
    const handleAddNewEvent = (newEvent) => {
        //unify newEvent with other events format (because groupId field of newEvent is populated because of notifications)
        //Extract groupId from newly created event and override it in newEventWithGroupIdOnly object
        const { _id: groupId } = newEvent.groupId;
        const newEventWithGroupIdOnly = { ...newEvent, groupId };
        setGroupEvents((prevGroupEvents) => [...prevGroupEvents, newEventWithGroupIdOnly]);
    }

    //Remove deleted event from local state of group admin + update other members' calendars who are viewing event calendar for the current group in the moment of event deletion
    const handleRemoveEvent = (deletedEventId) => {
        setGroupEvents((prevGroupEvents) => prevGroupEvents.filter((currEvent) => currEvent._id !== deletedEventId));
        showEventDetailsModal.onClose()
    }

    //Join / leave group event notification for server
    //Setup event listeners for events from socket server for immediate(real-time) group calendar view change
    useEffect(() => {

        console.log('GroupEvents for group MOUNT OR UPDATE: ' + groupId);

        socket?.emit('visit event calendar', groupId);
        socket?.on('update event calendar', handleAddNewEvent);
        socket?.on('delete event from calendar', handleRemoveEvent);

        //Cleanup the event listener on component unmount or when groupId / socket changes and use effect is triggered again
        return () => {
            console.log('GroupEvents for group UNMOUNT or BEFORE UPDATE: ' + groupId);

            socket?.emit('leave event calendar', groupId);
            socket?.off('update event calendar', handleAddNewEvent);
            socket?.off('delete event from calendar', handleRemoveEvent);

        }


    }, [socket, groupId]);

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
                    groupAdmin={groupAdmin}
                    handleRemoveEvent={handleRemoveEvent}
                />
            }


        </>

    )
}

export default GroupEvents
