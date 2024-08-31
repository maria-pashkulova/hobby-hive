const User = require('../models/User');

exports.saveRefreshTokenToDatabase = (userId, refreshToken) => {

    return User.findByIdAndUpdate(userId, {
        googleCalendarRefreshToken: refreshToken
    })
}

exports.deleteInvalidRefreshTokenFromDatabase = (userId) => {
    return User.findByIdAndUpdate(userId, {
        googleCalendarRefreshToken: ''
    })
}

