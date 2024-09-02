import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import * as eventService from '../services/eventService';
import AuthContext from '../contexts/authContext';
import { useDisclosure, useToast } from '@chakra-ui/react';
import CreateEventModal from './CreateEventModal';
import GroupEventsCalendar from './eventCalendar/GroupEventsCalendar';
import EventDetailsModal from './eventCalendar/EventDetailsModal';

const GroupEvents = () => {

    const navigate = useNavigate();
    const toast = useToast();
    const { groupId } = useParams();
    const { activityTags, groupRegionCity, groupAdmin } = useOutletContext();
    const { logoutHandler, socket } = useContext(AuthContext);

    const createEventModal = useDisclosure();
    const showEventDetailsModal = useDisclosure();

    //Group events in current visible date range
    const [groupEvents, setGroupEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedEventDetails, setSelectedEventDetails] = useState({});

    //Monitor when the calendar starts and finishes loading events
    const [isLoading, setIsLoading] = useState(false);


    const fetchEventsForRange = (startDate, endDate) => {
        setIsLoading(true);
        eventService.getGroupEvents(groupId, startDate, endDate)
            .then((groupEvents) => {
                setGroupEvents(groupEvents);
            })
            .catch(error => {

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
                    navigate('/login');
                } else if (error.status === 403) {
                    //handle edge case : user opens notification for group event after he was removed or left this group
                    //handle edge case : user was removed from group admin but has outdated UI
                    navigate(`/my-groups`); //redirect to My Groups page to refresh UI for sure
                    toast({
                        title: 'Не сте член на групата!',
                        description: 'Присъдинете се отново, за да получите достъп до груповия календар.',
                        status: "info",
                        duration: 10000,
                        isClosable: true,
                        position: "bottom",
                    });
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle case : error connecting with server or other possible server errors
                    toast({
                        title: 'Нещо се обърка! Опитайте по-късно!',
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            })
            .finally(() => {
                setIsLoading(false);
            });

    }

    // Handler to update selected date and open create event modal
    const handleDateClick = (date) => {
        setSelectedDate(date);
        createEventModal.onOpen();
    };

    const handleEventClick = (eventDetailsObj) => {

        //Get clicked event info : 
        //Access event id 
        //Access group id of the group in which current event is created in
        const { id, groupId } = eventDetailsObj;

        setSelectedEventDetails({ groupId, id });
        showEventDetailsModal.onOpen();
    }


    //UPDATE UI HANDLERS

    //Working with the callback form of setState (with updater function) ensures access to the latest state value regardless of when or where it is called.
    //regardless of the refernce given in useEffect used for managing event listeners for events from socket server 
    //FOR THE CURRENT GROUP context (because groupId is in its dependency array) 

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
        showEventDetailsModal.onClose() //Closes current user event details modal and other users' viewing event details in the moment
    }

    //Update edited event in local state + update other members' calendars who are viewing event calendar for the current group in the moment of event update
    const handleUpdateEvent = (updatedEvent) => {

        //Use functional update form of setState() to avoid stale state closure problem!
        setGroupEvents((prevGroupEvents) => {

            //find the index of edited event object
            const updatedIndex = prevGroupEvents.findIndex((event) => event._id === updatedEvent._id);

            // If the event is found, update it
            if (updatedIndex !== -1) {

                //Unify updatedEvent with other events format (because groupId field of updatedEvent is populated because of notifications)
                //Exclude membersToNotify field
                //Exclude previousTitleChanged field (used for notifications)
                //Extract groupId from the updated event and override it in updatedEventWithGroupIdOnly object
                const { _id: groupId } = updatedEvent.groupId;
                const { membersToNotify, previousTitleChange, ...updatedEventWithoutMembersToNotifyAndPrevTitle } = updatedEvent;
                const updatedEventWithGroupIdOnly = { ...updatedEventWithoutMembersToNotifyAndPrevTitle, groupId };

                //Create new array wih the updated event (new reference for state of reference type )
                const newGroupEvents = [...prevGroupEvents];
                newGroupEvents[updatedIndex] = updatedEventWithGroupIdOnly //new reference (object ref type in the array)

                return newGroupEvents;
            }
            // If event is not found (race conditions), return the previous state as is (no re-render is triggered in this case)
            return prevGroupEvents;
        });
        showEventDetailsModal.onClose();//Closes current user event details modal and other users' viewing event details in the moment
    }

    //Join / leave group event notification for server
    //Setup event listeners for events from socket server for immediate(real-time) group calendar view change
    useEffect(() => {

        socket?.emit('visit event calendar', groupId);
        socket?.on('add new event to calendar', handleAddNewEvent);
        socket?.on('update existing event in calendar', handleUpdateEvent);
        socket?.on('delete event from calendar', handleRemoveEvent);

        //Cleanup the event listener on component unmount or when groupId / socket changes and use effect is triggered again
        return () => {

            socket?.emit('leave event calendar', groupId);
            socket?.off('add new event to calendar', handleAddNewEvent);
            socket?.off('update existing event in calendar', handleUpdateEvent);
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
                    groupActivityTags={activityTags}
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
                isLoading={isLoading}
            />

            {
                showEventDetailsModal.isOpen && <EventDetailsModal
                    isOpen={showEventDetailsModal.isOpen}
                    onClose={showEventDetailsModal.onClose}
                    eventDetailsObj={selectedEventDetails}
                    groupAdmin={groupAdmin}
                    groupRegionCity={groupRegionCity}
                    groupActivityTags={activityTags}
                    handleRemoveEvent={handleRemoveEvent}
                    handleUpdateEvent={handleUpdateEvent}
                    existingEvents={groupEvents}
                />
            }


        </>

    )
}

export default GroupEvents
