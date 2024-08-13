import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react"
import * as postService from '../services/postService';
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";


const DeletePostModal = ({ postIdToDelete, refetchOnDelete, groupId, isOpen, onClose }) => {

    const navigate = useNavigate();
    const { logoutHandler, socket } = useContext(AuthContext);


    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleDeletePost = async () => {

        setLoading(true);
        try {

            await postService.deletePost(groupId, postIdToDelete);

            //delete post from news feed with all posts for other currently viewing group posts
            socket?.emit('group post deleted', groupId)

            //delete post from local state
            refetchOnDelete();
            onClose();
            toast({
                title: "Успешно изтрихте публикацията!",
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
        }
        finally {
            setLoading(false)
        }

    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
            >
                <ModalHeader>Внимание!</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    Сигурни ли сте, че искате да изтриете публикацията?
                </ModalBody>

                <ModalFooter>
                    <Button
                        colorScheme='red'
                        mr={3}
                        isLoading={loading}
                        loadingText='Изтриване...'
                        onClick={handleDeletePost}>
                        Изтриване
                    </Button>
                    <Button variant='ghost' onClick={onClose}>Отмяна</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default DeletePostModal;
