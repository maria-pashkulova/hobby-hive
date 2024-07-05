import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea, useToast } from "@chakra-ui/react"
import SearchLocation from "./SearchLocation";
import { useContext, useState } from "react";
import useForm from "../hooks/useForm";

import * as eventService from '../services/eventService';
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";

import Select from 'react-select';


const FormKeys = {
    Name: 'name',
    Description: 'description',
    Location: 'specificLocation',
    Time: 'time'
}

//use group id in the url for fetch request
const CreateEventModal = ({ isOpen, onClose, groupId, activityTags }) => {

    const tagsOptions = activityTags.map(tag => ({ label: tag, value: tag }));

    //Make form controlled
    //selected location and tags are managed separately
    const { formValues, onChange, resetForm } = useForm({
        [FormKeys.Name]: '',
        [FormKeys.Description]: '',
        [FormKeys.Time]: '',
    });
    const [selectedLocation, setSelectedLocation] = useState({});
    const [selectedTags, setSelectedTags] = useState([]);

    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const handleSelectLocation = (location) => {
        setSelectedLocation(location);
    }

    //selectedOptions parameter holds all selected values (isMulti -true) or is null if there are no selected values
    const handleSelectedTags = (selectedOptions) => {
        const selectedTagsValues = selectedOptions.map(tag => tag.value);
        setSelectedTags(selectedTagsValues);
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();


        // Convert local date to UTC
        const dateTimeUTC = new Date(formValues.time).toISOString();
        try {
            const newEvent = await eventService.createEvent(groupId, {
                ...formValues,
                time: dateTimeUTC,
                activityTags: selectedTags,
                specificLocation: selectedLocation
            });
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


                    <form onSubmit={handleFormSubmit}>
                        <ModalBody>
                            <FormControl>
                                <FormLabel>Име</FormLabel>
                                <Input
                                    placeholder='Име на събитието'
                                    name={[FormKeys.Name]}
                                    value={formValues[FormKeys.Name]}
                                    onChange={onChange}
                                />
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Описание</FormLabel>
                                <Textarea
                                    placeholder='Описание за групово събитие...'
                                    name={[FormKeys.Description]}
                                    value={formValues[FormKeys.Description]}
                                    onChange={onChange}
                                />
                            </FormControl>
                            {/* TODO: create component for location search with open street map */}

                            <SearchLocation handleSelectLocation={handleSelectLocation} />

                            <FormControl mt={4}>
                                <FormLabel>Дата и час</FormLabel>

                                <Input
                                    type='datetime-local'
                                    name={[FormKeys.Time]}
                                    value={formValues[FormKeys.Time]}
                                    onChange={onChange}
                                />
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Опишете дейността на събитието</FormLabel>

                                <Select
                                    options={tagsOptions}
                                    onChange={handleSelectedTags}
                                    isMulti
                                    placeholder="Добавете тагове за дейността на събитието"
                                    noOptionsMessage={() => "Няма тагове за дейността на групата"}
                                />

                            </FormControl>

                        </ModalBody>



                        <ModalFooter>
                            <Button
                                type='submit'
                                mr={3}
                                colorScheme='blue'
                            >
                                Създай
                            </Button>
                            <Button variant='ghost' onClick={onClose}>
                                Отмяна
                            </Button>
                        </ModalFooter>
                    </form>

                </ModalContent>

            </Modal >

        </>
    )
}

export default CreateEventModal
