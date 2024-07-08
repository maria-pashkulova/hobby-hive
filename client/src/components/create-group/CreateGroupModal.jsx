import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import { FiImage } from "react-icons/fi";

import { Modal, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Button, ModalCloseButton, ModalBody, FormControl, FormLabel, Input, useToast, Flex, CloseButton, Image, Spinner } from "@chakra-ui/react";

import { Form, Formik } from "formik";
import { GroupKeys } from "../../formKeys/formKeys";
import { groupSchema } from "../../schemas/groupSchema";

import * as groupService from '../../services/groupService';

import useFetchCategoriesAndLocations from "../../hooks/useFetchCategoriesAndLocations";
import usePreviewImage from "../../hooks/usePreviewImage";


import CustomInput from "../input-fields/CustomInput";
import CustomSelect from "../input-fields/CustomSelect";
import TextArea from "../input-fields/TextArea";
import UserBadgeItem from "../UserBadgeItem";
import SearchUser from "../SearchUser";
import CreateTagsInput from "./CreateTagsInput";



const CreateGroupModal = ({ isOpen, onClose, setRefetch, handleCurrentPageChange }) => {

    const [activityTags, setActivityTags] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    //fetch categories and locations from db
    const { categoryOptions, locationOptions, loadingCategoriesAndLocations } = useFetchCategoriesAndLocations(onClose);

    //preview the picture which user has uploaded from file system
    const { imageUrl, handleImageChange, handleImageDecline } = usePreviewImage();
    const imageRef = useRef(null);

    const handleSetNewTags = (newTags) => {
        const newTagValues = newTags.map(tag => tag.value);
        setActivityTags(newTagValues);
    }

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

    //Controlled and validated form using Formik and Yup
    //Uploaded group image, selected members and created activity tags are managed separately

    const handleFormSubmit = async (formValues) => {
        try {

            await groupService.createGroup({
                ...formValues,
                imageUrl,
                members: selectedUsers,
                activityTags
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

            //invalid or missing token
            if (error.status === 401) {
                logoutHandler();
                navigate('/login');
            } else {
                //грешка при свързването със сървъра
                toast({
                    title: 'Възникна грешка при свързване!',
                    description: 'Групата не беше създадена',
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
                    <ModalHeader>Попълнете данни за групата</ModalHeader>
                    <ModalCloseButton />
                    {loadingCategoriesAndLocations ?
                        (<ModalBody>
                            <Flex justifyContent={'center'} my={5}>
                                <Spinner size='xl' />
                            </Flex>
                        </ModalBody>)
                        :
                        (
                            <Formik
                                initialValues={{
                                    [GroupKeys.Name]: '',
                                    [GroupKeys.Category]: '',
                                    [GroupKeys.Location]: '',
                                    [GroupKeys.Description]: ''
                                }}
                                validationSchema={groupSchema}
                                onSubmit={handleFormSubmit}

                            >
                                {({ isSubmitting }) => (
                                    <Form>
                                        <ModalBody>

                                            <CustomInput
                                                type='text'
                                                name={GroupKeys.Name}
                                                placeholder='Име на групата'
                                                label='Име'
                                            />

                                            <CustomSelect
                                                name={GroupKeys.Category}
                                                placeholder='Изберете категория хоби дейност'
                                                label='Категория занимания'
                                                mt={4}
                                            >
                                                {categoryOptions.map((option) => (
                                                    <option key={option._id} value={option._id}>{option.name}</option>
                                                ))}

                                            </CustomSelect >

                                            <CustomSelect
                                                name={GroupKeys.Location}
                                                placeholder='Изберете основна локация на групата'
                                                label='Основна локация'
                                                mt={4}
                                            >
                                                {locationOptions.map((option) => (
                                                    <option key={option._id} value={option._id}>{option.name}</option>
                                                ))}

                                            </CustomSelect >

                                            <TextArea
                                                name={GroupKeys.Description}
                                                placeholder='Описание'
                                                label='Описание'
                                                mt={4}
                                            />

                                            <FormControl mt={4}>
                                                <FormLabel>Тагове за груповите дейности</FormLabel>
                                                <CreateTagsInput handleSetNewTags={handleSetNewTags} />
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
                                                isLoading={isSubmitting}
                                                loadingText='Създаване'
                                            >
                                                Създай
                                            </Button>
                                            <Button variant='ghost' onClick={onClose}>
                                                Отмяна
                                            </Button>
                                        </ModalFooter>
                                    </Form>)}

                            </Formik>)
                    }


                </ModalContent>

            </Modal >

        </>
    )
}

export default CreateGroupModal
