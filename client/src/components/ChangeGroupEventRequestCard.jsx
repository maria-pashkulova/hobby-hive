import { Card, CardBody, CardFooter, Divider, Flex, Heading, IconButton, Stack, Text, Tooltip, useToast } from "@chakra-ui/react"
import { FiCheck, FiEye } from "react-icons/fi";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from '../contexts/authContext'

import formatDate from '../utils/formatDate';
import * as changeRequestService from '../services/changeRequestService';

const ChangeGroupEventRequestCard = ({ requestId, eventTitle, requestDescription, requestedFrom, requestDate, groupId, setRefetch, handleCurrentPageChange }) => {
    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);


    const handleMarkRequestAsRead = async () => {

        try {
            await changeRequestService.deleteRequest(groupId, requestId);

            //Refresh the UI with deleted request on the first page
            setRefetch();
            handleCurrentPageChange(0);

            toast({
                title: "Успешно означихте заявката като прегледана!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

        } catch (error) {
            //invalid or missing token
            if (error.status === 401) {
                logoutHandler();
                navigate('/login');
            } else {

                //грешка при свързването със сървъра
                toast({
                    title: 'Възникна грешка при свързване!',
                    description: 'Заявката не беше означена като пегледана!',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }

    }

    //TODO: handle go to event in FullCalendar


    return (
        <Card mt={5}>
            <CardBody>
                <Stack mt='6' spacing='3'>
                    <Flex
                        flexDirection={{ base: 'column', md: 'row' }}
                        gap={5}
                        justifyContent={'space-between'}
                    >
                        <Heading as='h3' size='md'>Заявка за събитие: {eventTitle}</Heading>
                        <Flex
                            gap={2}
                        >
                            <Tooltip label='Към събитието в календара' placement="bottom-end">
                                <IconButton
                                    isRound={true}
                                    variant='solid'
                                    colorScheme='blue'
                                    aria-label='Done'
                                    fontSize='20px'
                                    icon={<FiEye />}
                                />
                            </Tooltip >
                            <Tooltip label='Отбележи като прегледано' placement="bottom-end">
                                <IconButton
                                    isRound={true}
                                    variant='solid'
                                    colorScheme='green'
                                    aria-label='Done'
                                    fontSize='20px'
                                    icon={<FiCheck />}
                                    onClick={handleMarkRequestAsRead}
                                />
                            </Tooltip >
                        </Flex>

                    </Flex>
                    <Text mt='4'>
                        <Text as="span" fontWeight="bold">Описание:</Text> {requestDescription}
                    </Text>
                </Stack>
            </CardBody>
            <Divider />
            <CardFooter
                flexDir={{ base: 'column', lg: 'row' }}
                gap={{ base: 2, lg: 0 }}
                justifyContent='space-between'
            >
                <Text color='blue.600'>
                    <Text as="span" fontWeight="bold">Заявено от:</Text> {requestedFrom}
                </Text>
                <Text color='blue.600'>
                    <Text as="span" fontWeight="bold">Заявено на:</Text> {formatDate(requestDate)}
                </Text>
            </CardFooter>
        </Card >
    )
}

export default ChangeGroupEventRequestCard;
