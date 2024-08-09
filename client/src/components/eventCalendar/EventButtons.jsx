import { Button, Flex, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, useBreakpointValue, useDisclosure, useToast } from "@chakra-ui/react"
import { BsThreeDots } from "react-icons/bs";

import * as eventService from '../../services/eventService';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../contexts/authContext";
import RequestEventChangeModal from "./RequestEventChangeModal";

//Attend / Decline attend buttons
// Event actions : update, delete, request change according to user role in a group

const EventButtons = ({ isCurrUserAttending, groupId, eventId, eventTitle, eventOwner, groupAdmin, handleAddMemberGoing, handleRemoveMemberGoing }) => {

    const navigate = useNavigate();
    const { logoutHandler, userId, fullName, email, profilePic } = useContext(AuthContext);
    const toast = useToast();

    const editEventModal = useDisclosure();
    const deleteEventModal = useDisclosure();
    const requestEventChangeModal = useDisclosure();


    // Switch between icon and text for actions button
    const menuButtonContent = useBreakpointValue({
        base: 'Действия', // Show text on smaller screens
        md: <Icon as={BsThreeDots} boxSize="1.5em" /> // Show three dots icon on larger screens
    });

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
        <>

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

                <Menu>
                    <MenuButton
                        as={menuButtonContent === 'Действия' ? Button : IconButton}
                        variant='ghost'
                        icon={menuButtonContent !== 'Действия' ? menuButtonContent : undefined} // Only pass icon prop when using icon in the button
                    >
                        {menuButtonContent === 'Действия' && menuButtonContent}  {/* Render text in button only when it's not the icon */}

                    </MenuButton>

                    <MenuList>
                        {(userId === groupAdmin || userId === eventOwner)
                            ?
                            <>
                                <MenuItem >Редактирай</MenuItem>
                                {userId === groupAdmin && <MenuItem >Изтрий</MenuItem>}
                            </>
                            :
                            <MenuItem onClick={requestEventChangeModal.onOpen}>Заяви промяна</MenuItem>
                        }
                    </MenuList>
                </Menu>
            </Flex>


            {requestEventChangeModal.isOpen && <RequestEventChangeModal
                isOpen={requestEventChangeModal.isOpen}
                onClose={requestEventChangeModal.onClose}
                eventIdForRequest={eventId}
                eventTitle={eventTitle}
            />}
        </>

    )
}

export default EventButtons
