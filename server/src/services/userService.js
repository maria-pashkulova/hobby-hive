const bcrypt = require('bcrypt');
const jwt = require('../lib/jwt');
const User = require('../models/User');
const Group = require('../models/Group');

const cloudinary = require('cloudinary').v2;
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
        const error = new Error('User with the same email already exists!');
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

    //find user (проверка дали изобщо съществува)
    //findOne() връща null, ако не намери търсен запис в колекцията
    const user = await User.findOne({ email }).select('_id firstName lastName email password profilePic');

    if (!user) {
        throw new Error('Invalid email or password!');
    }

    //validate password (правилна парола)

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw new Error('Inavlid email or password');
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

//maybe return only bio ; other info comes from member fields in the group ?
// exports.getUser = async (userId) => {
//     //TODO - virtual property fullName is not returned  - fullName is not part of the schema (DB)
//     //so it cant be used in select() as a field to be selected. The fields that it consist of 
//     //MUST be selected
//     const user = await User.findById(userId).select('_id firstName lastName profilePic createdAt');

//     if (!user) {
//         const error = new Error('User not found');
//         error.statusCode = 404;
//         throw error;
//     };
//     return user;
// }

exports.updateUser = async (currUserId, userIdToUpdate, firstName, lastName, email, password, profilePic) => {

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
        error.statusCode = 401;
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
            //extract public_id from secure_url
            //concatenate with folder name
            const public_id = `${PROFILE_PICS_FOLDER}/${user.profilePic.split('/').pop().split('.')[0]}`;

            await cloudinary.uploader.destroy(public_id);
        }
        //if user uploaded a pic we upload it to cloudinary
        const uploadedResponse = await cloudinary.uploader.upload(profilePic, {
            folder: PROFILE_PICS_FOLDER
        });
        profilePic = uploadedResponse.secure_url;
    }


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

    //check if user exists?

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