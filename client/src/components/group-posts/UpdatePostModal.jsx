import { Button, FormControl, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea, Text, useToast, Input, Flex, CloseButton, Image, Spinner, Box } from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import usePreviewImage from "../../hooks/usePreviewImage";
import { FiImage } from "react-icons/fi";

import * as postService from '../../services/postService';
import checkForRequiredFields from "../../utils/checkPostData";

import { PostKeys } from "../../formKeys/formKeys";
import { MAX_CHAR } from "../../constants/resource-constants";

const UpdatePostModal = ({ postIdToUpdate, changeMyPostsOnDbUpdate, groupId, isOpen, onClose }) => {

    const [postText, setPostText] = useState('');
    const [currentImg, setCurrentImg] = useState('');
    //loading докато се препопулират данните + loading при update
    const [loadingPostData, setLoadingPostData] = useState(true);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [remainingChar, setRemainingChar] = useState(MAX_CHAR);

    const toast = useToast();
    const navigate = useNavigate();


    const { logoutHandler } = useContext(AuthContext);
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

        const postEditInputData = {
            text: postText,
            newImg: imageUrl,
            currImg: currentImg
        }

        //Check for required fields before performing request
        const error = checkForRequiredFields(postEditInputData, ['text', 'newImg', 'currImg']);
        if (error) {
            setError(error);
            return;
        }

        try {
            setLoadingUpdate(true);

            const editedPost = await postService.editPost(groupId, postIdToUpdate, postEditInputData);
            //to do - send it to socket server for real-time update in group newsfeed (all group posts)

            //local state update
            changeMyPostsOnDbUpdate(editedPost);
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
                //error connecting with server
                toast({
                    title: 'Възникна грешка при свързване!',
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }

        } finally {
            setLoadingUpdate(false);
        }

    }

    useEffect(() => {
        //use getById from postService for post data population instead of getting it from state
        //for up-to-date information
        postService.getById(groupId, postIdToUpdate)
            .then((currPost) => {
                setPostText(currPost.text);
                setRemainingChar(MAX_CHAR - currPost.text.length);
                setCurrentImg(currPost.img);
            })
            .catch(error => {
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
                    onClose();
                }
            })
            .finally(() => {
                setLoadingPostData(false);
            })

    }, []);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
            >
                <ModalHeader>Редактиране на публикацията</ModalHeader>
                <ModalCloseButton />
                {loadingPostData ?
                    (
                        <ModalBody>
                            <Flex justifyContent={'center'} my={5}>
                                <Spinner size='xl' />
                            </Flex>
                        </ModalBody>)
                    :
                    (<form onSubmit={handleFormSubmit}>
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
                                <Flex mt={5} w='full' position='relative' justifyContent='center'>
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
                                isLoading={loadingUpdate}
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
        </Modal>
    )
}

export default UpdatePostModal;
