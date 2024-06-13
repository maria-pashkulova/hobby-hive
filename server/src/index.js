const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const expressConfigurator = require('./config/expressConfigurator');
const connectToDb = require('./config/dbConfig');
const routes = require('./routes');
const cloudinary = require('cloudinary').v2;



dotenv.config(); //прави process.env обекта глобално достъпен

//#Init - инстанция на експрес сървър
const app = express();

//#Configs
expressConfigurator(app);


//#Connecting to the database
connectToDb()
    .then(() => console.log('Successfully connected to database'))
    .catch((error) => console.log(`Error while connecting to the DB: ${error}`));

//#cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


//The path.resolve() method resolves a sequence of paths or path segments into an absolute path.
//relative path to absolute path
//console.log(path.resolve(__dirname));
//C:\Users\Maria\Desktop\HobbyHive\server\src

//#Routing
app.use(routes);

//# Start express server
app.listen(process.env.PORT, () => console.log('Server is running on port 5000'));