import { useContext } from "react";
import AuthContext from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalContent, ModalOverlay, useToast, ModalCloseButton, Tag } from "@chakra-ui/react";
import TextArea from "../input-fields/TextArea";


import { Form, Formik } from "formik";
import { EventChangeRequestKeys } from "../../formKeys/formKeys";
import { changeEventRequestSchema } from '../../schemas/changeEventRequestSchema';

import * as changeRequestService from '../../services/changeRequestService';

const RequestEventChangeModal = ({ isOpen, onClose, groupId, eventIdForRequest, eventTitle }) => {


    const navigate = useNavigate();
    const { logoutHandler, socket } = useContext(AuthContext);

    const toast = useToast();

    const handleFormSubmit = async (formValues) => {
        try {

            const newRequest = await changeRequestService.createRequest(groupId, eventIdForRequest, formValues);

            //notify group admin for new event change request
            socket?.emit('new event change request', newRequest);

            onClose();
            toast({
                title: "Администраторът на групата получи Вашата заявка за промяна!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

        } catch (error) {
            if (error.status === 401) {
                logoutHandler();
                navigate('/login');
            } else if (error.status === 400) {
                //edge case : try to create request for past event before UI disabled it
                onClose();
                toast({
                    title: error.message, // message comes from server in user-friendly format
                    status: "error",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
            } else if (error.status === 403) {
                // case 1: user has been automatically selected to be new group admin, after the previous admin has left the group
                //and his UI has not been refreshed

                //case 2 : user has been removed by group admin while trying to create request for event change

                navigate(`/my-groups`); //redirect to another page for refresh members data upon going back to current group page

                toast({
                    title: 'Възникна грешка!',
                    description: error.message, //user-friendly message depending on case
                    status: "info",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
            } else if (error.status === 404) {
                //handle edge case : concurrently manipulated event from group administrator and a group member
                //user has opened request event change modal from My calendar, but during this time group administrator has deleted the event
                //and My Calendar page has not been refreshed (no real-time update)
                //For a particular group event calendar this case is handled out-of-the-box by real-time group calendar update when event is deleted

                navigate(`/groups/${groupId}/events`);

                //user-friendly error message comes from server
                toast({
                    title: 'Администраторът на групата, в която е било създадено събитието е изтрил събитието от груповия календар!',
                    status: "error",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
            }
            else {
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
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
            >
                <ModalHeader>Заявка за промяна на събитие</ModalHeader>
                <ModalCloseButton />
                <Formik
                    initialValues={{
                        [EventChangeRequestKeys.Description]: ''
                    }}
                    validationSchema={changeEventRequestSchema}
                    onSubmit={handleFormSubmit}
                > {({ isSubmitting }) => (
                    <Form>
                        <ModalBody>
                            <Tag size='lg'
                                variant='outline'
                                colorScheme="gray"
                                fontWeight={'bold'}
                            >
                                Име на събитие: {eventTitle}
                            </Tag>
                            <TextArea
                                name={EventChangeRequestKeys.Description}
                                placeholder='Опишете промяната в събитието, която желаете да бъде направена...'
                                label='Администраторът на групата ще получи заявката с описание:'
                                mt={4}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                type='submit'
                                mr={3}
                                colorScheme='blue'
                                isLoading={isSubmitting}
                                loadingText='Завка...'
                            >
                                Заяви
                            </Button>
                            <Button variant='ghost' onClick={onClose}>
                                Отмяна
                            </Button>
                        </ModalFooter>
                    </Form>
                )}

                </Formik>

            </ModalContent>
        </Modal>
    )
}

export default RequestEventChangeModal
