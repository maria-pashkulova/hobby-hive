import { useContext, useEffect, useState } from "react"
import EventModal from "./EventModal"
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import AuthContext from "../contexts/authContext";

import * as eventService from '../services/eventService';


const UpdateEventModal = ({ isOpen, onClose, groupId, eventId, groupRegionCity, groupActivityTags, handleUpdateEvent, existingEvents, isMyCalendar }) => {

    const [currentEventData, setCurrentEventData] = useState({});
    const [loadingEventData, setLoadingEventData] = useState(true);

    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    useEffect(() => {
        //use getById from eventService for event data population instead of getting it from state
        //for up-to-date information because group administrator can also update group events
        eventService.getById(groupId, eventId)
            .then((currEvent) => {
                setCurrentEventData(currEvent);
            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
                    navigate('/login');
                } else if (error.status === 404) {

                    //handle case : concurrently manipulated event from group administrator and a group member
                    //User is trying to get event details for an event that was deleted by admin during the time the other user was viwing My Calendar page
                    //For a particular group event calendar this case is handled out-of-the-box by real-time group calendar update when event is deleted

                    if (isMyCalendar) {
                        navigate(`/groups/${groupId}/events`);
                    }

                    //user-friendly error message comes from server
                    toast({
                        title: error.message,
                        status: "error",
                        duration: 10000,
                        isClosable: true,
                        position: "bottom",
                    });

                } else if (error.status === 403) {
                    //Handle case : user attending on an event in a group trying to get event details from My calendar page
                    //he has opened the details modal, group admin removes the user from group after that and when he wants to perform event update
                    //request for event details is made first and server returns 403
                    //the same edge case is also possible in Group events calendar
                    navigate(`/groups/${groupId}`);
                    toast({
                        title: 'Не сте член на групата!',
                        description: `Били сте премахнати от администратора на групата. Присъдинете се към групата отново, за да достъпите събитието.`,
                        status: "info",
                        duration: 10000,
                        isClosable: true,
                        position: "bottom",
                    })
                } else {
                    //handle case : error connecting with server or server errors with other statuses if any
                    toast({
                        title: error.message || 'Възникна грешка при свързване!',
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            })
            .finally(() => {
                setLoadingEventData(false);
            })

    }, [groupId, eventId]);// although this component will unmount to display update modal for another event, add eventId and group Id in dependency array just in case

    return (
        <EventModal
            isOpen={isOpen}
            onClose={onClose}
            groupId={groupId}
            groupRegionCity={groupRegionCity}
            groupActivityTags={groupActivityTags}
            handleEventsChange={handleUpdateEvent}
            existingEvents={existingEvents}
            currentEventData={currentEventData}
            loadingEventData={loadingEventData}
        />
    )
}

export default UpdateEventModal
