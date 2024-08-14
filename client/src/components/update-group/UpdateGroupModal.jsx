import { Button, CloseButton, Flex, FormControl, FormLabel, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Spinner, useToast } from '@chakra-ui/react';
import { FiImage } from 'react-icons/fi';
import AuthContext from '../../contexts/authContext';

import { useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import useFetchCategoriesAndLocations from '../../hooks/useFetchCategoriesAndLocations';
import usePreviewImage from '../../hooks/usePreviewImage';

import { Form, Formik } from "formik";
import { GroupKeys } from "../../formKeys/formKeys";
import { groupSchema } from "../../schemas/groupSchema";


import * as groupService from '../../services/groupService';
import CreateMoreTagsInput from './CreateMoreTagsInput';
import CustomInput from '../input-fields/CustomInput';
import CustomSelect from '../input-fields/CustomSelect';
import TextArea from '../input-fields/TextArea';


const UpdateGroupModal = ({ isOpen, onClose, groupIdToUpdate, name, category, location, description, activityTags, groupImg, handleUpdateGroupDetails }) => {

    //fetch categories and locations from db
    const { categoryOptions, locationOptions, loadingCategoriesAndLocations } = useFetchCategoriesAndLocations(onClose);

    const [currentImg, setCurrentImg] = useState(groupImg);
    //preview the picture which user has uploaded from file system
    const { imageUrl, handleImageChange, handleImageDecline } = usePreviewImage();
    const imageRef = useRef(null);


    const [addedActivityTags, setAddedActivityTags] = useState([]);
    const handleAddNewTags = (newTags) => {
        const newTagValues = newTags.map(tag => tag.value);
        setAddedActivityTags(newTagValues);
    }

    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);


    /*Controlled and validated form using Formik and Yup - client side validation for required fields*/

    //Uploaded group image and new activity tags are managed separately

    const handleFormSubmit = async (formValues) => {

        try {
            const updatedGroup = await groupService.updateGroupDetails(groupIdToUpdate, {
                ...formValues,
                addedActivityTags,
                newImg: imageUrl,
                currImg: currentImg
            });

            //Update updated group details in the parent state
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
                //грешка при свързването със сървъра
                toast({
                    title: 'Възникна грешка при свързване!',
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
                    <ModalHeader>Редактиране на данните за групата</ModalHeader>
                    <ModalCloseButton />

                    {loadingCategoriesAndLocations ?
                        (<ModalBody>
                            <Flex justifyContent={'center'} my={5}>
                                <Spinner size='xl' />
                            </Flex>
                        </ModalBody>)
                        :
                        (<Formik
                            initialValues={{
                                [GroupKeys.Name]: name,
                                [GroupKeys.Category]: category,
                                [GroupKeys.Location]: location,
                                [GroupKeys.Description]: description
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
                                        </CustomSelect>

                                        <CustomSelect
                                            name={GroupKeys.Location}
                                            placeholder='Изберете основна локация на групата'
                                            label='Основна локация'
                                            mt={4}
                                        >
                                            {locationOptions.map((option) => (
                                                <option key={option._id} value={option._id}>{option.name}</option>
                                            ))}
                                        </CustomSelect>

                                        <TextArea
                                            name={GroupKeys.Description}
                                            placeholder='Описание'
                                            label='Описание'
                                            mt={4}
                                        />

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
                                            isLoading={isSubmitting}
                                            loadingText='Запис...'
                                        >
                                            Запис
                                        </Button>
                                        <Button variant='ghost' onClick={onClose}>
                                            Отмяна
                                        </Button>
                                    </ModalFooter>
                                </Form>
                            )}

                        </Formik>)
                    }

                </ModalContent>

            </Modal >

        </>
    )
}

export default UpdateGroupModal;
