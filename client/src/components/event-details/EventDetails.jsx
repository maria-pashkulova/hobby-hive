import { Avatar, AvatarGroup, Badge, Box, Circle, Flex, HStack, Icon, IconButton, Tag, Text, Tooltip, useBreakpointValue, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useContext, useState } from 'react'
import { FiCalendar, FiUsers, FiMapPin } from "react-icons/fi";
import { SiGooglecalendar } from "react-icons/si";
import { formatEventTime } from '../../utils/formatEventDisplay';
import EventButtons from './EventButtons';
import MembersGoingModal from './MembersGoingModal';
import { checkIsEventEditable, checkIsFutureEvent } from '../../utils/checkEventData';
import { Link, useNavigate } from 'react-router-dom';
import { addToCalendar } from '../../services/googleCalendarService';
import ConflictModal from '../common/ConflictModal';
import AuthContext from '../../contexts/authContext';

const EventDetails = ({ event, isCurrUserAttending, groupAdmin, groupRegionCity, groupActivityTags, existingEvents, handleAddMemberGoing, handleRemoveMemberGoing, handleRemoveEvent, handleUpdateEvent, isMyCalendar }) => {

    //Get event data for current event and pass it to child components as prop
    //in order to populate update event modal instead of fetching event details again

    //activityTags ->  for current event
    const { _id, title, color, start, end, description, specificLocation, activityTags, membersGoing, groupId, _ownerId } = event;
    const [conflictEvents, setConflictEvents] = useState([]);
    const [isSendToGoogleCalendarLoading, setIsSendToGoogleCalendarLoading] = useState(false);

    const membersGoingModal = useDisclosure();
    const conflictEventsModal = useDisclosure();

    const tooltipPlacement = useBreakpointValue({ base: 'right-start', md: 'bottom-end' });
    const toast = useToast();
    const navigate = useNavigate();
    const { userId, logoutHandler } = useContext(AuthContext);


    const handleSendToGoogleCalendar = async () => {
        try {
            setIsSendToGoogleCalendarLoading(true);
            const response = await addToCalendar(event);

            toast({
                title: 'Успешно актуализирахте своя Google календар!',
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

            if (response.conflict) {
                conflictEventsModal.onOpen();
                setConflictEvents(response.overlappingEvents);
            }


        } catch (error) {

            if (error.status === 401) {
                logoutHandler(); //invalid or missing token 
                navigate('/login');
            } else if ((error.status === 403 || error.status === 400) && error.message) {
                //Custom errors handling
                if (error.status === 403) {
                    navigate('/my-calendar');
                }
                toast({
                    // title: 'Позволете достъп до календара си!',
                    description: error.message,
                    status: "info",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
            } else if (error.error === 'invalid_grant') {
                //Google calendar api errors handling
                navigate('/my-calendar');
                toast({
                    title: 'Позволете достъп до календара си отново!',
                    description: 'От съображения за сигурност се изисква повторното Ви потвърждение за достъп до Вашия Google календар!',
                    status: "info",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
            } else if (error.statusText === 'Forbidden') {
                //Google calendar api errors handling
                toast({
                    title: 'Изтрили сте събитието от Хоби Кошер и сте го премахнали перманентно от Кошче!',
                    description: 'За съжаление, събитието не може да бъде добавено към Вашия календар. Опитайте по-късно.',
                    status: "info",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
            } else {
                //Handle other possible errors
                toast({
                    title: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        } finally {
            setIsSendToGoogleCalendarLoading(false);
        }
    }

    return (
        <Flex
            borderRadius='20px'
            bg={'gray.100'}
            direction='column'>
            <Box p='20px'>
                <Flex
                    w='100%'
                    mb={2}
                    justifyContent={'space-between'}
                >
                    <Flex
                        gap={2}
                        alignItems={'center'}
                    >
                        <Circle size='20px' bg={color} />
                        <Text fontWeight='600'
                            color={'gray.800'}
                            fontSize='2xl'>
                            {title}
                        </Text>
                    </Flex>

                    {/* Event buttons for larger screens */}
                    <Flex
                        display={{ base: 'none', md: 'flex' }}
                    >
                        <EventButtons
                            isCurrUserAttending={isCurrUserAttending}
                            groupId={groupId}
                            eventId={_id}
                            eventTitle={title}
                            eventOwner={_ownerId._id} //event owner is populated to get its name and display it
                            groupAdmin={groupAdmin}
                            groupRegionCity={groupRegionCity}
                            groupActivityTags={groupActivityTags}
                            existingEvents={existingEvents}
                            handleAddMemberGoing={handleAddMemberGoing}
                            handleRemoveMemberGoing={handleRemoveMemberGoing}
                            handleRemoveEvent={handleRemoveEvent}
                            handleUpdateEvent={handleUpdateEvent}
                            isMyCalendar={isMyCalendar}
                            isFutureEvent={checkIsFutureEvent(start)}
                            isEditableEvent={checkIsEventEditable(start)}
                            currentEventDataForUpdateModal={event}
                        />
                    </Flex>
                </Flex>

                <HStack wrap='wrap' spacing='3'>
                    {activityTags?.map((tag) => (
                        <Tag key={tag} variant='outline'>
                            {tag}
                        </Tag>
                    ))}
                </HStack>
                {userId !== _ownerId._id &&
                    <Badge mt={3} p={1} fontSize='0.7em' colorScheme='blue'>
                        Предложено от: {_ownerId.fullName}
                    </Badge>
                }

            </Box >
            <Flex
                w='100%'
                p='20px'
                height='100%'
                direction='column'
                gap={8}
            >
                <Text
                    fontSize='sm'
                    color='gray.500'
                    lineHeight='24px'
                    pe='40px'
                    fontWeight='500'
                    mb='auto'
                    whiteSpace="pre-wrap" // display new lines if any
                >
                    {description}
                </Text>
                {/* event time, location and members going, go to group calendar */}
                <Flex
                    flexDirection={{ base: 'column', md: 'row' }}
                    gap={{ base: '15px', md: '25px' }}
                    alignItems={{ base: 'flex-start', md: 'center' }}
                >
                    <Flex>
                        <Icon
                            as={FiCalendar}
                            w='20px' h='20px' me='6px' color='green.400' />
                        <Text
                            fontSize='sm' my='auto' fontWeight='500'>
                            {formatEventTime(start, end)}
                        </Text>
                    </Flex>
                    <Flex>
                        <Icon
                            as={FiMapPin}
                            w='20px'
                            h='20px'
                            me='6px'
                            color='red.500'
                        />
                        <Text
                            fontSize='sm' my='auto' fontWeight='500'>
                            {specificLocation.name}
                        </Text>
                    </Flex>
                    {/*  Присъстващи:  */}
                    {membersGoing.length > 0 ?
                        <Box>
                            <AvatarGroup
                                size='sm'
                                max={4}
                                cursor='pointer'
                            >
                                {membersGoing.map((member) => (
                                    <Avatar
                                        key={member._id}
                                        name={member.fullName}
                                        src={member.profilePic}
                                        onClick={membersGoingModal.onOpen}
                                    />
                                ))}
                            </AvatarGroup>
                        </Box>

                        : (<Badge ml='1' p={1} fontSize='0.8em' colorScheme='red'>
                            0 присъстващи
                        </Badge>)
                    }

                    {/* My calendar page - go to group button */}
                    {isMyCalendar &&
                        <Tooltip label='Прегледай груповия календар' placement={tooltipPlacement}>
                            <IconButton
                                icon={<FiUsers />}
                                fontSize='1em'
                                as={Link}
                                to={`/groups/${groupId}/events`}
                                state={{
                                    eventStart: start
                                }}
                            />
                        </Tooltip>
                    }

                    <Tooltip label='Добави / Презапиши в Google календар' placement={tooltipPlacement}>
                        <IconButton
                            icon={<SiGooglecalendar />}
                            fontSize='1.5em'
                            isDisabled={!checkIsFutureEvent(start)}
                            onClick={handleSendToGoogleCalendar}
                            isLoading={isSendToGoogleCalendarLoading}
                        />
                    </Tooltip>

                </Flex>

                {/* Event buttons for smaller screens */}
                <Flex
                    display={{ base: 'flex', md: 'none' }}
                >
                    <EventButtons
                        isCurrUserAttending={isCurrUserAttending}
                        groupId={groupId}
                        eventId={_id}
                        eventTitle={title}
                        eventOwner={_ownerId._id} //event owner is populated to get its name and display it
                        groupAdmin={groupAdmin}
                        groupRegionCity={groupRegionCity}
                        groupActivityTags={groupActivityTags}
                        existingEvents={existingEvents}
                        handleAddMemberGoing={handleAddMemberGoing}
                        handleRemoveMemberGoing={handleRemoveMemberGoing}
                        handleRemoveEvent={handleRemoveEvent}
                        handleUpdateEvent={handleUpdateEvent}
                        isMyCalendar={isMyCalendar}
                        isFutureEvent={checkIsFutureEvent(start)}
                        isEditableEvent={checkIsEventEditable(start)}
                        currentEventDataForUpdateModal={event}
                    />
                </Flex>
            </Flex>

            {/* display member going to an event in a separate modal */}
            {membersGoingModal.isOpen && <MembersGoingModal
                isOpen={membersGoingModal.isOpen}
                onClose={membersGoingModal.onClose}
                membersGoing={membersGoing}
            />}

            {conflictEventsModal.isOpen && <ConflictModal
                isOpen={conflictEventsModal.isOpen}
                onClose={conflictEventsModal.onClose}
                conflictHeading={'Припокриващи се събития!'}
                conflictDescription={'Отбелязали сте други събития по същото време в Google календара си. Уверете се, че можете да присъствате на събитието от Хоби Кошер!'}
                conflictEvents={conflictEvents}
                isGoogleCalendarConflict={true}
            />
            }
        </Flex >
    );

}

export default EventDetails
