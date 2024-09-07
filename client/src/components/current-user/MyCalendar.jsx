import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import * as userService from '../../services/userService';
import { useDisclosure } from '@chakra-ui/react';
import GroupEventsCalendar from '../events-calendar/GroupEventsCalendar';
import EventDetailsModal from '../event-details/EventDetailsModal';
import AuthContext from '../../contexts/authContext';

const MyCalendar = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const showEventDetailsModal = useDisclosure();

    //Events the user is going to attend to in current visible date range
    const [myEvents, setMyEvents] = useState([]);
    const [selectedEventDetails, setSelectedEventDetails] = useState({});

    //Monitor when the calendar starts and finishes loading events
    const [isLoading, setIsLoading] = useState(false);

    //Remove event from My calendar - local state update upon revoke attendance
    const handleRemoveRevokedEvent = (revokedEventId) => {
        setMyEvents((prevMyEvents) => prevMyEvents.filter((currEvent) => currEvent._id !== revokedEventId));
        showEventDetailsModal.onClose()
    }

    const fetchEventsForRange = (startDate, endDate) => {
        setIsLoading(true);
        userService.getMyEvents(startDate, endDate)
            .then((myEvents) => {
                setMyEvents(myEvents);
            })
            .catch(error => {

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
                    navigate('/login');
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


    const handleEventClick = (eventDetailsObj) => {

        //Access event id 
        const id = eventDetailsObj.id;
        // Access the _id of the groupId field; parse it from string to actual JS object
        const groupPopulatedObj = JSON.parse(eventDetailsObj.groupId);
        const groupId = groupPopulatedObj._id;

        //Access event name in case of user attending on an event in a group he left
        const eventTitle = eventDetailsObj.title;

        setSelectedEventDetails({ groupId, id, eventTitle });
        showEventDetailsModal.onOpen();
    }

    return (
        <>

            <GroupEventsCalendar
                groupEvents={myEvents}
                onEventClick={handleEventClick}
                fetchEventsForRange={fetchEventsForRange}
                isLoading={isLoading}
            />

            {
                showEventDetailsModal.isOpen && <EventDetailsModal
                    isOpen={showEventDetailsModal.isOpen}
                    onClose={showEventDetailsModal.onClose}
                    eventDetailsObj={selectedEventDetails}
                    handleRemoveEvent={handleRemoveRevokedEvent}
                    isMyCalendar={true}
                />
            }


        </>

    )
}

export default MyCalendar;
