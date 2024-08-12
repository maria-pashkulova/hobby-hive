import { Box, Container, Flex, Spinner, useToast } from '@chakra-ui/react'
import ChangeGroupEventRequestCard from './ChangeGroupEventRequestCard';
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom';
import AuthContext from '../contexts/authContext';

import * as changeRequestService from '../services/changeRequestService';


const GroupEventChangeRequests = () => {
    const [groupId] = useOutletContext();
    const [groupEventChangeRequests, setGroupEventChangeRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const toast = useToast();

    const { logoutHandler } = useContext(AuthContext);

    useEffect(() => {
        changeRequestService.getGroupEventChangeRequests(groupId)
            .then((requests) => {
                setGroupEventChangeRequests(requests)
            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle other errors
                    toast({
                        title: "Възникна грешка!",
                        description: "Опитайте по-късно",
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

    }, [groupId])


    return (
        <Container maxW='80vw' mt={10}>
            {loading ?
                (
                    <Flex justifyContent={'center'}>
                        <Spinner size='xl' />
                    </Flex>
                )
                :
                (
                    groupEventChangeRequests.length > 0 ?

                        (

                            groupEventChangeRequests.map(request => (
                                <ChangeGroupEventRequestCard
                                    key={request._id}
                                    eventTitle={request.eventId?.title}
                                    requestDescription={request.description}
                                    requestedFrom={request.requestFromUser?.fullName}
                                    requestDate={request.createdAt}
                                />))
                        )

                        : (<p>Все още няма заявки за промяна на събития в групата</p>)


                )
            }

        </Container>
    )
}

export default GroupEventChangeRequests
