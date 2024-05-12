const express = require('express');
const path = require('path');
require('dotenv').config();


const expressConfigurator = require('./config/expressConfigurator');
const connectToDb = require('./config/dbConfig');
const routes = require('./routes');

//#Init - инстанция на експрес сървър
const app = express();

//#Configs
expressConfigurator(app);


//#Connecting to the database
connectToDb()
    .then(() => console.log('Successfully connected to database'))
    .catch((error) => console.log(`Error while connecting to the DB: ${error}`));



//The path.resolve() method resolves a sequence of paths or path segments into an absolute path.
//relative path to absolute path
//console.log(path.resolve(__dirname));
//C:\Users\Maria\Desktop\HobbyHive\server\src

//#Routing
app.use(routes);


app.listen(process.env.PORT, () => console.log('Server is running on port 5000'));