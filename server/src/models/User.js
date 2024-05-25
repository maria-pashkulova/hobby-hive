const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


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
    pic: {
        type: String,
        required: true,
        default: 'https://images.nightcafe.studio/users/ZcDYVAlvjNbsAHbwNhUFxdU0rXs2/uploads/m7XuV1i6egth4ISiD240.jpeg?tr=w-1600,c-at_max'
    }
});

//TODO: validate if user exists (със същия имейл)


//случва се след изпълнение на всички валидатори
//hash password: 
userSchema.pre('save', async function () {

    //всеки път ще използва 10 rounds и ще генерира уникална сол
    const hash = await bcrypt.hash(this.password, 10);

    //презаписваме стойността на полето password на текущия документ
    this.password = hash;
});



userSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName
});

//Create model

const User = mongoose.model('User', userSchema)

//Export model
module.exports = User;
