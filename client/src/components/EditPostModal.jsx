import { Button, FormControl, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Textarea, Text, useToast, Input, Flex, CloseButton, Image, Spinner } from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";
import usePreviewImage from "../hooks/usePreviewImage";

import * as postService from '../services/postService';
import { FiImage } from "react-icons/fi";

const MAX_CHAR = 500;

const EditPostModal = ({ postIdToUpdate, changeMyPostsOnDbUpdate, groupId, isOpen, onClose }) => {

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
        setLoadingUpdate(true);

        try {
            const editedPost = await postService.editPost(groupId, postIdToUpdate, {
                text: postText,
                newImg: imageUrl,
                currImg: currentImg
            });

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
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
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

        } finally {
            setLoadingUpdate(false);
        }

    }

    useEffect(() => {
        //TODO use getById from postService for post data population instead of getting it from state 
        //which is the approach i use on update user
        postService.getById(groupId, postIdToUpdate)
            .then((currPost) => {
                setPostText(currPost.text);
                setRemainingChar(MAX_CHAR - currPost.text.length);
                setCurrentImg(currPost.img);
            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //case изключвам си сървъра - грешка при свързването със сървъра
                    toast({
                        title: 'Възникна грешка при свързване!',
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
            <ModalContent>
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
                                    name='text'
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
                                <Flex mt={5} w='full' position='relative'>
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

export default EditPostModal;
