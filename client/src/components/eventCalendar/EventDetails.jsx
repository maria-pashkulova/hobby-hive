import { Avatar, AvatarGroup, Badge, Box, Circle, Flex, HStack, Icon, IconButton, Tag, Text, Tooltip, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import React from 'react'
import { FiCalendar, FiUsers, FiMapPin } from "react-icons/fi";
import { formatEventTime } from '../../utils/formatEventDisplay';
import EventButtons from './EventButtons';
import MembersGoingModal from './MembersGoingModal';
import { checkIsFutureEvent } from '../../utils/checkEventData';
import { Link } from 'react-router-dom';

const EventDetails = ({ event, isCurrUserAttending, groupAdmin, groupRegionCity, groupActivityTags, existingEvents, handleAddMemberGoing, handleRemoveMemberGoing, handleRemoveEvent, handleUpdateEvent, isMyCalendar }) => {

    //Get event data for current event and pass it to child components as prop
    //in order to populate update event modal instead of fetching event details again

    //activityTags ->  for current event
    const { _id, title, color, start, end, description, specificLocation, activityTags, membersGoing, groupId, _ownerId } = event;


    const membersGoingModal = useDisclosure();
    const goToGroupTooltipPlacement = useBreakpointValue({ base: 'right-start', md: 'bottom-end' });

    return (
        <Flex
            borderRadius='20px'
            bg={'gray.100'}
            direction='column'>
            <Box p='20px'>
                <Flex
                    w='100%'
                    mb='10px'
                    justifyContent={'space-between'}>
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
                            eventOwner={_ownerId}
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
                    mb='auto'>
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
                        <Tooltip label='Прегледай груповия календар' placement={goToGroupTooltipPlacement}>
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
                        eventOwner={_ownerId}
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
        </Flex >
    );

}

export default EventDetails
