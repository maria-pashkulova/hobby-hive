const Post = require('../models/Post');
const Group = require('../models/Group');


exports.getAllGroupPosts = (groupId) => {

    //ако се подаде несъществуващо groupId, което е валидно ObjectId, ще върне празен масив
    const posts = Post.find({ groupId }).lean();
    return posts;
}

exports.createPost = async (text, img, _ownerId, groupId) => {

    const group = await Group.findById(groupId);

    if (!group) {
        const error = new Error('Несъществуваща група за създаване на публикация!');
        error.statusCode = 404;
        throw error;
    }

    //TODO: проверка дали този който се опитва да създаде поста е член на групата

    //TODO: add validation
    const newPostData = {
        text,
        img,
        _ownerId,
        groupId
    };

    const newPost = Post.create(newPostData);

    return newPost;
}