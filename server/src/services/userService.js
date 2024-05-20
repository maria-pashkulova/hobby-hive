const User = require('../models/User');

//подавам отделните пропърита
//за по ясен интерфейс
//евентуално за валидация на ниво сървис
exports.register = (firstName, lastName, email, password, repeatPass) => {
    //password === repeatPass може да се провери на ниво сървис
    //проверка за съществуващ user

    User.create({ firstName, lastName, email, password, repeatPass })
}