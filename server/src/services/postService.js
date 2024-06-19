const Post = require('../models/Post');
const Group = require('../models/Group');
const User = require('../models/User');

const cloudinary = require('cloudinary').v2;
const POST_PICS_FOLDER = 'post-pics';
const mongoose = require('mongoose');


exports.getAllGroupPosts = (groupId) => {

    //TODO: pagination
    //TODO: efficient data transfer -> use select( needed fields only)
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


//Use this endpoint for populating edit post form
exports.getById = async (postId) => {

    let post;

    //оптимизация -> не се правят заявки с невалидни objectId,
    //а директно се хвърля грешка
    if (mongoose.Types.ObjectId.isValid(postId)) {
        post = await Post.findById(postId).select('text img _ownerId').lean();
    } else {
        throw new Error('Публикацията не съществува!');
    }

    if (!post) {
        throw new Error('Публикацията не съществува!');
    }

    return post;
}


exports.getUserPostsForGroup = async (groupId, currUserId) => {

    const user = await User
        .findById(currUserId)
        .select('_id firstName lastName profilePic')
        .lean();


    if (!user) {
        const error = new Error('Не съществува такъв потребител!');
        error.statusCode = 404;
        throw error;
    }

    let posts = await Post
        .find({ groupId, _ownerId: currUserId })
        .select('-updatedAt')
        .sort({ createdAt: -1 })
        .lean();

    //слагам данните за потребителя който им е owner ръчно, защото той винаги ще е един и същ
    //и без това съм направила заявка за него, за да проверя дали съществува
    posts = posts.map(post => ({
        ...post,
        _ownerId: {
            _id: user._id,
            fullName: `${user.firstName} ${user.lastName}`,
            profilePic: user.profilePic
        }
    }))

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

exports.delete = async (postIdToDelete, currUserId) => {

    //проверка дали user-а съществува ?
    //   const user = await User.findById(currUserId);
    //   if (!user) {
    //       const error = new Error('Не съществува такъв потребител!');
    //       error.statusCode = 404;
    //       throw error;
    //   }


    //reuse getById() service method
    const post = await this.getById(postIdToDelete);


    //ALTOUGH getById uses lean WE STILL NEED post._ownerId.toString()
    //because post._ownerId is of type object

    if (post._ownerId.toString() !== currUserId) {
        const error = new Error('Не можете да изтриете публикация на друг потребител !');
        error.statusCode = 401;
        throw error;
    }

    //delete post's image from cloudinary as well

    if (post.img) {
        //extract public_id from secure_url
        //concatenate with folder name
        const public_id = `${POST_PICS_FOLDER}/${post.img.split('/').pop().split('.')[0]}`;
        await cloudinary.uploader.destroy(public_id);

    }

    //не работеше без return; връщам promise, не await-вам
    return Post.findByIdAndDelete(postIdToDelete);
}