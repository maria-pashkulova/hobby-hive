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
        required: true,
        default: 'https://images.nightcafe.studio/users/ZcDYVAlvjNbsAHbwNhUFxdU0rXs2/uploads/m7XuV1i6egth4ISiD240.jpeg?tr=w-1600,c-at_max'
    },
    bio: {
        type: String,
        default: ''
    },
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }]

}, { timestamps: true });

//TODO: validate if user exists (със същия имейл)- направих го на ниво service
//тук сложих unique, което пак би хвърлило грешка


userSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName
});

//Create model

const User = mongoose.model('User', userSchema)

//Export model
module.exports = User;
