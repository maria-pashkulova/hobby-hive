import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/authContext';

import { Button, FormControl, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react"

import { Form, Formik } from "formik";
import { EventKeys } from "../formKeys/formKeys";
import { eventSchema } from '../schemas/eventSchema';

import * as eventService from '../services/eventService';

import Select from 'react-select';
import SearchLocation from "./SearchLocation";
import CustomInput from "./input-fields/CustomInput";
import TextArea from "./input-fields/TextArea";
import { checkForOverlappingEvents } from "../utils/checkEventData";
import { formatDateForDatetimeLocalField } from '../utils/formatDate';


//Abstract component for event create and update functionality
const EventModal = ({ isOpen, onClose, groupId, groupRegionCity, groupActivityTags, selectedDate, handleEventsChange, existingEvents, currentEventData = null }) => {

    //groupActivity tags - used for select's options
    const tagsOptions = groupActivityTags.map(tag => ({ label: tag, value: tag }));
    const initialEventLocationName = currentEventData?.[EventKeys.SpecificLocation].name || '';
    //If event data was sent as prop, the action is update event
    const isUpdateAction = !!currentEventData;

    const toast = useToast();
    const navigate = useNavigate();
    const { userId, logoutHandler, socket } = useContext(AuthContext);


    //Controlled and validated form using Formik and Yup
    const handleFormSubmit = async (formValues, actions) => {

        const newEventStart = new Date(formValues[EventKeys.StartDateTime]);
        const newEventEnd = new Date(formValues[EventKeys.EndDateTime]);
        const newEventLocation = formValues[EventKeys.SpecificLocation];
        const newEventTitle = formValues[EventKeys.Title];

        //Check for conflicting events upon event create / update
        if (checkForOverlappingEvents(existingEvents, newEventStart, newEventEnd, newEventLocation, newEventTitle, currentEventData?._id)) {

            actions.setSubmitting(false);
            toast({
                title: "Вече съществува събитие със същото име, на същото място в зададения времеви диапазон! Променете поне името на събитието, за да бъде запазено. Дайте допълнителни детайли в описанието, ако е нужно!",
                status: "error",
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            let event;
            if (isUpdateAction) {
                event = await eventService.updateEvent(groupId, currentEventData._id, formValues);
                socket.emit('updated event', { groupAdminOrOwnerId: userId, ...event });
            } else {
                event = await eventService.createEvent(groupId, formValues);
                //notify other group members for new event
                socket.emit('new event', event);
            }

            //use handler to update local state from GroupEvents.jsx when event is created / updated
            handleEventsChange(event);
            onClose();

            toast({
                title: `Успешно ${isUpdateAction ? 'редактирахте' : 'създадохте'} събитие!`,
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
                //edge case : try to update past event before UI disabled it
                onClose();
                toast({
                    title: error.message, // message comes from server in user-friendly format
                    status: "error",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                });
            } else if (error.status === 403) {
                //Handle case : user trying to create / update event in a group but group admin removed him from group members during that time
                navigate(`/my-groups`);

                toast({
                    title: 'Не сте член на групата!',
                    description: `За да създавате и редактирате събития в групата, присъединете се отново!`,
                    status: "info",
                    duration: 10000,
                    isClosable: true,
                    position: "bottom",
                })
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

        }


    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
                minW={'50vw'}
            >
                <ModalHeader>{isUpdateAction ? 'Редактиране на събитие' : 'Попълнете данни за събитието'}</ModalHeader>
                <ModalCloseButton />

                <Formik
                    initialValues={{
                        [EventKeys.Title]: currentEventData?.[EventKeys.Title] || '',
                        [EventKeys.Color]: currentEventData?.[EventKeys.Color] || '#3788d8', //default color for color picker control on event create
                        [EventKeys.Description]: currentEventData?.[EventKeys.Description] || '',
                        [EventKeys.StartDateTime]: (currentEventData && formatDateForDatetimeLocalField(currentEventData[EventKeys.StartDateTime])) || selectedDate,
                        [EventKeys.EndDateTime]: (currentEventData && formatDateForDatetimeLocalField(currentEventData[EventKeys.EndDateTime])) || '',
                        [EventKeys.SpecificLocation]: currentEventData?.[EventKeys.SpecificLocation] || {},
                        [EventKeys.ActivityTags]: currentEventData?.[EventKeys.ActivityTags] || []
                    }}
                    validationSchema={eventSchema(groupRegionCity, isUpdateAction)}
                    onSubmit={handleFormSubmit}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form noValidate>
                            <ModalBody>
                                <CustomInput
                                    type='text'
                                    name={EventKeys.Title}
                                    placeholder='Име на събитието'
                                    label='Име'
                                />
                                <CustomInput
                                    type='color'
                                    name={EventKeys.Color}
                                    label='Изберете цвят за обозначение на събитието в календара'
                                    maxWidth='20%'
                                    mt={4}
                                />
                                <TextArea
                                    name={EventKeys.Description}
                                    placeholder='Описание за групово събитие...'
                                    label='Опишете дейността на събитието'
                                    mt={4}
                                />

                                <SearchLocation
                                    initialEventLocationName={initialEventLocationName}
                                />

                                <CustomInput
                                    type='datetime-local'
                                    name={EventKeys.StartDateTime}
                                    label='Кога започва събитието'
                                    mt={4}
                                />

                                <CustomInput
                                    type='datetime-local'
                                    name={EventKeys.EndDateTime}
                                    label='Кога приключва събитието'
                                    mt={4}
                                />

                                <FormControl mt={4}>
                                    <FormLabel>Тагове за дейността на събитието</FormLabel>
                                    {/* onChange - selectedOptions parameter holds all selected values (isMulti -true) in format [{ label: string, value: string },...]
                                            or is empty array if there are no selected values */}
                                    <Select
                                        options={tagsOptions}
                                        onChange={(selectedOptions) => setFieldValue(EventKeys.ActivityTags, selectedOptions.map(tag => tag.value))}
                                        value={values[EventKeys.ActivityTags].map(tag => ({ label: tag, value: tag }))} // Pre-select the existing tags for current event (update event) / [] (create event or update event without added tags upon creation)
                                        isMulti
                                        placeholder="Категоризирайте събитието за повече детайли"
                                        noOptionsMessage={() => "Администраторът на групата не е създал (повече) тагове"}
                                        closeMenuOnSelect={false}
                                    />

                                </FormControl>

                            </ModalBody>

                            <ModalFooter>
                                <Button
                                    type='submit'
                                    mr={3}
                                    colorScheme='blue'
                                    isLoading={isSubmitting}
                                    loadingText={isUpdateAction ? 'Запис...' : 'Създаване'}
                                >
                                    {isUpdateAction ? 'Запис' : 'Създай'}
                                </Button>
                                <Button variant='ghost' onClick={onClose}>
                                    Отмяна
                                </Button>
                            </ModalFooter>

                        </Form>
                    )}

                </Formik >

            </ModalContent>

        </Modal >
    )
}

export default EventModal
