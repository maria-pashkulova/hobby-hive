import { Button, Flex, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, Image, CloseButton, useToast, Box } from "@chakra-ui/react";
import { useContext, useRef, useState } from "react";
import usePreviewImage from "../../hooks/usePreviewImage";
import { FiImage } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/authContext";

import * as postService from '../../services/postService';
import checkForRequiredFields from "../../utils/checkPostData";

import { PostKeys } from "../../formKeys/formKeys";
import { MAX_CHAR } from "../../constants/resource-constants";


const CreatePostModal = ({ isOpen, onClose, groupId, handleAddNewCreatedPost }) => {


    const [postText, setPostText] = useState('');
    const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
    const [loading, setLoading] = useState(false);

    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler, socket } = useContext(AuthContext);
    const imageRef = useRef(null);

    //preview the picture which user has uploaded from file system
    const { handleImageChange, handleImageDecline, imageUrl } = usePreviewImage();

    const [error, setError] = useState('');

    //HANDLERS

    //make the text field controlled - not with my hook useForm because of additional logic
    const handleTextChange = (e) => {
        const inputText = e.target.value;

        if (inputText.length > MAX_CHAR) {
            const truncatedText = inputText.slice(0, MAX_CHAR);
            setPostText(truncatedText);
            setRemainingChar(0);
        } else {
            setPostText(inputText);
            setRemainingChar(MAX_CHAR - inputText.length);
        }
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const postInputData = {
            text: postText,
            img: imageUrl
        }

        //Check for required fields before performing request
        const error = checkForRequiredFields(postInputData, ['text', 'img']);
        if (error) {
            setError(error);
            return;
        }

        //loading state of the button just like in UpdateUserProfile.jsx
        //due to slower request handling because of cloudinary image upload
        try {
            setLoading(true)

            const newPost = await postService.createPost(groupId, postInputData);

            //add new post to state to other users (not necesserily members - just users viewing group posts) (real time communication)
            //no notifications -> so new post object is not needed by the socket server
            //send only groupId of the group the new post is created in.
            socket?.emit('new group post created', (newPost.groupId));

            //add new post to local state for the current user
            handleAddNewCreatedPost();

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
                logoutHandler(); //invalid or missing token
                navigate('/login');
            } else {
                //handle case : error connecting with server or other possible server errors
                toast({
                    title: 'Нещо се обърка! Опитайте по-късно!',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        } finally {
            setLoading(false)
        }


    }

    return (

        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent
                    maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
                >
                    <ModalHeader>Създаване на публикация</ModalHeader>
                    <ModalCloseButton />

                    <form onSubmit={handleFormSubmit}>
                        <ModalBody pb={6}>

                            <FormControl>
                                <Textarea
                                    placeholder='Напишете нещо за групово събитие...'
                                    name={PostKeys.Text}
                                    value={postText}
                                    onChange={handleTextChange}
                                />
                                <Text
                                    fontSize='xs'
                                    fontWeight='bold'
                                    textAlign='right'
                                    margin={1}
                                    color="gray.700"
                                >
                                    {remainingChar}/{MAX_CHAR}
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

                            {/* Show required fields error message */}
                            {error &&
                                <Box
                                    mt={4}
                                    color='red'
                                >
                                    {error}
                                </Box>
                            }

                        </ModalBody>

                        <ModalFooter>
                            <Button
                                type='submit'
                                mr={3} colorScheme='blue'
                                isLoading={loading}
                                loadingText='Публикуване'
                            >
                                Публикуване
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

export default CreatePostModal;
