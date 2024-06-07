import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/authContext';
import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, useToast } from '@chakra-ui/react';
import useForm from '../hooks/useForm';

const FormKeys = {
    Name: 'name',
    Category: 'category',
    Location: 'location',
    Description: 'description',
    ImageUrl: 'imageUrl'
}


//TODO - fetch from DB
const categoryOptions = [

    { label: 'Кулинарство', value: 'Кулинарство' },

    { label: 'Спорт', value: 'Спорт' },

    { label: 'Изкуство', value: 'Изкуство' }

];

//TODO - fetch from DB
const locationOptions = [

    { label: 'София', value: 'София' },

    { label: 'Пловдив', value: 'Пловдив' },

    { label: 'Варна', value: 'Варна' }

];

const UpdateGroupModal = ({ isOpen, onClose }) => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);


    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();



    //Make the form controlled
    const { formValues, onChange } = useForm({
        [FormKeys.Name]: '',
        [FormKeys.Category]: 'Кулинарство',
        [FormKeys.Location]: 'София',
        [FormKeys.Description]: '',
        [FormKeys.ImageUrl]: '',
    });



    const handleFormSubmit = async (e) => {
        e.preventDefault();

        //TODO: client side validation for required fields


    }

    // TODO: populate form with the current group's data

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Редактиране на данните за групата</ModalHeader>
                    <ModalCloseButton />

                    <form onSubmit={handleFormSubmit}>
                        <ModalBody>
                            <FormControl>
                                <FormLabel>Име</FormLabel>
                                <Input
                                    placeholder='Име на групата'
                                    name={[FormKeys.Name]}
                                    value={formValues[FormKeys.Name]}
                                    onChange={onChange} />
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Категория занимания</FormLabel>
                                <Select name={[FormKeys.Category]} value={formValues[FormKeys.Category]} onChange={onChange}>
                                    {categoryOptions.map((option, index) => (
                                        <option key={index} value={option.value}>{option.label}</option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Основна локация</FormLabel>
                                <Select name={[FormKeys.Location]} value={formValues[FormKeys.Location]} onChange={onChange}>
                                    {locationOptions.map((option, index) => (
                                        <option key={index} value={option.value}>{option.label}</option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl mt={4}>
                                <FormLabel>Описание</FormLabel>
                                <Input
                                    placeholder='Описание'
                                    name={[FormKeys.Description]}
                                    value={formValues[FormKeys.Description]}
                                    onChange={onChange} />
                            </FormControl>


                            {/* TODO: upload picture functionality */}
                            <FormControl mt={4}>
                                <FormLabel>Снимка на групата</FormLabel>
                                <Input
                                    placeholder='Прикачи снимка на групата'
                                    name={[FormKeys.ImageUrl]}
                                    value={formValues[FormKeys.ImageUrl]}
                                    onChange={onChange} />
                            </FormControl>

                        </ModalBody>

                        <ModalFooter>
                            <Button type='submit' mr={3} colorScheme='blue'>Запис</Button>
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

export default UpdateGroupModal;
