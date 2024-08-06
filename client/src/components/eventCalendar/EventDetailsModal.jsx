import { Modal, ModalBody, ModalContent, ModalOverlay, Box, Flex, Spinner } from '@chakra-ui/react'
import React, { useContext, useEffect, useState } from 'react'
import EventDetails from './EventDetails'

import * as eventService from '../../services/eventService';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';

//Fetch additional event details data - description, location, activity tags, members going
const EventDetailsModal = ({ isOpen, onClose, eventDetailsObj }) => {

    const { groupId, id } = eventDetailsObj;
    const [particularEvent, setParticularEvent] = useState({});
    const [loading, setLoading] = useState(true);

    const { logoutHandler } = useContext(AuthContext);
    const navigate = useNavigate();


    //On component mount:
    //make make request to fetch event details (with groupId and eventId)
    //and then give it to EventDetails component to display it

    useEffect(() => {
        eventService.getById(groupId, id)
            .then((currEvent) => {
                setParticularEvent(currEvent);
            })
            .catch(error => {

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle other errors
                    console.log(error.message);
                }

            })
            .finally(() => {
                setLoading(false);
            })
    }, [groupId, id]) // although this component will unmount to display another event details, add id (event id) and group Id in dependency array just in case
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
                                <EventDetails event={particularEvent} />
                            </Box>
                        )

                    }

                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default EventDetailsModal
