import { Box, Container, Flex, Spinner, useToast } from '@chakra-ui/react'
import ChangeGroupEventRequestCard from './ChangeGroupEventRequestCard';
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../contexts/authContext';

import * as changeRequestService from '../services/changeRequestService';
import Pagination from './Pagination';

const REQUESTS_PER_PAGE = 6;

const GroupEventChangeRequests = () => {
    const { groupId } = useParams();
    const [groupEventChangeRequests, setGroupEventChangeRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pagesCount, setPagesCount] = useState(0);
    const [fetchRequestsAgain, setFetchRequestsAgain] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    const { logoutHandler, socket } = useContext(AuthContext);



    //socket communication related
    useEffect(() => {
        // Join the requests room for this group when the component mounts
        socket?.emit('join requests room', groupId);

        // Handle incoming notification to refetch requests
        const handleNewChangeRequest = () => {
            setFetchRequestsAgain(true); // Trigger refetch in the second useEffect
            setCurrentPage(0);
        }

        socket?.on('new change request', handleNewChangeRequest);

        // Cleanup function to leave the room when the component unmounts
        return () => {
            socket?.emit('leave requests room', groupId);
            socket?.off('new change request', handleNewChangeRequest);
        };
    }, [socket, groupId]);


    useEffect(() => {

        setIsLoading(true);

        changeRequestService.getGroupEventChangeRequests(groupId, {
            page: currentPage,
            limit: REQUESTS_PER_PAGE
        })
            .then(({ requests, totalPages }) => {
                setGroupEventChangeRequests(requests);
                setPagesCount(totalPages);
            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
                    navigate('/login');
                } else if (error.status === 403) {
                    //handle edge case : user who was a group admin opens notification for group event request change
                    // after he left this group and new admin was selected by the system.

                    navigate(`/groups/${groupId}`); //redirect to group posts
                    toast({
                        title: 'Вече не сте администратор на групата',
                        description: 'След вашето напускане автоматично е бил избран нов администратор. Присъединете се отново към групата сега!',
                        status: "info",
                        duration: 10000,
                        isClosable: true,
                        position: "bottom",
                    });
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
                if (fetchRequestsAgain) {
                    setFetchRequestsAgain(false);
                }
                setIsLoading(false);
            })

    }, [groupId, currentPage, fetchRequestsAgain])


    //PAGINATION RELATED

    //When request is deleted (mark as read), requests are re-fetched
    const setRefetch = () => {
        setFetchRequestsAgain(true);
    }


    //Handler needed in Pagination component and ChangeGroupEventRequestCard component
    const handleCurrentPageChange = (currPage) => {
        setCurrentPage(currPage);
    }


    return (
        <Container maxW='80vw' mt={10} minH='80vh' display='flex' flexDirection='column'>
            {isLoading ?
                (
                    <Flex justifyContent={'center'}>
                        <Spinner size='xl' />
                    </Flex>
                )
                :
                (
                    <>
                        <Box flex='1'>
                            {groupEventChangeRequests.length > 0 ?

                                (

                                    groupEventChangeRequests.map(request => (
                                        <ChangeGroupEventRequestCard
                                            key={request._id}
                                            requestId={request._id}
                                            eventTitle={request.eventId?.title}
                                            eventStart={request.eventId?.start}
                                            requestDescription={request.description}
                                            requestedFrom={request.requestFromUser?.fullName}
                                            requestDate={request.createdAt}
                                            groupId={groupId}
                                            setRefetch={setRefetch}
                                            handleCurrentPageChange={handleCurrentPageChange}
                                        />))
                                )

                                : (<p>Все още няма заявки за промяна на събития в групата</p>)

                            }
                        </Box>
                        {pagesCount > 1 && (
                            <Box mt='auto' pt={4}>
                                <Pagination
                                    pagesCount={pagesCount}
                                    currentPage={currentPage}
                                    handleCurrentPageChange={handleCurrentPageChange}
                                />
                            </Box>)
                        }

                    </>
                )
            }

        </Container>
    )
}

export default GroupEventChangeRequests
