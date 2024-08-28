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
    }]

}, { timestamps: true });

//TODO: validate if user exists (със същия имейл)- направих го на ниво service
//тук сложих unique, което пак би хвърлило грешка


userSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName
});

// Ensure virtual fields are included in toJSON outputs

userSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: function (doc, dataInMongoDb) {
        delete dataInMongoDb.firstName;
        delete dataInMongoDb.lastName;
        delete dataInMongoDb.id;
    }
});


//Create model

const User = mongoose.model('User', userSchema)

//Export model
module.exports = User;
