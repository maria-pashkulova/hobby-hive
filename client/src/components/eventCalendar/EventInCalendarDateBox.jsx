import { Heading, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import { formatEventHours } from '../../utils/formatEventDisplay';


const EventInCalendarDateBox = ({ event }) => {

    // const { title, start, end, extendedProps } = event;
    // const { specificLocation } = extendedProps;

    const { title, start, end } = event;

    return (
        <VStack
            alignItems='flex-start'
        >
            <Heading as={'h5'} size='sm'>{title}</Heading>
            <Text>{formatEventHours(start)} ч. - {formatEventHours(end)} ч.</Text>
            {/* <Text>{specificLocation}</Text> */}
        </VStack>
    )
}

export default EventInCalendarDateBox
