import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import Post from "./Post"
import { useContext, useEffect, useState } from "react";

import * as postService from '../services/postService';
import AuthContext from "../contexts/authContext";
import { Box, Button, Flex, Spinner, useDisclosure } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import CreatePostModal from "./CreatePostModal";

const GroupPosts = () => {


    const [groupId, isMember] = useOutletContext();

    const navigate = useNavigate();
    // const { groupId } = useParams();
    const { logoutHandler } = useContext(AuthContext);

    const [groupPosts, setGroupPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleAddNewCreatedPost = (newPost) => {
        setGroupPosts((posts) => ([newPost, ...posts]));
    }

    useEffect(() => {
        postService.getGroupPosts(groupId)
            .then(setGroupPosts)
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle other errors
                    console.log(error.message);
                }
            })
            .finally(() => {
                setLoading(false);
            })
    }, []);

    return (
        <Box>
            {isMember && (<Button
                position='fixed'
                bottom={10}
                right={4}
                d='flex'
                leftIcon={<FiPlus />}
                onClick={onOpen}
            >
                Нова публикация
            </Button>)
            }

            {isOpen && <CreatePostModal
                isOpen={isOpen}
                onClose={onClose}
                groupId={groupId}
                handleAddNewCreatedPost={handleAddNewCreatedPost}
            />}

            {loading ?
                (<Flex justifyContent={'center'}>
                    <Spinner size='xl' />
                </Flex>)
                :
                (groupPosts.length > 0 ?

                    groupPosts.map(post =>
                        <Post
                            key={post._id}
                            text={post.text}
                            img={post.img}
                            postedByName={post._ownerId?.fullName}
                            postedByProfilePic={post._ownerId?.profilePic}
                            createdAt={post.createdAt}
                        />
                    ) : <p>Все още няма публикации в групата</p>
                )

            }


        </Box>


    )
}

export default GroupPosts
