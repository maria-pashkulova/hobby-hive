import { Box, Flex, Heading, Text, VStack } from '@chakra-ui/react'
import React, { useContext } from 'react'
import { formatEventTime } from '../../../utils/formatEventDisplay';
import { FiUser } from "react-icons/fi";
import AuthContext from '../../../contexts/authContext';
import './EventInCalendarDateBox.css';


const EventInCalendarDateBox = ({ event }) => {

    const { title, start, end, extendedProps } = event;
    const { ownerId } = extendedProps;
    const { userId } = useContext(AuthContext);

    return (
        <VStack
            alignItems='flex-start'
            padding={1}
            fontSize={{ base: '14px', md: '16px' }}
            width={'100%'}
        >
            <Heading as={'h5'} size={'1em'}>{title}</Heading>

            <Text fontSize={'1em'}>{formatEventTime(start, end)}</Text>

            {/*show user icon if the current user is event owner */}
            {userId === ownerId &&
                <Box
                    alignSelf='flex-end'
                >
                    <FiUser className='user-icon' size={'1.3em'} />
                </Box>
            }

        </VStack>
    )
}

export default EventInCalendarDateBox
