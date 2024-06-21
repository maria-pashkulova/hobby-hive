const bcrypt = require('bcrypt');
const jwt = require('../lib/jwt');
const User = require('../models/User');
const Group = require('../models/Group');
const mongoose = require('mongoose');

const { uploadToCloudinary, destroyFromCloudinary } = require('../utils/cloudinaryUtils');
const PROFILE_PICS_FOLDER = 'user-profile-pics';



//TODO: validate form inputs with express validator

//подавам отделните пропърита
//за по ясен интерфейс
//евентуално за валидация на ниво сървис
exports.register = async (firstName, lastName, email, password) => {
    //password === repeatPass може да се провери на ниво сървис
    //проверка за съществуващ user със същия имейл
    //ако проверката password === repeatPass е тук, може да се направи хеширането
    //на паролата тук
    //за момента няма да пращам на сървъра repeat pass

    //validate if user exists (със същия имейл)
    //findOne() връща null, ако не намери търсен запис в колекцията
    const duplicate = await User.findOne({ email });
    if (duplicate) {
        const error = new Error('Съществува потребител с този имейл!');
        error.statusCode = '409' // //status 409 - conflict
        throw error;
    }

    //TODO: validate fields - password length for example

    //hash password
    //всеки път ще използва 10 rounds и ще генерира уникална сол
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ firstName, lastName, email, password: hashedPassword });
    const result = getAuthResult(user);

    return result;
}

exports.login = async (email, password) => {

    //TODO: index on email field for optimization?
    //find user (проверка дали изобщо съществува)
    //findOne() връща null, ако не намери търсен запис в колекцията
    const user = await User.findOne({ email }).select('_id firstName lastName email password profilePic');

    if (!user) {
        throw new Error('Грешен имейл или парола!');
    }

    //validate password (правилна парола)

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw new Error('Грешен имейл или парола!');
    }

    //create token + return user data as js object

    const result = getAuthResult(user);

    return result;

}

exports.getAll = async (search, currUserId) => {

    const keyword = search
        ? {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }
        : {};

    //всички потребители, които match-ват условията - съдържат в името си или имейла си търсения стринг
    //и са различни от текущо логнатия потребител
    const users = User.find(keyword).find({ _id: { $ne: currUserId } }).select('_id firstName lastName email profilePic');

    return users;
}

//used in authentication middleware, not in userController, no such endpoint for getting user details
exports.getById = async (userId) => {

    //оптимизация -> не се правят заявки с невалидни ObjectId,
    //а директно се хвърля грешка
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Не съществува такъв потребител!');
    }

    //Check if user still exists in DB after login
    // Use lean() for better performance - no need for mongoose document methods
    const user = await User.findById(userId).select('firstName lastName email profilePic').lean();

    if (!user) {
        throw new Error('Не съществува такъв потребител!');
    };

    return user;
}

exports.updateUser = async (currUserId, userIdToUpdate, firstName, lastName, email, password, profilePic) => {

    if (!mongoose.Types.ObjectId.isValid(userIdToUpdate)) {
        const error = new Error('Не съществува такъв потребител');
        error.statusCode = 404;
        throw error;
    }

    let user = await User.findById(userIdToUpdate);

    //проверка дали изобщо съществува такъв потребител ( с такова id)
    if (!user) {
        const error = new Error('Не съществува такъв потребител');
        error.statusCode = 404;
        throw error;
    };

    //case:автентикиран потребител за нашето приложение (с валиден токен)
    //се опитва да промени данните на друг потребител
    if (userIdToUpdate !== currUserId) {
        const error = new Error('Не можете да редактирате профил на друг потребител');
        error.statusCode = 403;
        throw error;
    }

    //само ако потребителят е променил паролата си, се хешира отново
    if (password) {
        //hash password
        //всеки път ще използва 10 rounds и ще генерира уникална сол
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
    }

    if (profilePic) {
        if (user.profilePic) {
            //destroy currentPhoto from cloudinary

            await destroyFromCloudinary(user.profilePic, PROFILE_PICS_FOLDER);
        }
        //if user uploaded a pic we upload it to cloudinary
        profilePic = await uploadToCloudinary(profilePic, PROFILE_PICS_FOLDER)
    }


    //това защита срещу изтриване на задължителните полета ли е ? 
    //за новите данни презаписва стойностите, а ако не е дошла стойност записва с предходните данни
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    //TODO : проверка дали има потребител със същия имейл - както при регистрация ако ще може да си сменя имейла
    //или да бъде на ниво model with Mongoose errors -> виж workshop
    user.email = email || user.email;
    user.profilePic = profilePic || user.profilePic;

    user = await user.save();

    //update user in all the groups he is a member to

    await Group.updateMany(
        { _id: { $in: user.groups } },
        {
            $set: {
                "members.$[member].fullName": user.fullName,
                "members.$[member].email": user.email,
                "members.$[member].profilePic": user.profilePic
            }
        },
        {
            arrayFilters: [{ "member._id": user._id }]
        }

    )


    return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic
    }
}

exports.getGroupsWithMembership = (userId) => {

    //sort results 
    const user = User.findById(userId).select('groups -_id').populate({ path: 'groups', options: { sort: { 'createdAt': -1 } } });

    return user;
}


async function getAuthResult(user) {
    //create token

    //900 sec = 15 min
    const accessToken = await jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 900 });
    //const refreshToken = await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });


    const result = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        accessToken
    }

    return result;
}