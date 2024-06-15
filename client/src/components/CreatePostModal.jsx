import { Button, Flex, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, Image, CloseButton, useToast, typography } from "@chakra-ui/react";
import useForm from "../hooks/useForm";
import { useContext, useRef } from "react";
import usePreviewImage from "../hooks/usePreviewImage";
import { FiImage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";

import * as postService from '../services/postService';


const FormKeys = {
    Text: 'text'
}


const CreatePostModal = ({ isOpen, onClose, groupId, handleAddNewCreatedPost }) => {

    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    //make the form controlled
    const { formValues, onChange } = useForm({
        [FormKeys.Text]: '',
    });

    const imageRef = useRef(null);

    //preview the picture which user has uploaded from file system
    const { handleImageChange, handleImageDecline, imageUrl } = usePreviewImage();

    const handleFormSubmit = async (e) => {
        e.preventDefault();


        //TODO - add loading state of the button just like in UpdateUserProfile.jsx
        //due to slower request handling because of cloudinary image upload
        try {
            const newPost = await postService.createPost(groupId, {
                ...formValues,
                img: imageUrl
            });

            handleAddNewCreatedPost(newPost);
            onClose();
            toast({
                title: "Успешна публикация!",
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
                console.log(error);
            }
        }


    }
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Създаване на публикация</ModalHeader>
                    <ModalCloseButton />

                    <form onSubmit={handleFormSubmit}>
                        <ModalBody pb={6}>

                            <FormControl>
                                <Textarea
                                    placeholder='Напишете нещо за групово събитие...'
                                    name={[FormKeys.Text]}
                                    value={formValues[FormKeys.Text]}
                                    onChange={onChange}
                                />
                                <Text
                                    fontSize='xs'
                                    fontWeight='bold'
                                    textAlign='right'
                                    margin={1}
                                    color="gray.700"
                                >
                                    700/700
                                </Text>
                            </FormControl>
                            <FormControl>
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

                        </ModalBody>

                        <ModalFooter>
                            <Button type='submit' mr={3} colorScheme='blue'>Публикуване</Button>
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

export default CreatePostModal;
