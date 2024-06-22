import { Modal, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Button, useDisclosure, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, Select, useToast, Flex, CloseButton, Image, Tooltip } from "@chakra-ui/react";
import Loading from '../Loading';

import useForm from "../../hooks/useForm";
import * as groupService from '../../services/groupService';
import * as userService from '../../services/userService';

import { useNavigate } from "react-router-dom";
import { useContext, useRef, useState } from "react";
import AuthContext from "../../contexts/authContext";
import UserListItem from "../UserListItem";
import UserBadgeItem from "../UserBadgeItem";
import usePreviewImage from "../../hooks/usePreviewImage";
import { FiImage } from "react-icons/fi";

const FormKeys = {
    Name: 'name',
    Category: 'category',
    Location: 'location',
    Description: 'description',
    ImageUrl: 'imageUrl'
}


//TODO - fetch from DB + loading indicator render
const categoryOptions = [

    { label: 'Кулинарство', value: 'Кулинарство' },

    { label: 'Спорт', value: 'Спорт' },

    { label: 'Изкуство', value: 'Изкуство' }

];

//TODO - fetch from DB + loading indicator render
const locationOptions = [

    { label: 'София', value: 'София' },

    { label: 'Пловдив', value: 'Пловдив' },

    { label: 'Варна', value: 'Варна' }

];


const CreateGroupModal = ({ isOpen, onClose, handleAddNewCreatedGroup }) => {

    const { logoutHandler } = useContext(AuthContext);

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    //preview the picture which user has uploaded from file system
    const { handleImageChange, handleImageDecline, imageUrl } = usePreviewImage();
    const imageRef = useRef(null);

    //Make the form controlled; 
    //uploaded group image and selected members are managed separately

    const { formValues, onChange } = useForm({
        [FormKeys.Name]: '',
        [FormKeys.Category]: 'Кулинарство',
        [FormKeys.Location]: 'София',
        [FormKeys.Description]: '',
    });


    const [loadingSearchedUsers, setLoadingSearchedUsers] = useState(false);
    const [loadingGroupCreate, setLoadingGroupCreate] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();




    const handleSearch = async (query) => {
        setSearch(query);

        //Make request when user has entered at least 3 characters 
        //(whitespace handling included)
        if (query.trim().length >= 3) {

            try {
                setLoadingSearchedUsers(true);

                const users = await userService.searchUser(query);
                setSearchResult(users);

            } catch (error) {

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else {
                    toast({
                        title: "Възникна грешка!",
                        description: "Не успяхме да изведем резултата от търсенето",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom-left",
                    });
                }

            } finally {
                setLoadingSearchedUsers(false);
            }
        } else if (query.trim() === '') {
            setSearchResult([]);
        }

    };

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

            const newGroup = await groupService.createGroup({
                ...formValues,
                imageUrl,
                members: selectedUsers
            });
            handleAddNewCreatedGroup(newGroup);
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
                            <FormControl mt={4}>
                                <FormLabel>Прикачете снимка на групата</FormLabel>
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
                                <Flex mt={5} w='full' position='relative'>
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

                            <FormControl mt={4}>
                                <FormLabel>Добавяне на членове</FormLabel>
                                <Input
                                    placeholder='Потърсете потребители...'
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />

                            </FormControl>
                            {/*  selected users */}
                            <Flex gap={2} py={2} flexWrap={"wrap"}>
                                {selectedUsers.map((user) => (
                                    <UserBadgeItem
                                        key={user._id}
                                        user={user}
                                        handleRemoveUser={() => handleRemoveUser(user)}
                                    />
                                ))}

                            </Flex>

                            {/* render searched users */}
                            {loadingSearchedUsers ? <Loading /> : (
                                searchResult?.map((user) => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => handleSelectUser(user)}
                                    />

                                ))
                            )}

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
                    </form>

                </ModalContent>

            </Modal >

        </>
    )
}

export default CreateGroupModal
