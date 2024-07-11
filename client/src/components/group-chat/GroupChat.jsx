import { Container, Divider, Flex, Skeleton, SkeletonCircle, Text, useToast } from "@chakra-ui/react"
import MessageInput from "../MessageInput"
import { useContext, useEffect, useState } from "react";

import * as chatService from '../../services/chatService';
import { useNavigate, useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/authContext";
import './GroupChat.css';
import ScrollableChat from "./ScrollableChat";



const GroupChat = () => {
    const [groupId] = useOutletContext();
    const toast = useToast();
    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);

    useEffect(() => {

        chatService.getGroupChat(groupId)
            .then(setMessages)
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

            <MessageInput />

        </Container>
    )
}

export default GroupChat
