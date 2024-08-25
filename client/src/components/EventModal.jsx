import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/authContext';

import { Button, Flex, FormControl, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useToast } from "@chakra-ui/react"

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
const EventModal = ({ isOpen, onClose, groupId, groupRegionCity, groupActivityTags, selectedDate, handleEventsChange, existingEvents, currentEventData = null, loadingEventData = false }) => {

    //groupActivity tags - used for select's options
    const tagsOptions = groupActivityTags.map(tag => ({ label: tag, value: tag }));

    // Convert the activity tags from string array to the format react-select expects -> { label: string, value: string }
    //optional chaining checks if currentEventData is null (event create modal) or it has event data (update event modal)
    //If EventModal is opened from CreateEventModal currentEventData is null -> optional chaining handles this case so error is not thrown
    //If EventModal is opened from UpdateEventModal on first render currentEventData is {}, loading is true so Formik form is not rendered, instead loading spinner is shown
    //but initialActivityTags is in component body so we should have optional chaining for the first render so we dont try to access a key in the empty object
    //that doesnt exist -> undefined.map which will throw error. When data is fetched successfully currentEventData is event object returned from server
    //const initialEventActivityTags = currentEventData?.[EventKeys.ActivityTags]?.map(tag => ({ label: tag, value: tag }));
    const initialEventLocationName = currentEventData?.[EventKeys.SpecificLocation]?.name || '';


    //If event data was sent as prop, the action is update event
    const isUpdateAction = !!currentEventData;


    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler, socket } = useContext(AuthContext);


    //Controlled and validated form using Formik and Yup
    const handleFormSubmit = async (formValues, actions) => {

        const newEventStart = new Date(formValues[EventKeys.StartDateTime]);
        const newEventEnd = new Date(formValues[EventKeys.EndDateTime]);
        const newEventLocation = formValues[EventKeys.SpecificLocation];
        const newEventTitle = formValues[EventKeys.Title];

        //Skip this check upon event update because the event being edited will be found as already existing event
        if (!isUpdateAction && checkForOverlappingEvents(existingEvents, newEventStart, newEventEnd, newEventLocation, newEventTitle)) {

            actions.setSubmitting(false);
            toast({
                title: "Вече съществува събитие по същото време и на същото място! Променете заглавието и детайлите, за да бъде запазено събитието",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            let event;
            if (isUpdateAction) {
                event = await eventService.updateEvent(groupId, currentEventData._id, formValues);

                //TODO real-time update 
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
            } else {
                //TODO: handle edge cases - error status code possible from server
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
                <ModalHeader>{isUpdateAction ? 'Редактиране на събитие' : 'Попълнете данни за събитието'}</ModalHeader>
                <ModalCloseButton />
                {loadingEventData ?
                    (
                        //show Loading spinner until event details are fetched (updateEvent)
                        //needed for setting Formik initial states with event data as well
                        <ModalBody>
                            <Flex justifyContent={'center'} my={5}>
                                <Spinner size='xl' />
                            </Flex>
                        </ModalBody>
                    )
                    : (
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
                            validationSchema={eventSchema(groupRegionCity)}
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
                    )

                }


            </ModalContent>

        </Modal >
    )
}

export default EventModal
