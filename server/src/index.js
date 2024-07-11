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
//this is the http server - it handles http traffic
const expressServer = app.listen(process.env.PORT, () => console.log('Server is running on port 5000'));

//#Sockets
const { Server } = require('socket.io'); //named export usage

//io is the socket.io server
const io = new Server(expressServer, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:5173',
        credentials: true
    }
});

//on is a regular Javascript/node event listener
//we listen for conntect event -> we get socket when there is a connection to the io server
//we are listening for sockets to connect

//on listens for events, emit() sends events out
io.on('connect', (socket) => {
    // console.log(socket.handshake);
    // console.log(socket.id, 'has joined our server');

    //this will take the user data from the FE
    //the FE will send some data and will join a room
    socket.on('setup', (currUserId) => {
        //this will create a room for the current user
        //the room will be exculsive for that particular user only
        socket.join(currUserId);
        socket.emit('connected')
    })

    //this will take the room id from the FE
    socket.on('join chat', (room) => {
        //create a room with the id of the room
        //when a user click on Group chat this should create a new room with thaht particular
        //user and other user as well. When other users join it is going to add them to this room
        socket.join(room);
        console.log('User Joined Room: ' + room);
    })

    //creates a new socket
    //Send the newly created message to each user in the group
    socket.on('new message', (newMessageReceived) => {
        const groupInfo = newMessageReceived.groupId;

        // //for devs only
        // if (!chat.users) return console.log('chat.users is not defined');

        //send the new message for each user in the current room except for the user
        //who has just sent it
        groupInfo.members.forEach((member) => {
            if (member._id === newMessageReceived.sender._id) return;

            socket.in(member._id).emit('message received', newMessageReceived);

        })

    })

    //emit sends events specifically to the socket that has just connected
    //first argument of emit is the event name - any name is ok, except for : https://socket.io/docs/v4/emit-cheatsheet/
    //second argument - the data we want to send over
    //socket.emit will emit to THIS one socket
    // socket.emit('welcome', [1, 2, 3]); // push an event to the client

    //io.emit will emit to ALL sockes connected to the server
    //any time someone connects we send out a message to everyone
    //socket.id is the id of the socket that just joined
    //Docs: emits an event to all connected clients in the main namespace
    // io.emit('newClient', `${socket.id} just joined`);

    // socket.on('thankYou', data => {
    //     console.log('message from client: ', data);
    // })
})
