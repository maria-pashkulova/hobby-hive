const Post = require('../models/Post');
const Group = require('../models/Group');
const User = require('../models/User');


const POST_PICS_FOLDER = 'post-pics';
const { uploadToCloudinary, destroyFromCloudinary } = require('../utils/cloudinaryUtils');
const mongoose = require('mongoose');


exports.getAllGroupPosts = async (groupId, page, limit) => {

    const skip = (page - 1) * limit;

    //ако се подаде несъществуващо groupId, което е валидно ObjectId, ще върне празен масив
    //remove unnecessary post fields ; sort in descending order
    const posts = await Post
        .find({ groupId })
        .select('_id text img groupId _ownerId createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
            path: '_ownerId',
            select: 'firstName lastName profilePic'
        });

    //Group posts count 
    const total = await Post.countDocuments({ groupId });
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;


    return { posts, hasMore };
}


//Use this endpoint for populating edit post form
exports.getById = async (postId) => {

    let post;

    //оптимизация -> не се правят заявки с невалидни objectId,
    //а директно се хвърля грешка
    if (mongoose.Types.ObjectId.isValid(postId)) {
        post = await Post.findById(postId).select('text img _ownerId').lean();
    } else {
        const error = new Error('Публикацията не съществува!');
        error.statusCode = 404;
        throw error;
    }

    if (!post) {
        const error = new Error('Публикацията не съществува!');
        error.statusCode = 404;
        throw error;
    }

    return post;
}


exports.getUserPostsForGroup = async (groupId, currUser, page, limit) => {

    const skip = (page - 1) * limit;

    let posts = await Post
        .find({ groupId, _ownerId: currUser._id })
        .select('_id text img groupId _ownerId createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    //слагам данните за потребителя който им е owner ръчно, защото той винаги ще е един и същ
    //и без това съм направила заявка за него, за да проверя дали съществува
    posts = posts.map(post => ({
        ...post,
        _ownerId: {
            _id: currUser._id,
            fullName: currUser.fullName,
            profilePic: currUser.profilePic
        }
    }));

    //Current user's posts in the current group count;
    const total = await Post.countDocuments({ groupId, _ownerId: currUser._id });
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return { posts, hasMore };

}

exports.createPost = async (text, img, _ownerId, groupId) => {

    const group = await Group.findById(groupId);

    if (!group) {
        const error = new Error('Несъществуваща група за създаване на публикация!');
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
        img = await uploadToCloudinary(img, POST_PICS_FOLDER);
    }

    //TODO: add validation
    const newPostData = {
        text,
        img,
        _ownerId,
        groupId
    };

    const newPost = await Post.create(newPostData);

    return newPost;
}

exports.edit = async (postIdToEdit, currUserId, text, newImg, currImg) => {
    //reuse getById() service method -> тук е проверката дали публикацията съществува
    // const post = await this.getById(postIdToEdit);
    //не мога да преизползвам getById, защото в него има lean() -> няма да мога да кажа post.save()
    //защото това няма да е Mongoose document , а POJO

    //проверка дали потребителят, който се опитва да редактира съществува -> вече сме я направили в authMiddleware

    let post;

    //оптимизация -> не се правят заявки с невалидни objectId,
    //а директно се хвърля грешка
    if (mongoose.Types.ObjectId.isValid(postIdToEdit)) {
        post = await Post.findById(postIdToEdit)
            .select('text img _ownerId createdAt')
            .populate({
                path: '_ownerId',
                select: 'firstName lastName profilePic'
            });
    } else {
        const error = new Error('Публикацията не съществува!');
        error.statusCode = 404;
        throw error;
    }

    if (!post) {
        const error = new Error('Публикацията не съществува!');
        error.statusCode = 404;
        throw error;
    }


    if (post._ownerId._id.toString() !== currUserId) {
        const error = new Error('Не можете да редактирате публикация на друг потребител !');
        error.statusCode = 403;
        throw error;
    }

    //'' for posts with no image
    // secure_url for cloudinary
    let imageUrl = post.img;

    // Case 1: Post initially without image, user uploads a new image
    if (!post.img && newImg) {

        imageUrl = await uploadToCloudinary(newImg, POST_PICS_FOLDER);

    } else if (post.img && newImg && !currImg) {
        // Case 2: Post has an image, user uploads a new one

        //destroy current image from cloudinary
        await destroyFromCloudinary(post.img, POST_PICS_FOLDER);

        //user has uploaded new image - he wants to change the current picture

        imageUrl = await uploadToCloudinary(newImg, POST_PICS_FOLDER);


    } else if (post.img && !newImg && !currImg) {
        // Case 3: Post has an image, user wants to remove it

        //destroy current image from cloudinary
        await destroyFromCloudinary(post.img, POST_PICS_FOLDER)

        imageUrl = '';
    }

    //ако досега публикацията не е имала снимка и не е била прикачена нова (newImg) си остава с '' -> let imageUrl = post.img;

    // Update post with new text and image url
    post.text = text;
    post.img = imageUrl;

    await post.save();

    return post;

}

exports.delete = async (postIdToDelete, currUserId) => {

    //проверка дали потребителят, който се опитва да изтрива съществува -> вече сме я направили в authMiddleware

    //TODO : проверка групата съществува ли? - в постман пробвах да имам невалидно groupId
    //но валидно postId и си става
    //TODO: проверка потребителят член ли е на групата, за да изтрива публикации в нея ?

    //reuse getById() service method -> тук е проверката дали публикацията съществува
    const post = await this.getById(postIdToDelete);

    //ALTOUGH getById uses lean WE STILL NEED post._ownerId.toString()
    //because post._ownerId is of type object

    if (post._ownerId.toString() !== currUserId) {
        const error = new Error('Не можете да изтриете публикация на друг потребител !');
        error.statusCode = 403;
        throw error;
    }

    //delete post's image from cloudinary as well
    if (post.img) {
        await destroyFromCloudinary(post.img, POST_PICS_FOLDER);
    }

    //не работеше без return; връщам promise, не await-вам
    return Post.findByIdAndDelete(postIdToDelete);
}