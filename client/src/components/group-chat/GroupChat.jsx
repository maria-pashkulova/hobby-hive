import { Container, Divider, Flex, Skeleton, SkeletonCircle, Text, useToast } from "@chakra-ui/react"
import MessageInput from "../MessageInput"
import { useContext, useEffect, useState } from "react";

import * as chatService from '../../services/chatService';
import { useNavigate, useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import './GroupChat.css';
import ScrollableChat from "./ScrollableChat";

import io from 'socket.io-client';
const ENDPOINT = 'http://localhost:5000';

//the socket has an on method and an emit method just like on the server
let socket;

const GroupChat = () => {
    const [groupId] = useOutletContext();
    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler, userId } = useContext(AuthContext);

    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [socketConnected, setSocketConnected] = useState(false);

    const handleNewMessages = (messageSent) => {
        setMessages((prevMessages) => [...prevMessages, messageSent])
    }


    //Create a new socket connection (tcp connection) on component mount
    useEffect(() => {

        socket = io(ENDPOINT);
        socket.emit('setup', userId);
        socket.on('connect', () => setSocketConnected(true))

        // Cleanup function to run when the component unmounts
        return () => {
            socket.disconnect();
        };

    }, []);

    //Get all group messages 
    useEffect(() => {

        chatService.getGroupChat(groupId)
            .then((groupMessages) => {
                setMessages(groupMessages);
                socket?.emit('join chat', groupId);
            })
            .catch(error => {
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
            })
            .finally(() => {
                setLoadingMessages(false);
            })


    }, []);


    //Receive new message
    //no dependency array - this useEffect should be executed every time the state (messages) updates - tutorial
    useEffect(() => {

        const handleMessageReceived = (newMessageReceived) => {
            if (groupId !== newMessageReceived.groupId._id) {
                // Give notification
            } else {
                //setMessages([...messages, newMessageReceived]);
                //problematic without cleanup; works ok with or withoup dependancy array
                setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
            }
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

            <MessageInput handleNewMessages={handleNewMessages} socket={socket} />

        </Container>
    )
}

export default GroupChat
