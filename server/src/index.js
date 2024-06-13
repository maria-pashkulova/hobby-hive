const express = require('express');

require('dotenv').config() //прави process.env обекта глобално достъпен, преди да се require-нат други файлове, които евентуално на top-level
//може да изискват достъп до environment variables
const expressConfigurator = require('./config/expressConfigurator');
const connectToDb = require('./config/dbConfig');
const cloudinaryConfig = require('./config/cloudinaryConfig');
const routes = require('./routes');


//#Init - инстанция на експрес сървър
const app = express();

//#Configs
expressConfigurator(app);

//#Cloudinary configuration
cloudinaryConfig();

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

//# Start express server
app.listen(process.env.PORT, () => console.log('Server is running on port 5000'));