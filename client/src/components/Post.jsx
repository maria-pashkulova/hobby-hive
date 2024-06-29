import { Avatar, Box, Flex, Text, Image, Menu, MenuButton, MenuList, MenuItem, IconButton, useDisclosure } from '@chakra-ui/react'
import { BsThreeDots } from "react-icons/bs";
import { formatDistanceToNow } from 'date-fns'
import { bg } from 'date-fns/locale'
import DeletePostModal from './DeletePostModal';
import EditPostModal from './EditPostModal';

const Post = ({ postId, text, img, isOwner, postedByName, postedByProfilePic, createdAt, refetchOnDelete, changeMyPostsOnDbUpdate, groupId }) => {

    //todo: handle delete post -> request + changeMyPostsOnDbDelete -> modal
    const deletePostModal = useDisclosure();
    //todo: handle edit post -> request + change state function -> modal
    const editPostModal = useDisclosure();

    return (
        <>
            <Flex gap={3} mb={4} py={5}>
                <Flex flexDirection='column' alignItems='center'>
                    <Avatar
                        size='md'
                        name={postedByName}
                        src={postedByProfilePic}
                    />
                    <Box w='1px' h='full' bg='gray.300' my={2}></Box>

                </Flex>

                <Flex flex={1} flexDirection='column' gap={2}>
                    <Flex justifyContent='space-between' w='full'>

                        <Text fontSize='sm' fontWeight='bold'>{postedByName}</Text>

                        <Flex gap={4} alignItems='center'>
                            <Text fontSize='sm' color={"gray.light"}>
                                преди {formatDistanceToNow(new Date(createdAt), { locale: bg })}
                            </Text>
                            {isOwner && (
                                <Menu>
                                    <MenuButton variant='ghost' as={IconButton} icon={< BsThreeDots />} />
                                    <MenuList>
                                        <MenuItem onClick={editPostModal.onOpen}>Редактирай</MenuItem>
                                        <MenuItem onClick={deletePostModal.onOpen}>Изтрий</MenuItem>
                                    </MenuList>
                                </Menu>
                            )}
                        </Flex>


                    </Flex>

                    <Text maxWidth={'lg'} fontSize='sm'>{text}</Text>

                    {img && (
                        <Box
                            borderRadius={6}
                            overflow='hidden'
                        >
                            <Image w='full' src={img}></Image>

                        </Box>)}

                </Flex>


            </Flex >

            {deletePostModal.isOpen && <DeletePostModal
                isOpen={deletePostModal.isOpen}
                onClose={deletePostModal.onClose}
                postIdToDelete={postId}
                refetchOnDelete={refetchOnDelete}
                groupId={groupId}

            />}

            {editPostModal.isOpen && <EditPostModal
                isOpen={editPostModal.isOpen}
                onClose={editPostModal.onClose}
                postIdToUpdate={postId}
                changeMyPostsOnDbUpdate={changeMyPostsOnDbUpdate}
                groupId={groupId}
            />}
        </>
    )
}

export default Post
