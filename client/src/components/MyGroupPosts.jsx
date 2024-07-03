import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AuthContext from "../contexts/authContext";
import { Box, Container, Flex, Spinner, useToast } from "@chakra-ui/react";
import Post from "./Post";

import * as postService from '../services/postService';

const POSTS_PER_PAGE = 10;

const MyGroupPosts = () => {

    const [groupId] = useOutletContext();
    const navigate = useNavigate();
    const toast = useToast();


    const { logoutHandler } = useContext(AuthContext);

    const [myPosts, setMyPosts] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(2);
    const [hasMore, setHasMore] = useState(false);

    const spinnerRef = useRef(null);

    const [fetchPostsAgain, setFetchPostsAgain] = useState(false);


    //TODO: use these for update post modal - separate component which
    //will perform a request to populate post data or 
    // май към пост компонента трябва да добавя тва за модала - open/close

    const changeMyPostsOnDbUpdate = (editedPost) => {

        //find the index of edited object
        const editedIndex = myPosts.findIndex(post => post._id === editedPost._id);

        //why was that check needed ? -> notes for food lookup app
        if (editedIndex !== -1) {
            const newPosts = [...myPosts];
            newPosts[editedIndex] = { ...editedPost };

            //update state
            setMyPosts(newPosts);
        }

    }


    const refetchOnDelete = () => {
        setFetchPostsAgain(true);
        setCurrentPage(2);
    }


    //Load initial posts
    //Refetch when post is deleted
    useEffect(() => {
        postService.getUserPostsForGroup(groupId, {
            page: 1,
            limit: POSTS_PER_PAGE
        })
            .then(({ posts, hasMore }) => {
                setMyPosts(posts);
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
    }, [fetchPostsAgain]);

    //Handle additional post retrieval
    const fetchMorePosts = useCallback(async () => {

        //if there is already running a request for more posts
        //do not trigger another one (if user scrolls up and down -> up and down)
        if (isLoadingMore || !hasMore) return;

        setIsLoadingMore(true);

        postService.getUserPostsForGroup(groupId, {
            page: currentPage,
            limit: POSTS_PER_PAGE
        })
            .then(({ posts, hasMore }) => {
                setMyPosts((prevPosts) => [...prevPosts, ...posts]);

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
                setIsLoadingMore(false);
            })

    }, [currentPage, isLoadingMore, hasMore]);

    //Configure Intersection Observer
    useEffect(() => {

        const observer = new IntersectionObserver((entries) => {
            const target = entries[0];

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


    return isInitialLoading ?
        (<Flex justifyContent={'center'}>
            <Spinner size='xl' />
        </Flex>)
        : (myPosts.length > 0 ?

            <Container my={8}>
                {myPosts.map(post => (
                    <Post
                        key={post._id}
                        postId={post._id}
                        text={post.text}
                        img={post.img}
                        postedByName={post._ownerId?.fullName}
                        isOwner={true}
                        postedByProfilePic={post._ownerId?.profilePic}
                        createdAt={post.createdAt}
                        refetchOnDelete={refetchOnDelete}
                        changeMyPostsOnDbUpdate={changeMyPostsOnDbUpdate}
                        groupId={groupId}
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

            </Container> : (<p> Все още не сте публикували в тази група.</p>)

        )
}

export default MyGroupPosts
