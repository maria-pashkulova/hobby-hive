import { Heading } from '@chakra-ui/react'
import React from 'react'
import MyCalendar from '../components/MyCalendar'

const MyCalendarPage = () => {
    return (
        <>
            <Heading my='6' size='lg'>Събития, за които сте отбелязали присъствие</Heading>
            <MyCalendar />
        </>
    )
}

export default MyCalendarPage
