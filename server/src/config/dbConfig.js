const mongoose = require('mongoose');

async function connectToDb() {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING)

    } catch (error) {
        throw new Error('Connection to db was unsuccessful!');
    }
}

module.exports = connectToDb;