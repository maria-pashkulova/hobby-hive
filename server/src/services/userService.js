const bcrypt = require('bcrypt');
const jwt = require('../lib/jwt');
const User = require('../models/User');

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
        throw new Error('User with the same email already exists!');
    }

    const user = await User.create({ firstName, lastName, email, password });
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

async function getAuthResult(user) {
    //create token

    const payload = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email
    }

    const token = await jwt.sign(payload, process.env.SECRET);

    const result = {
        ...payload,
        token
    }

    return result;
}