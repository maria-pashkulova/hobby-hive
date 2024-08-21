import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import * as userService from '../services/userService';
import { useDisclosure } from '@chakra-ui/react';
import GroupEventsCalendar from './eventCalendar/GroupEventsCalendar';
import EventDetailsModal from './eventCalendar/EventDetailsModal';
import AuthContext from '../contexts/authContext';

const MyCalendar = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const showEventDetailsModal = useDisclosure();

    //Events the user is going to attend to in current visible date range
    const [myEvents, setMyEvents] = useState([]);
    const [selectedEventDetails, setSelectedEventDetails] = useState({});

    //Remove event from My calendar - local state update upon revoke attendance
    const handleRemoveRevokedEvent = (revokedEventId) => {
        setMyEvents((prevMyEvents) => prevMyEvents.filter((currEvent) => currEvent._id !== revokedEventId));
        showEventDetailsModal.onClose()
    }

    const fetchEventsForRange = (startDate, endDate) => {
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
                    //handle case : error connecting with server or server errors with other statuses
                    toast({
                        title: error.message || 'Възникна грешка при свързване!',
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            });

    }


    const handleEventClick = (eventDetailsObj) => {

        //Access event id 
        const id = eventDetailsObj.id;
        // Access the _id of the groupId field; parse it from string to actual JS object
        const groupPopulatedObj = JSON.parse(eventDetailsObj.groupId);
        const groupId = groupPopulatedObj._id;

        setSelectedEventDetails({ groupId, id });
        showEventDetailsModal.onOpen();
    }

    return (
        <>

            <GroupEventsCalendar
                groupEvents={myEvents}
                onEventClick={handleEventClick}
                fetchEventsForRange={fetchEventsForRange}
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
