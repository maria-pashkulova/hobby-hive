import { Button, Flex, Icon, useToast } from "@chakra-ui/react"
import { FiMoreHorizontal } from "react-icons/fi"

import * as eventService from '../../services/eventService';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../contexts/authContext";

//Attend / Decline attend buttons
// Event actions : update, delete, request change according to user role in a group

const EventButtons = ({ isCurrUserAttending, groupId, eventId, handleAddMemberGoing, handleRemoveMemberGoing }) => {

    const navigate = useNavigate();
    const { logoutHandler, userId, fullName, email, profilePic } = useContext(AuthContext);
    const toast = useToast();


    const handleMarkAttendance = async () => {

        try {
            const markAttendanceMsg = await eventService.markAttendance(groupId, eventId);

            //update members going on event state (only locally for the current user)
            handleAddMemberGoing({
                _id: userId,
                fullName,
                email,
                profilePic
            })

            toast({
                title: markAttendanceMsg.message,
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

        } catch (error) {
            if (error.status === 401) {
                logoutHandler(); //invalid or missing token 
                navigate('/login');
            } else {
                toast({
                    title: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }

    }

    const handleRevokeAttendance = async () => {
        try {
            const revokeAttendanceMsg = await eventService.revokeAttendance(groupId, eventId);

            //update members going on event state (only locally for the current user)
            handleRemoveMemberGoing(userId)

            toast({
                title: revokeAttendanceMsg.message,
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

        } catch (error) {
            if (error.status === 401) {
                logoutHandler(); //invalid or missing token 
                navigate('/login');
            } else {
                toast({
                    title: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    }


    return (
        <Flex
            gap={2}
            flexDir={{ base: 'column', md: 'row' }}
            w={'100%'}
        >
            {
                isCurrUserAttending ?
                    (
                        <Button bgColor={"red.400"} onClick={handleRevokeAttendance}>Отмени присъствие</Button>

                    ) :
                    (
                        <Button bgColor={"yellow.400"} onClick={handleMarkAttendance}>Ще присъствам</Button>
                    )

            }
            <Button
                w='38px'
                h='38px'
                borderRadius='12px'
                me='12px'
                display={{ base: 'none', md: 'flex' }} //Show only on larger screens
            >

                <Icon
                    w='24px'
                    h='24px'
                    as={FiMoreHorizontal}
                    color={'gray.700'}
                />
            </Button>
            <Button
                borderRadius='12px'
                me='12px'
                display={{ base: 'flex', md: 'none' }} //Show only on smaller screens
            >
                Действия
            </Button>
        </Flex>
    )
}

export default EventButtons
