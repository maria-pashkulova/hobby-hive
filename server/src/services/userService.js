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
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }
        : {};

    //всички потребители, които match-ват условията - съдържат в името си или имейла си търсения стринг
    //и са различни от текущо логнатия потребител
    const users = User.find(keyword).find({ _id: { $ne: currUserId } }).select('_id firstName lastName email profilePic');

    return users;
}

//used in authentication middleware only
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

exports.updateUser = async (currUserId, userIdToUpdate, firstName, lastName, email, password, newProfilePic, currProfilePic) => {

    //ако userIdToUpdate не невалидно (user-a със сиг не съществува), то няма да съвпада с id на текущия потребител (който със сигурност съществува)
    //и му връщаме само 403 грешка. Защото единствения случай в който искаме да позволим edit е само ако човек редактира себе си.
    // и няма нужда да проверявам дали човека съществува ако той е текущо логнатия, защото съм сигурна
    //дори така като не връщам 404 може би е по-малко expose-ване на информация

    //case:автентикиран потребител за нашето приложение (с валиден токен)
    //се опитва да промени данните на друг потребител
    if (userIdToUpdate !== currUserId) {
        const error = new Error('Можете да редактирате само собствения си профил!');
        error.statusCode = 403;
        throw error;
    }

    let user = await User.findById(userIdToUpdate);

    //само ако потребителят е променил паролата си, се хешира отново
    if (password) {
        //hash password
        //всеки път ще използва 10 rounds и ще генерира уникална сол
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
    }


    //'' for users without profile pic
    // or secure_url for cloudinary
    let imageUrl = user.profilePic;

    // Case 1: User initially without profile pic, user uploads a new image
    if (!user.profilePic && newProfilePic) {

        imageUrl = await uploadToCloudinary(newProfilePic, PROFILE_PICS_FOLDER);

    } else if (user.profilePic && newProfilePic && !currProfilePic) {
        // Case 2: User has a profile pic, user uploads a new one

        //destroy current image from cloudinary
        await destroyFromCloudinary(user.profilePic, PROFILE_PICS_FOLDER);

        //user has uploaded new image - he wants to change the current profile pic
        imageUrl = await uploadToCloudinary(newProfilePic, PROFILE_PICS_FOLDER);


    } else if (user.profilePic && !newProfilePic && !currProfilePic) {
        // Case 3: User has a profile pic and wants to remove it

        //destroy current image from cloudinary
        await destroyFromCloudinary(user.profilePic, PROFILE_PICS_FOLDER);

        imageUrl = ''

    }

    //ако досега потребителят не е имал снимка и не е била прикачена нова (newProfilePic) 
    //си остава с '' -> let imageUrl = user.profilePic;


    //това защита срещу изтриване на задължителните полета ли е ? 
    //за новите данни презаписва стойностите, а ако не е дошла стойност записва с предходните данни
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    //TODO : проверка дали има потребител със същия имейл - както при регистрация ако ще може да си сменя имейла
    //или да бъде на ниво model with Mongoose errors -> виж workshop
    user.email = email || user.email;
    user.profilePic = imageUrl;

    user = await user.save();

    //update user in all the groups he is a member to
    //TODO: transaction

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