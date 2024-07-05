import React, { useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';
import { Button, CloseButton, Flex, FormControl, FormLabel, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spinner, useToast } from '@chakra-ui/react';
import useForm from '../../hooks/useForm';
import useFetchCategoriesAndLocations from '../../hooks/useFetchCategoriesAndLocations';
import usePreviewImage from '../../hooks/usePreviewImage';
import { FiImage } from 'react-icons/fi';

import * as groupService from '../../services/groupService';
import CreateMoreTagsInput from './CreateMoreTagsInput';

const FormKeys = {
    Name: 'name',
    Category: 'category',
    Location: 'location',
    Description: 'description'
}

const UpdateGroupModal = ({ isOpen, onClose, groupIdToUpdate, name, category, location, description, activityTags, groupImg, handleUpdateGroupDetails }) => {

    const { logoutHandler } = useContext(AuthContext);

    //Make the form controlled
    //uploaded group image and new activity tags are managed separately

    const { formValues, onChange, resetForm } = useForm({
        [FormKeys.Name]: name,
        [FormKeys.Category]: category,
        [FormKeys.Location]: location,
        [FormKeys.Description]: description,
    });

    const [currentImg, setCurrentImg] = useState(groupImg);

    const [addedActivityTags, setAddedActivityTags] = useState([]);
    const handleAddNewTags = (newTags) => {
        const newTagValues = newTags.map(tag => tag.value);
        setAddedActivityTags(newTagValues);
    }

    //fetch categories and locations from db
    const { categoryOptions, locationOptions, loadingCategoriesAndLocations } = useFetchCategoriesAndLocations(resetForm, onClose);
    //preview the picture which user has uploaded from file system
    const { imageUrl, handleImageChange, handleImageDecline } = usePreviewImage();
    const imageRef = useRef(null);

    const [loadingGroupUpdate, setLoadingGroupUpdate] = useState(false);

    const toast = useToast();
    const navigate = useNavigate();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoadingGroupUpdate(true);

        //TODO: client side validation for required fields
        //(allows to skip checks for satus codes 400 from server validations (they are for postman requests only, no visual form in a client react app))
        try {
            const updatedGroup = await groupService.updateGroupDetails(groupIdToUpdate, {
                ...formValues,
                addedActivityTags,
                newImg: imageUrl,
                currImg: currentImg
            });

            //Update edited group details in the parent state
            handleUpdateGroupDetails(updatedGroup);

            onClose();
            toast({
                title: "Успешна редакция!",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

        } catch (error) {

            if (error.status === 401) {
                logoutHandler();
                navigate('/login');
            } else if (error.status === 403) {
                toast({
                    title: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            } else {
                //case изключвам си сървъра - грешка при свързването със сървъра
                toast({
                    title: 'Възникна грешка при свързване!',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });

            }

        }
        finally {
            setLoadingGroupUpdate(false);
        }
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent
                    maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
                >
                    <ModalHeader>Редактиране на данните за групата</ModalHeader>
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
                                    <FormLabel>Тагове за груповите дейности</FormLabel>

                                    <CreateMoreTagsInput
                                        handleAddNewTags={handleAddNewTags}
                                        existingTags={activityTags}
                                    />

                                </FormControl>

                                <FormControl mt={4}>
                                    <FormLabel mb={4}>Променете снимката на групата</FormLabel>
                                    <Input
                                        type='file'
                                        hidden
                                        ref={imageRef}
                                        onChange={(e) => {
                                            handleImageChange(e);
                                            if (currentImg) {
                                                setCurrentImg('');
                                            }
                                        }} />
                                    <FiImage
                                        style={{
                                            marginLeft: '5px',
                                            cursor: 'pointer'
                                        }}
                                        size={20}
                                        onClick={() => imageRef.current.click()}

                                    />

                                </FormControl>

                                {(imageUrl || currentImg) && (
                                    <Flex my={7} w='full' position='relative' justifyContent='center'>
                                        <Image src={imageUrl || currentImg} alt='Selected image' />
                                        <CloseButton
                                            onClick={() => {
                                                if (imageUrl) {
                                                    handleImageDecline();
                                                } else {
                                                    setCurrentImg('');
                                                }
                                            }}
                                            bg='gray.200'
                                            position='absolute'
                                            top={2}
                                            right={2}
                                        />
                                    </Flex>
                                )}

                            </ModalBody>

                            <ModalFooter>
                                <Button
                                    type='submit'
                                    mr={3}
                                    colorScheme='blue'
                                    isLoading={loadingGroupUpdate}
                                    loadingText='Запис...'
                                >
                                    Запис
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

export default UpdateGroupModal;
