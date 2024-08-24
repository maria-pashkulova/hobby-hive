import { Box, Flex, Heading, Tag, Text, VStack } from '@chakra-ui/react'
import React, { useContext } from 'react'
import { formatEventTime } from '../../../utils/formatEventDisplay';
import { FiUser } from "react-icons/fi";
import AuthContext from '../../../contexts/authContext';
import './EventInCalendarDateBox.css';
import isValidJsonString from '../../../utils/validateJsonString';
import { checkIsFutureEvent } from '../../../utils/checkEventData';


const EventInCalendarDateBox = ({ event }) => {

    const { title, start, end, groupId, extendedProps } = event;
    const { ownerId } = extendedProps;
    const { userId } = useContext(AuthContext);

    //Group name is shown only in My Calendar, not in particular group calendars
    //And groupId is populated in this case
    let groupName;

    //in GroupEvents groupId is a string, not object so JSON.parse will throw error
    if (isValidJsonString(groupId)) {
        const eventGroupPopulatedObj = JSON.parse(groupId);
        groupName = eventGroupPopulatedObj.name;
    }

    const isFutureEvent = checkIsFutureEvent(start);


    return (
        <VStack
            alignItems='flex-start'
            padding={1}
            fontSize={{ base: '14px', md: '16px' }}
            width={'100%'}
            opacity={isFutureEvent ? 1 : 0.5}
        >
            <Heading as={'h5'} size={'1em'}>{title}</Heading>


            <Text fontSize={'1em'}>{formatEventTime(start, end)}</Text>

            {/* show name of group the event belongs to - in My calendar only */}
            {groupName && <Text fontSize={'0.8em'}
                color={'white'}
                fontWeight={'bold'}
            >
                {groupName}
            </Text>}


            {/*show user icon if the current user is event owner */}
            {
                userId === ownerId &&
                <Box
                    mt={1}
                    alignSelf='flex-end'
                >
                    <FiUser className='user-icon' size={'1.3em'} />
                </Box>
            }





        </VStack >
    )
}

export default EventInCalendarDateBox
