import { Container, Flex, Skeleton, SkeletonCircle, useToast } from "@chakra-ui/react"
import MessageInput from "../MessageInput"
import { useContext, useEffect, useState } from "react";

import * as chatService from '../../services/chatService';
import { Navigate, useNavigate, useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import './GroupChat.css';
import ScrollableChat from "./ScrollableChat";


const GroupChat = () => {
    const [groupId, isMember] = useOutletContext();
    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler, socket } = useContext(AuthContext);

    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);

    const handleNewMessages = (messageSent) => {
        setMessages((prevMessages) => [...prevMessages, messageSent])
    }

    //Get all group messages 
    useEffect(() => {

        chatService.getGroupChat(groupId)
            .then((groupMessages) => {
                //if user has access to group messages he is 100% authenticated and is a member of group
                setMessages(groupMessages);
                socket?.emit('join chat', groupId);
            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
                    navigate('/login');
                } if (error.status === 403) {
                    navigate(`/groups/${groupId}`);
                }

                else {
                    toast({
                        title: error.message,
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            })
            .finally(() => {
                setLoadingMessages(false);
            })


        // Cleanup function to run when the component unmounts
        return () => {
            socket.emit('leave group chat', groupId);
        };

    }, [groupId]);


    //Receive new message
    useEffect(() => {

        const handleMessageReceived = (newMessageReceived) => {

            setMessages((prevMessages) => [...prevMessages, newMessageReceived]);

        };

        socket?.on('message received', handleMessageReceived)


        //Cleanup the event listener on component unmount or when groupId / socket changes
        return () => {
            socket?.off('message received', handleMessageReceived);
        };
    }, [socket, groupId])



    return (
        <Container
            maxW='80vw'
            p={4}
        >

            <Flex
                flexDir={'column'}
                gap={4}
                my={4}
                height={'400px'}
                p={2}
            >

                {/* loading state */}
                {loadingMessages ? (
                    [...Array(5)].map((e, i) => (
                        <Flex
                            key={i}
                            gap={2}
                            alignItems='center'
                            p={1}
                            borderRadius='md'
                            alignSelf={i % 2 === 0 ? 'flex-start' : 'flex-end'}
                        >
                            {i % 2 === 0 && <SkeletonCircle size={7} />}
                            <Flex
                                flexDir='column'
                                gap={2}
                            >
                                <Skeleton h='8px' w='250px' />
                                <Skeleton h='8px' w='250px' />
                                <Skeleton h='8px' w='250px' />

                            </Flex>
                            {i % 2 !== 0 && <SkeletonCircle size={7} />}

                        </Flex>
                    ))
                ) : (
                    <ScrollableChat messages={messages} />
                )

                }

            </Flex>

            <MessageInput handleNewMessages={handleNewMessages} />

        </Container>
    )
}

export default GroupChat
