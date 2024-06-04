import { Modal, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Button, useDisclosure, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, Select } from "@chakra-ui/react";


import useForm from "../hooks/useForm";
import * as groupService from '../services/groupService';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../contexts/authContext";

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


const CreateGroupModal = ({ isOpen, onClose }) => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);


    //Make the form controlled
    const { formValues, onChange } = useForm({
        [FormKeys.Name]: '',
        [FormKeys.Category]: 'Кулинарство',
        [FormKeys.Location]: '',
        [FormKeys.Description]: '',
        [FormKeys.ImageUrl]: '',
    });

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        try {

            const newGroup = await groupService.createGroup(formValues);
            onClose();

        } catch (error) {

            if (error.status === 401) {
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            }
        }

    }


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Попълнете данни за групата</ModalHeader>
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

                        </ModalBody>

                        <ModalFooter>
                            <Button type='submit' colorScheme='blue'>Създай</Button>
                            <Button variant='ghost' mr={3} onClick={onClose}>
                                Отмяна
                            </Button>
                        </ModalFooter>
                    </form>

                </ModalContent>

            </Modal >

        </>
    )
}

export default CreateGroupModal
