import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "./DeleteModal"
import { useContext, useState } from "react";
import AuthContext from "../contexts/authContext";
import * as eventService from '../services/eventService';




const DeleteEventModal = ({ eventIdToDelete, updateLocalStateOnDelete, groupId, isOpen, onClose }) => {


    const navigate = useNavigate();
    const { logoutHandler, socket } = useContext(AuthContext);


    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleDeleteEvent = async () => {

        setLoading(true);
        try {
            await eventService.deleteEvent(groupId, eventIdToDelete);

            //Real time update for other users currently viewing group calendar
            socket?.emit('group event deleted', { groupId, eventId: eventIdToDelete })

            //delete event from local state
            updateLocalStateOnDelete(eventIdToDelete);
            onClose();
            toast({
                title: "Успешно изтрихте събитието!",
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
                console.log(error);

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
            setLoading(false);

        }
    }

    return (
        <DeleteModal
            confirmQuestion='Сигурни ли сте, че искате да изтриете събитието от груповия календар?'
            additionalDescriptionOne='Всички заявки за промяна на събитието също ще бъдат изтрити.'
            additionalDescriptionTwo='Вашето действие ще се отрази в календарите на всички членове, отбелязали своето присъствие за събитието! Събитията ще бъдат премахнати както от календара им в Хоби Кошер, така и в техните Гугъл календари (при позволена синхронизация).'
            loading={loading}
            handleDeleteAction={handleDeleteEvent}
            isOpen={isOpen}
            onClose={onClose}
        />
    )
}

export default DeleteEventModal
