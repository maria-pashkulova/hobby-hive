import { FormControl, IconButton, Input, InputGroup, InputRightElement, useBreakpointValue, useToast } from "@chakra-ui/react"
import { useContext, useState } from "react";
import { FiSend } from "react-icons/fi";
import * as chatService from '../../services/chatService';
import { useNavigate, useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/authContext";


const MessageInput = ({ handleNewMessages }) => {

    const [groupId] = useOutletContext();

    const [newMessage, setNewMessage] = useState('');

    const placeholderText = useBreakpointValue({
        base: 'Съобщение...', // Empty placeholder for smaller screens
        sm: 'Напишете съобщение...', // Full placeholder for 480px screens and up
    });


    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler, socket } = useContext(AuthContext);

    const sendMessage = async () => {
        if (newMessage.trim()) {

            setNewMessage('');

            try {
                const messageSent = await chatService.sendMessage(groupId, { content: newMessage });

                socket.emit('new message', messageSent)
                //update the local state immediately
                handleNewMessages(messageSent);

            } catch (error) {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
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

        //TODO: add typing indicator logic
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevents adding a new line
            sendMessage();
        }
    };

    return (
        <FormControl>
            <InputGroup>
                <Input w='full'
                    placeholder={placeholderText}
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                ></Input>
                <InputRightElement>
                    <IconButton
                        icon={<FiSend />}
                        onClick={sendMessage}
                        variant={'ghost'}
                    />

                </InputRightElement>
            </InputGroup>
        </FormControl>


    )
}


export default MessageInput
