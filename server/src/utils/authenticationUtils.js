const jwt = require('../lib/jwt');

//Create JWT token for authentication
async function getAuthResult(user) {

    //900 sec = 15 min - used for debugging purposes
    //3600 sec = 60 min - until refresh token is implemented TODO
    const accessToken = await jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });

    const result = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        accessToken
    }

    return result;
}

exports.getAuthResult = getAuthResult;