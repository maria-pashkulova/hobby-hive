const express = require('express');
const path = require('path');

//инстанция на експрес сървър
const app = express();
const PORT = 5000;

const expressConfigurator = require('./config/expressConfigurator');
const routes = require('./routes');

expressConfigurator(app);
//2н.
// require('./config/expressConfigurator')(app);


//The path.resolve() method resolves a sequence of paths or path segments into an absolute path.
//relative path to absolute path
console.log(path.resolve(__dirname));
//C:\Users\Maria\Desktop\HobbyHive\server\src

app.use(routes);


app.listen(PORT, () => console.log('Server is running on port 5000'));