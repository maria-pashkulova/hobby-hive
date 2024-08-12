import { Box, Container, Flex, Spinner, useToast } from '@chakra-ui/react'
import ChangeGroupEventRequestCard from './ChangeGroupEventRequestCard';
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom';
import AuthContext from '../contexts/authContext';

import * as changeRequestService from '../services/changeRequestService';
import Pagination from './Pagination';

const REQUESTS_PER_PAGE = 2;

const GroupEventChangeRequests = () => {
    const [groupId] = useOutletContext();
    const [groupEventChangeRequests, setGroupEventChangeRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [pagesCount, setPagesCount] = useState(0);
    const [fetchRequestsAgain, setFetchRequestsAgain] = useState(false);


    const navigate = useNavigate();
    const toast = useToast();

    const { logoutHandler } = useContext(AuthContext);

    useEffect(() => {
        changeRequestService.getGroupEventChangeRequests(groupId, {
            page: currentPage,
            limit: REQUESTS_PER_PAGE
        })
            .then(({ requests, totalPages }) => {
                setGroupEventChangeRequests(requests);
                setPagesCount(totalPages)
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
                if (fetchRequestsAgain) {
                    setFetchRequestsAgain(false);
                }
                setIsLoading(false);
            })

    }, [groupId, currentPage, fetchRequestsAgain])


    //PAGINATION RELATED

    //Handler needed in Pagination component
    const handleCurrentPageChange = (currPage) => {
        setCurrentPage(currPage);
    }

    //-----
    //Handler needed when request is deleted (mark as read)
    const handleMarkRequestAsRead = () => {
        //TODO: perform delete request for change requests

        //setFetchRequestsAgain(true); виж дали е излишно
        handleCurrentPageChange(0);
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
                                            eventTitle={request.eventId?.title}
                                            requestDescription={request.description}
                                            requestedFrom={request.requestFromUser?.fullName}
                                            requestDate={request.createdAt}
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
