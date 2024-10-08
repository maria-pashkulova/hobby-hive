import { useNavigate, useOutletContext, useParams } from "react-router-dom"
import Post from "./Post"
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import * as postService from '../../services/postService';
import AuthContext from "../../contexts/authContext";
import { Box, Text, Button, Container, Flex, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import CreatePostModal from "./CreatePostModal";
import { ITEMS_PER_PAGE_POSTS as POSTS_PER_PAGE } from "../../constants/resource-constants";

const GroupPosts = () => {

    const { groupId } = useParams();

    const { isMember } = useOutletContext();

    const navigate = useNavigate();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { logoutHandler, socket } = useContext(AuthContext);

    const [groupPosts, setGroupPosts] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(2);
    const [hasMore, setHasMore] = useState(false);

    const spinnerRef = useRef(null);

    const [fetchPostsAgain, setFetchPostsAgain] = useState(false);


    const handleAddNewCreatedPost = () => {
        setFetchPostsAgain(true);
        setCurrentPage(2);
    }

    //socket communication related

    useEffect(() => {
        // Join group posts room for this group when the component mounts or dependencies change (visit another group's calendar)
        socket?.emit('join group posts', groupId);

        // Handle incoming notification to refetch group posts
        const handleChangeGroupPosts = () => {
            setFetchPostsAgain(true); // Trigger refetch in the second useEffect
            setCurrentPage(2);
        }

        //on post create or delete //TODO add on update also
        socket?.on('update group posts', handleChangeGroupPosts);

        // Cleanup function to leave the room when the component unmounts / or dependencies change
        return () => {
            socket?.emit('leave group posts', groupId);
            socket?.off('update group posts', handleChangeGroupPosts);
        };
    }, [socket, groupId]);


    //Load initial posts
    //Load new posts (first page only) when new post is created
    useEffect(() => {
        postService.getGroupPosts(groupId, {
            page: 1,
            limit: POSTS_PER_PAGE
        })
            .then(({ posts, hasMore }) => {
                setGroupPosts(posts);
                setHasMore(hasMore);
            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle other errors
                    toast({
                        title: "Възникна грешка!",
                        description: "Опитайте по-късно",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            })
            .finally(() => {

                if (isInitialLoading) {
                    setIsInitialLoading(false);
                }

                if (fetchPostsAgain) {
                    setFetchPostsAgain(false);
                }
            })
    }, [fetchPostsAgain, groupId]);

    //Handle additional posts retrieval
    const fetchMorePosts = useCallback(async () => {

        //if there is already running a request for more posts
        //do not trigger another one (if user scrolls up and down -> up and down)
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);

        postService.getGroupPosts(groupId, {
            page: currentPage,
            limit: POSTS_PER_PAGE
        })
            .then(({ posts, hasMore }) => {
                setGroupPosts((prevPosts) => [...prevPosts, ...posts]);

                setCurrentPage((prevCurrPage) => prevCurrPage + 1);
                setHasMore(hasMore);


            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle case : error connecting with server or other possible server errors
                    toast({
                        title: 'Нещо се обърка! Опитайте по-късно!',
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            })
            .finally(() => {
                setIsLoadingMore(false);
            })

    }, [currentPage, isLoadingMore, hasMore]);


    //Configure Intersection Observer
    useEffect(() => {
        // console.log('cio');
        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];
            // console.log(target);
            if (target.isIntersecting) {
                fetchMorePosts();
            }
        });

        if (spinnerRef.current) {
            observer.observe(spinnerRef.current);
        }

        return () => {
            if (spinnerRef.current) {
                observer.unobserve(spinnerRef.current);
            }
        };

    }, [fetchMorePosts]);


    return (
        <Container my={8}>
            <Box>
                {isMember && (<Button
                    position='fixed'
                    bottom={10}
                    right={4}
                    d='flex'
                    size={{ base: 'sm', sm: 'md' }}
                    leftIcon={<FiPlus />}
                    onClick={onOpen}
                >
                    Нова публикация
                </Button>)
                }

                {
                    isOpen && <CreatePostModal
                        isOpen={isOpen}
                        onClose={onClose}
                        groupId={groupId}
                        handleAddNewCreatedPost={handleAddNewCreatedPost}
                    />
                }

                {
                    isInitialLoading ?
                        (<Flex justifyContent={'center'}>
                            <Spinner size='xl' />
                        </Flex>)
                        :
                        (groupPosts.length > 0 ?

                            <>
                                {groupPosts.map(post => (
                                    <Post
                                        key={post._id}
                                        text={post.text}
                                        img={post.img}
                                        postedByName={post._ownerId?.fullName}
                                        postedByProfilePic={post._ownerId?.profilePic}
                                        createdAt={post.createdAt}
                                    />
                                ))}
                                {hasMore && (
                                    <div ref={spinnerRef}>
                                        {isLoadingMore && (
                                            <Flex justifyContent={'center'}>
                                                <Spinner />
                                            </Flex>
                                        )}

                                    </div>)}


                            </> : (<Text>Все още няма публикации в групата.</Text>)

                        )
                }


            </Box >

        </Container>
    )
}

export default GroupPosts;
