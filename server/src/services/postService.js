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


exports.getUserPostsForGroup = async (groupId, currUserId) => {

    //ако изнасям проверката за съществуващ потребител в middleware трябва да осигуря начин
    //тук да имам информацията за потребителя
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

    const newPost = await Post.create(newPostData);
    const newPostWithOwnerData = await newPost.populate({
        path: '_ownerId',
        select: 'firstName lastName profilePic'
    })

    return newPostWithOwnerData;
}

exports.edit = async (postIdToEdit, currUserId, text, newImg, currImg) => {
    //reuse getById() service method -> тук е проверката дали публикацията съществува
    // const post = await this.getById(postIdToEdit);
    //не мога да преизползвам getById, защото в него има lean() -> няма да мога да кажа post.save()
    //защото това няма да е Mongoose document , а POJO

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
        const uploadedResponse = await cloudinary.uploader.upload(newImg, {
            folder: POST_PICS_FOLDER
        });

        imageUrl = uploadedResponse.secure_url;
    } else if (post.img && newImg && !currImg) {
        // Case 2: Post has an image, user uploads a new one

        //extract public_id from secure_url
        //concatenate with folder name
        const public_id = `${POST_PICS_FOLDER}/${post.img.split('/').pop().split('.')[0]}`;
        await cloudinary.uploader.destroy(public_id);

        //user has uploaded new image - he wants to change the current picture
        const uploadedResponse = await cloudinary.uploader.upload(newImg, {
            folder: POST_PICS_FOLDER
        });

        imageUrl = uploadedResponse.secure_url;

    } else if (post.img && !newImg && !currImg) {
        // Case 3: Post has an image, user wants to remove it

        //extract public_id from secure_url
        //concatenate with folder name
        const public_id = `${POST_PICS_FOLDER}/${post.img.split('/').pop().split('.')[0]}`;
        await cloudinary.uploader.destroy(public_id);

        imageUrl = '';
    }

    //ако досега публикацията не е имала снимка и не е била прикачена нова (newImg) си остава с '' -> let imageUrl = post.img;с

    // Update post with new text and image url
    post.text = text;
    post.img = imageUrl;

    await post.save();


    return post;

}

exports.delete = async (postIdToDelete, currUserId) => {

    //проверка дали user-а съществува ?
    //   const user = await User.findById(currUserId);
    //   if (!user) {
    //       const error = new Error('Не съществува такъв потребител!');
    //       error.statusCode = 404;
    //       throw error;
    //   }

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
        //extract public_id from secure_url
        //concatenate with folder name
        const public_id = `${POST_PICS_FOLDER}/${post.img.split('/').pop().split('.')[0]}`;
        await cloudinary.uploader.destroy(public_id);

    }

    //не работеше без return; връщам promise, не await-вам
    return Post.findByIdAndDelete(postIdToDelete);
}