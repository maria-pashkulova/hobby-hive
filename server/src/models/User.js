const mongoose = require('mongoose');


//Create schema
const userSchema = new mongoose.Schema({

    firstName: String,
    lastName: String,
    email: String,
    password: String,
    pic: {
        type: String,
        required: true,
        default: 'https://images.nightcafe.studio/users/ZcDYVAlvjNbsAHbwNhUFxdU0rXs2/uploads/m7XuV1i6egth4ISiD240.jpeg?tr=w-1600,c-at_max'
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false,
    }
});

//Virtual properties usage:
//repeat pass and password matching validation
//value param : името на virtual property и property-то на обекта който е подаден при създаване на user must match 1:1 

//защото това което се случва е : User.create(userData object); и userData -> {firstName: ...,lastName: ..., email: ...,  password: ... , repeatPass: ...}
//взима стойността на поле repeatPass и я подава като параметър (value) на анонимната ф-ция, параметър на set 
//Това се случва преди записа да е въведен в БД !

//maybe validate it on service layer
userSchema.virtual('repeatPass')
    .set(function (value) {
        if (value !== this.password) {
            throw new mongoose.MongooseError('Паролите не съвпадат');
        }
    })



//Create model

const User = mongoose.model('User', userSchema)

//Export model
module.exports = User;
