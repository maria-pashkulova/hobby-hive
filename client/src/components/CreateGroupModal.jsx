import { Modal, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Button, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, Select, useToast, Flex, CloseButton, Image, Spinner } from "@chakra-ui/react";

import * as groupService from '../services/groupService';

import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useForm from "../hooks/useForm";
import useFetchCategoriesAndLocations from "../hooks/useFetchCategoriesAndLocations";
import usePreviewImage from "../hooks/usePreviewImage";

import AuthContext from "../contexts/authContext";
import UserBadgeItem from "./UserBadgeItem";
import { FiImage } from "react-icons/fi";
import SearchUser from "./SearchUser";


const FormKeys = {
    Name: 'name',
    Category: 'category',
    Location: 'location',
    Description: 'description'
}

const CreateGroupModal = ({ isOpen, onClose, setRefetch, handleCurrentPageChange }) => {

    const { logoutHandler } = useContext(AuthContext);

    const [selectedUsers, setSelectedUsers] = useState([]);

    //Make the form controlled; 
    //uploaded group image and selected members are managed separately

    const { formValues, onChange, resetForm } = useForm({
        [FormKeys.Name]: '',
        [FormKeys.Category]: '',
        [FormKeys.Location]: '',
        [FormKeys.Description]: '',
    });

    //fetch categories and locations from db
    const { categoryOptions, locationOptions, loadingCategoriesAndLocations } = useFetchCategoriesAndLocations(resetForm, onClose, true);

    //preview the picture which user has uploaded from file system
    const { imageUrl, handleImageChange, handleImageDecline } = usePreviewImage();
    const imageRef = useRef(null);


    const [loadingGroupCreate, setLoadingGroupCreate] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();



    const handleSelectUser = (userToAdd) => {

        const isSelected = selectedUsers.some((user) => user._id === userToAdd._id)
        if (isSelected) {
            toast({
                title: "Потребителят вече е в списъка за добавяне",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            return;
        }

        setSelectedUsers((selectedUsers) => [...selectedUsers, userToAdd]);
    }

    const handleRemoveUser = (userToRemove) => {
        setSelectedUsers((selectedUsers) => selectedUsers.filter(user => user._id !== userToRemove._id));
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoadingGroupCreate(true);

        //TODO: client side validation for required fields

        try {

            await groupService.createGroup({
                ...formValues,
                imageUrl,
                members: selectedUsers
            });

            //Refresh the UI with newly created group on the first page
            setRefetch();
            handleCurrentPageChange(0);

            onClose();
            toast({
                title: "Успешно създадохте група!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

        } catch (error) {

            if (error.status === 401) {
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            } else {
                //case изключвам си сървъра - грешка при свързването със сървъра
                //възможно ли е да се хвърли грешка със статус 500 от клиента ако се прескочи UI по някакъв начин
                toast({
                    title: 'Възникна грешка при свързване!',
                    description: 'Групата не беше създадена',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        } finally {
            setLoadingGroupCreate(false);
        }

    }


    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent
                    maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
                >
                    <ModalHeader>Попълнете данни за групата</ModalHeader>
                    <ModalCloseButton />
                    {loadingCategoriesAndLocations ?
                        (<ModalBody>
                            <Flex justifyContent={'center'} my={5}>
                                <Spinner size='xl' />
                            </Flex>
                        </ModalBody>)
                        :
                        (<form onSubmit={handleFormSubmit}>
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
                                        {categoryOptions.map((option) => (
                                            <option key={option._id} value={option._id}>{option.name}</option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl mt={4}>
                                    <FormLabel>Основна локация</FormLabel>
                                    <Select name={[FormKeys.Location]} value={formValues[FormKeys.Location]} onChange={onChange}>
                                        {locationOptions.map((option) => (
                                            <option key={option._id} value={option._id}>{option.name}</option>
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
                                <FormControl mt={4}>
                                    <FormLabel mb={4}>Прикачете снимка на групата</FormLabel>
                                    <Input
                                        type='file'
                                        hidden
                                        ref={imageRef}
                                        onChange={handleImageChange} />
                                    <FiImage
                                        style={{
                                            marginLeft: '5px',
                                            cursor: 'pointer'
                                        }}
                                        size={20}
                                        onClick={() => imageRef.current.click()}

                                    />

                                </FormControl>
                                {imageUrl && (
                                    <Flex my={7} w='full' position='relative' justifyContent='center'>
                                        <Image src={imageUrl} alt='Selected image' />
                                        <CloseButton
                                            onClick={handleImageDecline}
                                            bg='gray.200'
                                            position='absolute'
                                            top={2}
                                            right={2}
                                        />
                                    </Flex>
                                )}


                                <SearchUser mt='4' handleFunction={handleSelectUser} />
                                {/*  selected users */}
                                <Flex mt={2} gap={2} py={2} flexWrap={"wrap"}>
                                    {selectedUsers.map((user) => (
                                        <UserBadgeItem
                                            key={user._id}
                                            user={user}
                                            handleRemoveUser={() => handleRemoveUser(user)}
                                        />
                                    ))}

                                </Flex>

                            </ModalBody>

                            <ModalFooter>
                                <Button
                                    type='submit'
                                    mr={3}
                                    colorScheme='blue'
                                    isLoading={loadingGroupCreate}
                                    loadingText='Създаване'
                                >
                                    Създай
                                </Button>
                                <Button variant='ghost' onClick={onClose}>
                                    Отмяна
                                </Button>
                            </ModalFooter>
                        </form>)
                    }


                </ModalContent>

            </Modal >

        </>
    )
}

export default CreateGroupModal
