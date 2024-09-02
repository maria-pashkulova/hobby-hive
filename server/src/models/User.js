const mongoose = require('mongoose');


//Create schema
const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        default: ''
    },
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        default: []
    }],
    attendingEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        default: []
    }],
    googleCalendarRefreshToken: {
        type: String,
        default: ''
    }

}, { timestamps: true });

//Duplicate emails - uniqueness constraint is handled by Mongo DB server
//Custom error message for uniqueness constraint violation in MongoDB
userSchema.post('save', function (error, doc, next) {
    const uniqueEmailViolationErr = new Error('В системата вече съществува потребител с този имейл!');
    uniqueEmailViolationErr.statusCode = 409;
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(uniqueEmailViolationErr);
    } else {
        next(error);
    }
});


userSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName
});

// Ensure virtual fields are included in toJSON outputs

userSchema.set("toJSON", {
    virtuals: true,
    transform: function (doc, dataInMongoDb) {
        delete dataInMongoDb.firstName;
        delete dataInMongoDb.lastName;
    }
});


//Create model

const User = mongoose.model('User', userSchema)

//Export model
module.exports = User;
