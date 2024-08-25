import { Container, Flex, Skeleton, SkeletonCircle, useToast } from "@chakra-ui/react"
import MessageInput from "./MessageInput"
import { useContext, useEffect, useState } from "react";

import * as chatService from '../../services/chatService';
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import './GroupChat.css';
import ScrollableChat from "./ScrollableChat";


const GroupChat = () => {
    const { groupId } = useParams();
    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler, socket } = useContext(AuthContext);

    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);


    //Add new message to the local state of the user who sends a message
    //Update other members' chats who are viewing group chat
    //Working with the callback form of setState (with updater function) ensures access to the latest state value regardless of when or where it is called.
    const handleNewMessages = (messageSent) => {
        setMessages((prevMessages) => [...prevMessages, messageSent])
    }

    //Get all group messages 
    useEffect(() => {

        chatService.getGroupChat(groupId)
            .then((groupMessages) => {
                //if user has access to group messages he is 100% authenticated and is a member of group
                setMessages(groupMessages);
            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
                    navigate('/login');
                } else if (error.status === 403) {
                    //Handle case : user trying to access group chat in a group he was removed from (outdated ui)
                    //Handle case : user opens old notification for a group he left
                    navigate(`/my-groups`);

                    toast({
                        title: 'Не сте член на групата!',
                        description: `За да достъпите груповия разговор, присъединете се отново!`,
                        status: "info",
                        duration: 10000,
                        isClosable: true,
                        position: "bottom",
                    })
                } else {

                    //handle case : error connecting with server or other possible server errors
                    toast({
                        title: error.message || 'Възникна грешка при свързване!',
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


    }, [groupId]);


    //Receive new message (for all group members currently viewing the chat in which a message was sent (except the member who has sent it))
    useEffect(() => {

        socket?.emit('join chat', groupId);
        socket?.on('message received', handleNewMessages)


        //Cleanup the event listener on component unmount or when groupId / socket changes and use effect is triggered again
        return () => {
            socket?.emit('leave group chat', groupId);
            socket?.off('message received', handleNewMessages);
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
