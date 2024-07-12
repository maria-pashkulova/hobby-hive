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
const userContext = new Map();

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
    // console.log(socket.handshake); -> cookies
    // console.log(socket.id, 'has joined our server');

    //this will take the user data from the FE
    //the FE will send some data and will join a room
    socket.on('setup', (currUserId) => {
        //this will create a room for the current user
        //the room will be exculsive for that particular user only
        socket.join(currUserId);
        console.log(`Socket ${socket.id} logged in or re-opened browser window before token expiration`);

    })

    //this will take the room id from the FE
    //Handle user going on Group chat page
    socket.on('join chat', (groupId) => {

        if (!userContext.has(socket.id)) {
            userContext.set(socket.id, { currentGroup: null });
        }

        const userInfo = userContext.get(socket.id);
        userInfo.currentGroup = groupId;

        //create a room with the id of the group
        //when a user click on Group chat this should create a new room with that particular
        //user and other user as well. When other users join it is going to add them to this room
        socket.join(groupId);
        console.log(`Socket ${socket.id} went to Group chat for group:  ${groupId}`);
    })


    // Handle user leaving a Group chat page
    socket.on('leave group chat', (groupId) => {
        const userInfo = userContext.get(socket.id);
        if (userInfo) {
            userInfo.currentGroup = null;
        }

        socket.leave(groupId);
        console.log(`Socket ${socket.id} left Group chat: ${groupId}`);
    })

    //creates a new socket
    //Send the newly created message to each user in the group
    socket.on('new message', (newMessageReceived) => {
        const groupInfo = newMessageReceived.groupId;

        // Send the new message to users currently viewing the chat
        socket.to(groupInfo._id).emit('message received', newMessageReceived);

        // Notify individual group members which are logged in
        //and are not currently viewing group chat page
        groupInfo.members.forEach((member) => {
            if (member._id !== newMessageReceived.sender._id) {

                //get sockets in room with current members id
                //if current member is not logged in, membersSockets is an empty array
                const memberSockets = Array.from(io.sockets.sockets.values())
                    .filter(s => s.rooms.has(member._id));

                const isMemberViewingChat = memberSockets.some(s => {
                    const userInfo = userContext.get(s.id);

                    //userInfo has a value if user is viewing the chat page
                    // userInfo.currentGroup === groupInfo._id - check if user is viewing the current group's chat or another one
                    return userInfo && userInfo.currentGroup === groupInfo._id;
                });

                if (!isMemberViewingChat) {
                    socket.to(member._id).emit('message notification', `message notification from ${groupInfo.name}`);
                }

            }
        });

    })

    socket.on('disconnect', () => {
        userContext.delete(socket.id);
        console.log(socket.id + ' logged out or closed browser window');
    })

})
