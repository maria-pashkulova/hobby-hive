import { useNavigate, useParams } from "react-router-dom"
import Post from "./Post"
import { useContext, useEffect, useState } from "react";

import * as postService from '../services/postService';
import AuthContext from "../contexts/authContext";

const GroupPosts = () => {

    const navigate = useNavigate();
    const { groupId } = useParams();
    const { logoutHandler } = useContext(AuthContext);
    const [groupPosts, setGropPosts] = useState([]);

    useEffect(() => {
        postService.getGroupPosts(groupId)
            .then(setGropPosts)
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
    }, []);

    return (
        <div>
            {groupPosts.map(post =>
                <Post
                    key={post._id}
                    text={post.text}
                />

            )}

        </div>
    )
}

export default GroupPosts
