import React, { useContext } from 'react'
import ScrollableFeed from 'react-scrollable-feed';
import AuthContext from '../../contexts/authContext';
import { Avatar, Flex, Text, Tooltip } from '@chakra-ui/react';
import { isLastMessage, isSameSender, isSameUser } from '../../utils/chatSenders';

const ScrollableChat = ({ messages }) => {
    const { userId } = useContext(AuthContext);
    return (
        <ScrollableFeed className='scrollable-feed'>
            {messages &&
                messages.map((currMessage, i) => (
                    // single message - with or without profile picture of the user
                    <Flex
                        key={currMessage._id}

                        alignSelf={currMessage.sender._id === userId ? 'flex-end' : 'flex-start'}
                        mt={isSameUser(messages, currMessage, i, userId) ? 1 : 8}>

                        {
                            (isSameSender(messages, currMessage, i, userId) ||
                                isLastMessage(messages, i, userId)) && (
                                <Tooltip
                                    label={currMessage.sender.fullName}
                                    placement='bottom'
                                >
                                    <Avatar
                                        src={currMessage.sender.profilePic}
                                        name={currMessage.sender.fullName}
                                        mt='7px'
                                        mr={1}
                                    />
                                </Tooltip>
                            )
                        }
                        <Text
                            bg={currMessage.sender._id === userId ? 'blue.100' : 'gray.100'}
                            p={4}
                            borderRadius='md'
                        >
                            {currMessage.content}

                        </Text>

                    </Flex>
                ))

            }

        </ScrollableFeed>
    )
}

export default ScrollableChat


// {messages && messages.map((message, index) => <Message key={message._id} sender={message.sender} content={message.content} />)}
