const bcrypt = require('bcrypt');
const jwt = require('../lib/jwt');
const User = require('../models/User');

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
    const user = await User.findOne({ email });

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

exports.getUser = async (userId) => {
    //TODO - virtual property fullName is not returned! 
    const user = await User.findById(userId).select('_id fullName profilePic bio createdAt');

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    };
    return user;
}

exports.updateUser = async (currUserId, userIdToUpdate, firstName, lastName, email, password, profilePic, bio) => {

    let user = await User.findById(userIdToUpdate);

    //проверка дали изобщо съществува такъв потребител - съществува ли id-то
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    };

    //case:автентикиран потребител за нашето приложение (с валиден токен)
    //се опитва да промени данните на друг потребител
    if (userIdToUpdate !== currUserId) {
        const error = new Error('You cannot update other user\'s profile');
        error.statusCode = 401;
        throw error;
    }

    //ако потребителят е променил паролата си
    if (password) {
        //hash password
        //всеки път ще използва 10 rounds и ще генерира уникална сол
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
    }

    //за новите данни презаписва стойностите, а старите ги оставя с предходните
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email
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