const Post = require('../models/Post');
const Group = require('../models/Group');
const User = require('../models/User');

const cloudinary = require('cloudinary').v2;
const POST_PICS_FOLDER = 'post-pics';


exports.getAllGroupPosts = (groupId) => {

    //ако се подаде несъществуващо groupId, което е валидно ObjectId, ще върне празен масив
    //sort in descending order
    const posts = Post
        .find({ groupId })
        .sort({ createdAt: -1 })
        .populate({
            path: '_ownerId',
            select: 'firstName lastName profilePic'
        })
    return posts;
}

exports.createPost = async (text, img, _ownerId, groupId) => {

    const group = await Group.findById(groupId);

    if (!group) {
        const error = new Error('Несъществуваща група за създаване на публикация!');
        error.statusCode = 404;
        throw error;
    }

    //проверка дали user-а съществува 
    const user = await User.findById(_ownerId);
    if (!user) {
        const error = new Error('Не съществува такъв потребител!');
        error.statusCode = 404;
        throw error;
    }
    // проверка дали този който се опитва да създаде поста е член на групата

    const isMember = group.members.find(member => member._id.toString() === _ownerId)

    if (!isMember) {
        const error = new Error('Не сте член на групата, за да създавате публикации в нея!');
        error.statusCode = 403;
        throw error;
    }

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