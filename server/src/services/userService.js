const bcrypt = require('bcrypt');
const jwt = require('../lib/jwt');
const User = require('../models/User');

//подавам отделните пропърита
//за по ясен интерфейс
//евентуално за валидация на ниво сървис
exports.register = (firstName, lastName, email, password, repeatPass) => {
    //password === repeatPass може да се провери на ниво сървис
    //проверка за съществуващ user със същия имейл
    //ако проверката password === repeatPass е тук, може да се направи хеширането
    //на паролата тук

    User.create({ firstName, lastName, email, password, repeatPass })
}

exports.login = async (email, password) => {

    //find user (проверка дали изобщо съществува)
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Invalid email or password!');
    }

    //validate password (правилна парола)

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        throw new Error('Inavlid email or password');
    }

    //create token

    const payload = {
        _id: user._id,
        name: user.fullName

    }

    const token = await jwt.sign(payload, process.env.SECRET);

    return token;
}