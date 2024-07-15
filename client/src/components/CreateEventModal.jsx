import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";

import { Button, FormControl, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea, useToast } from "@chakra-ui/react"

import { Form, Formik } from "formik";
import { EventKeys } from "../formKeys/formKeys";
import { eventSchema } from '../schemas/eventSchema';

import * as eventService from '../services/eventService';

import Select from 'react-select';
import SearchLocation from "./SearchLocation";
import CustomInput from "./input-fields/CustomInput";
import TextArea from "./input-fields/TextArea";


const CreateEventModal = ({ isOpen, onClose, groupId, activityTags }) => {

    const tagsOptions = activityTags.map(tag => ({ label: tag, value: tag }));

    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    //Controlled and validated form using Formik and Yup
    const handleFormSubmit = async (formValues) => {

        try {
            const newEvent = await eventService.createEvent(groupId, formValues);
            onClose();
            toast({
                title: "Успешно създадохте събитие!",
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
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent
                    maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
                >
                    <ModalHeader>Попълнете данни за събитието</ModalHeader>
                    <ModalCloseButton />
                    <Formik
                        initialValues={{
                            [EventKeys.Title]: '',
                            [EventKeys.Description]: '',
                            [EventKeys.Time]: '',
                            [EventKeys.SpecificLocation]: {},
                            [EventKeys.ActivityTags]: []
                        }}
                        validationSchema={eventSchema}
                        onSubmit={handleFormSubmit}
                    >
                        {({ isSubmitting, setFieldValue }) => (
                            <Form>
                                <ModalBody>
                                    <CustomInput
                                        type='text'
                                        name={EventKeys.Title}
                                        placeholder='Име на събитието'
                                        label='Име'
                                    />

                                    <TextArea
                                        name={EventKeys.Description}
                                        placeholder='Описание за групово събитие...'
                                        label='Опишете дейността на събитието'
                                        mt={4}
                                    />

                                    <SearchLocation />

                                    <CustomInput
                                        type='datetime-local'
                                        name={EventKeys.Time}
                                        label='Дата и час'
                                        mt={4}
                                    />

                                    <FormControl mt={4}>
                                        <FormLabel>Тагове за дейността на събитието</FormLabel>
                                        {/* onChange - selectedOptions parameter holds all selected values (isMulti -true) or is empty array if there are no selected values */}
                                        <Select
                                            options={tagsOptions}
                                            onChange={(selectedOptions) => setFieldValue(EventKeys.ActivityTags, selectedOptions.map(tag => tag.value))}
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
                                        loadingText='Създаване'
                                    >
                                        Създай
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

        </>
    )
}

export default CreateEventModal;
