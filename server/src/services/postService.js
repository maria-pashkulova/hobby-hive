const Post = require('../models/Post');
const Group = require('../models/Group');

const cloudinary = require('cloudinary').v2;
const POST_PICS_FOLDER = 'post-pics';


exports.getAllGroupPosts = (groupId) => {

    //ако се подаде несъществуващо groupId, което е валидно ObjectId, ще върне празен масив
    //sort in descending order
    const posts = Post.find({ groupId }).sort({ createdAt: -1 }).lean();
    return posts;
}

exports.createPost = async (text, img, _ownerId, groupId) => {

    const group = await Group.findById(groupId);

    if (!group) {
        const error = new Error('Не съществуваща група за създаване на публикация!');
        error.statusCode = 404;
        throw error;
    }

    //TODO: проверка дали този който се опитва да създаде поста е член на групата


    if (img) {
        //if user uploaded a pic we upload it to cloudinary
        const uploadedResponse = await cloudinary.uploader.upload(img, {
            folder: POST_PICS_FOLDER
        });

        img = uploadedResponse.secure_url;
    }

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