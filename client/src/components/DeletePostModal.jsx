import { useToast } from "@chakra-ui/react"
import * as postService from '../services/postService';
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";
import DeleteModal from "./DeleteModal";


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
                logoutHandler(); //invalid or missing token
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
                //handle case : error connecting with server or other possible server errors
                toast({
                    title: 'Нещо се обърка! Опитайте по-късно!',
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
        <DeleteModal
            confirmQuestion='Сигурни ли сте, че искате да изтриете публикацията?'
            loading={loading}
            handleDeleteAction={handleDeletePost}
            isOpen={isOpen}
            onClose={onClose}
        />
    )
}

export default DeletePostModal;
