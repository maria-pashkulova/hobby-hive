import { Modal, ModalBody, ModalContent, ModalOverlay, Box, Flex, Spinner, useToast } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import EventDetails from './EventDetails'

import * as eventService from '../../services/eventService';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';

//Fetch additional event details data - description, location, activity tags, members going
const EventDetailsModal = ({ isOpen, onClose, eventDetailsObj, groupAdmin, handleRemoveEvent, isMyCalendar }) => {

    const { groupId, id } = eventDetailsObj;
    const [particularEvent, setParticularEvent] = useState({});
    const [isAttending, setIsAttending] = useState(false);
    const [loading, setLoading] = useState(true);
    const toast = useToast();


    const { logoutHandler, userId } = useContext(AuthContext);
    const navigate = useNavigate();


    //On component mount:
    //make make request to fetch event details (with groupId and eventId)
    //and then give it to EventDetails component to display it

    useEffect(() => {
        eventService.getById(groupId, id)
            .then((currEvent) => {

                setParticularEvent(currEvent);

                //currEvent.membersGoing is populated with members data!!!
                const currMembersGoingIds = currEvent.membersGoing.map(member => member._id);
                setIsAttending(currMembersGoingIds.includes(userId));
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
                        duration: 6000,
                        isClosable: true,
                        position: "bottom",
                    });

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

            })
            .finally(() => {
                setLoading(false);
            })
    }, [groupId, id]) // although this component will unmount to display another event details, add id (event id) and group Id in dependency array just in case


    //change membersGoing to an event in the state when user joins an event
    const handleAddMemberGoing = (newMemberGoing) => {
        setParticularEvent((event) => ({
            ...event,
            membersGoing: [...event.membersGoing, newMemberGoing]
        }))

        //change state isAttending
        setIsAttending(true);
    }

    //change membersGoing to an event in the state when user revokes attendance on event
    const handleRemoveMemberGoing = (memberToRemoveFromGoingId) => {
        setParticularEvent((event) => ({
            ...event,
            membersGoing: event.membersGoing.filter(currMemberGoing => currMemberGoing._id !== memberToRemoveFromGoingId)
        }));

        //change state isAttending
        setIsAttending(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}

        >
            <ModalOverlay />
            <ModalContent bg="transparent" boxShadow="none"
                maxWidth={{ base: '90vw', md: '80vw', '2xl': '50vw' }}
            >
                <ModalBody>

                    {loading ?
                        (
                            <Flex justifyContent={'center'} my={5}>
                                <Spinner size='xl' color='white' />
                            </Flex>
                        ) :
                        (eventDetailsObj &&
                            <Box width="100%" height="100%">
                                <EventDetails
                                    event={particularEvent}
                                    isCurrUserAttending={isAttending}
                                    groupAdmin={groupAdmin}
                                    handleAddMemberGoing={handleAddMemberGoing}
                                    handleRemoveMemberGoing={handleRemoveMemberGoing}
                                    handleRemoveEvent={handleRemoveEvent}
                                    isMyCalendar={isMyCalendar}
                                />
                            </Box>
                        )

                    }

                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default EventDetailsModal
