import { FormControl, Input, InputGroup, InputRightElement, useBreakpointValue, useToast } from "@chakra-ui/react"
import { useContext, useState } from "react";
import { FiSend } from "react-icons/fi";
import * as chatService from '../services/chatService';
import { useNavigate, useOutletContext } from "react-router-dom";
import AuthContext from "../contexts/authContext";


const MessageInput = ({ handleNewMessages, socket }) => {

    const [groupId] = useOutletContext();

    const [newMessage, setNewMessage] = useState('');

    const placeholderText = useBreakpointValue({
        base: 'Съобщение...', // Empty placeholder for smaller screens
        sm: 'Напишете съобщение...', // Full placeholder for 480px screens and up
    });


    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const sendMessage = async (e) => {
        if (e.key === 'Enter' && newMessage) {

            setNewMessage('');

            try {
                const messageSent = await chatService.sendMessage(groupId, { content: newMessage });

                socket.emit('new message', messageSent)
                //update the local state immediately
                handleNewMessages(messageSent);

            } catch (error) {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else {
                    toast({
                        title: error.message,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            }
        }
    }

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        //typing indicator logic

    }

    return (
        <FormControl onKeyDown={sendMessage}>
            <InputGroup>
                <Input w='full'
                    placeholder={placeholderText}
                    value={newMessage}
                    onChange={handleTyping}
                ></Input>
                <InputRightElement>
                    <FiSend />
                </InputRightElement>
            </InputGroup>
        </FormControl>


    )
}


export default MessageInput
