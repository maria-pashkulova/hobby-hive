import { Button, Flex, Icon, IconButton, Menu, MenuButton, MenuItem, MenuList, useBreakpointValue, useDisclosure, useToast } from "@chakra-ui/react"
import { BsThreeDots } from "react-icons/bs";

import * as eventService from '../../services/eventService';
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import AuthContext from "../../contexts/authContext";
import RequestEventChangeModal from "./RequestEventChangeModal";
import DeleteEventModal from "../DeleteEventModal";
import UpdateEventModal from "../UpdateEventModal";

//Attend / Decline attend buttons
// Event actions : update, delete, request change according to user role in a group
//Future events are considered events with start date after the current date and time. 
//Today's events are considered as future or past depending on their start time compared to the current time
const EventButtons = ({ isCurrUserAttending, groupId, eventId, eventTitle, eventOwner, groupAdmin, groupRegionCity, groupActivityTags, existingEvents, handleAddMemberGoing, handleRemoveMemberGoing, handleRemoveEvent, handleUpdateEvent, isMyCalendar = false, isFutureEvent, currentEventDataForUpdateModal }) => {

    const navigate = useNavigate();
    const { logoutHandler, userId, fullName, email, profilePic } = useContext(AuthContext);
    const toast = useToast();

    const updateEventModal = useDisclosure();
    const deleteEventModal = useDisclosure();
    const requestEventChangeModal = useDisclosure();

    const [loadingChangeAttendanceStatus, setLoadingChangeAttendanceStatus] = useState(false);

    // Switch between icon and text for actions button
    const menuButtonContent = useBreakpointValue({
        base: 'Действия', // Show text on smaller screens
        md: <Icon as={BsThreeDots} boxSize="1.5em" /> // Show three dots icon on larger screens
    });

    const handleMarkAttendance = async () => {

        try {
            setLoadingChangeAttendanceStatus(true);
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
            } else if (error.status === 400) {
                //edge case : try to change attendance for past event before UI disabled it
                toast({
                    title: error.message, // message comes from server in user-friendly format
                    status: "error",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
            } else if (error.status === 403) {
                //Handle case : user trying to change attendance in a group he was removed from (outdated ui)
                navigate(`/my-groups`);
                toast({
                    title: 'Не сте член на групата!',
                    description: `Администраторът на групата Ви е премахнал. Присъдинете се отново, за да имате достъп до груповия календар и да заявявате присъствия за събития!`,
                    status: "info",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                })
            } else if (error.status === 404) {
                //handle case : concurrently manipulated event from group administrator and a group member
                //User is trying to mark attendance for an event that was deleted by admin during the time the other user was viwing event's details
                //from Group events calendar. This case is handled out-of-the-box by real-time group calendar update, but also handled here if some edge cases are possible

                //user-friendly error message comes from server
                toast({
                    title: error.message,
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });

            } else {
                //handle case : error connecting with server or server errors with other statuses
                toast({
                    title: error.message || 'Възникна грешка при свързване!',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        } finally {
            setLoadingChangeAttendanceStatus(false);
        }

    }

    const handleRevokeAttendance = async () => {
        try {
            setLoadingChangeAttendanceStatus(true);
            const revokeAttendanceMsg = await eventService.revokeAttendance(groupId, eventId);

            //isMyCalendar flag is used to differentiate GroupCalendar events and My calendar events
            if (isMyCalendar) {
                handleRemoveEvent(eventId);
            } else {
                //update members going on event state (only locally for the current user)
                //for Group events calendar only; For My calendar is not needed because the Details modal is closed after attendance revoke
                handleRemoveMemberGoing(userId)
            }

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
            } else if (error.status === 400) {
                //edge case : try to change attendance for past event before UI disabled it
                toast({
                    title: error.message, // message comes from server in user-friendly format
                    status: "error",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
            } else if (error.status === 403) {
                //Handle case : user trying to change attendance in a group he was removed from (outdated ui)
                navigate(`/my-groups`);
                toast({
                    title: 'Не сте член на групата!',
                    description: `Администраторът на групата Ви е премахнал. Присъдинете се отново, за да имате достъп до груповия календар и да заявявате присъствия за събития!`,
                    status: "info",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                })
            } else if (error.status === 404) {

                //handle case : concurrently manipulated event from group administrator and a group member
                //User is trying to revoke attendance for an event that was deleted by admin during the time the other user was viwing event's details in My Calendar page

                if (isMyCalendar) {
                    //If user is currently viewing My Calendar page, redirect him so he can see the updated group event calendar
                    navigate(`/groups/${groupId}/events`);
                }

                //user-friendly error message comes from server
                toast({
                    title: error.message,
                    status: "error",
                    duration: 6000,
                    isClosable: true,
                    position: "bottom",
                });
            } else {
                //handle case : error connecting with server or other possible server errors
                toast({
                    title: error.message || 'Възникна грешка при свързване!',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        } finally {
            setLoadingChangeAttendanceStatus(false);
        }
    }


    return (
        <>

            <Flex
                gap={2}
                flexDir={{ base: 'column', md: 'row' }}
                w={'100%'}
            >

                {/* Attendance related buttons - enabled only for future events */}
                {
                    isCurrUserAttending ?
                        (
                            //In My Calendar page only this button is shown - all events member will attend / has once attended are shown
                            <Button
                                bgColor={"red.400"}
                                onClick={handleRevokeAttendance}
                                isLoading={loadingChangeAttendanceStatus}
                                loadingText='Отмяна на присъствие...'
                                isDisabled={!isFutureEvent}
                            >
                                Отмени присъствие
                            </Button>

                        ) :
                        (
                            <Button
                                bgColor={"yellow.400"}
                                onClick={handleMarkAttendance}
                                isLoading={loadingChangeAttendanceStatus}
                                loadingText='Ще присъствам...'
                                disabled={!isFutureEvent}
                                isDisabled={!isFutureEvent}
                            >
                                Ще присъствам
                            </Button>
                        )

                }


                {/* Event actions related buttons
                    edit buttons and event change request buttons are enabled only for future events
                    delete buttons are enabled for group admin for both future and past events
                    Event actions are not possible from My Calendar page
                */}
                {!isMyCalendar &&
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
                                    <MenuItem
                                        isDisabled={!isFutureEvent}
                                        onClick={updateEventModal.onOpen}
                                    >
                                        Редактирай
                                    </MenuItem>

                                    {userId === groupAdmin &&
                                        <MenuItem
                                            onClick={deleteEventModal.onOpen}
                                        >
                                            Изтрий
                                        </MenuItem>
                                    }
                                </>
                                :
                                <MenuItem
                                    isDisabled={!isFutureEvent}
                                    onClick={requestEventChangeModal.onOpen}
                                >
                                    Заяви промяна
                                </MenuItem>
                            }

                        </MenuList>
                    </Menu>}
            </Flex >


            {
                requestEventChangeModal.isOpen && <RequestEventChangeModal
                    isOpen={requestEventChangeModal.isOpen}
                    onClose={requestEventChangeModal.onClose}
                    groupId={groupId}
                    eventIdForRequest={eventId}
                    eventTitle={eventTitle}
                />
            }

            {
                updateEventModal.isOpen && <UpdateEventModal
                    isOpen={updateEventModal.isOpen}
                    onClose={updateEventModal.onClose}
                    groupId={groupId}
                    groupRegionCity={groupRegionCity}
                    groupActivityTags={groupActivityTags}
                    handleUpdateEvent={handleUpdateEvent}
                    existingEvents={existingEvents}
                    isMyCalendar={isMyCalendar}
                    currentEventData={currentEventDataForUpdateModal}
                />
            }

            {
                deleteEventModal.isOpen && <DeleteEventModal
                    isOpen={deleteEventModal.isOpen}
                    onClose={deleteEventModal.onClose}
                    groupId={groupId}
                    eventIdToDelete={eventId}
                    updateLocalStateOnDelete={handleRemoveEvent}
                />
            }
        </>

    )
}

export default EventButtons
