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

    //this will take the room id from the FE (groupId)
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

    //Send the newly created message to each user in the group
    socket.on('new message', (newMessageReceived) => {
        const groupInfo = newMessageReceived.groupId;

        // Send the new message to users currently viewing the chat (except the user who has sent the message)
        socket.to(groupInfo._id).emit('message received', newMessageReceived);

        // Notify individual group members which are logged in
        //and are not currently viewing group chat page
        groupInfo.members.forEach((member) => {
            if (member._id !== newMessageReceived.sender._id) {

                //Determine conncection status: it identifies if the member is connected to the server
                //by looking for a socket that has joined a room with the member's ID
                //which ensures that only connected members receive notifications
                //AND gets sockets in room with current member's id - only 1 if a user has open 1 tab from 1 device
                //and multiple sockets if user has open multiple tabs / app from multiple devices 

                const memberSockets = Array.from(io.sockets.sockets.values())
                    .filter(s => s.rooms.has(member._id));

                const isMemberViewingChat = memberSockets.some(s => {
                    const userInfo = userContext.get(s.id);

                    //userInfo has a value if user is viewing the chat page
                    // userInfo.currentGroup === groupInfo._id - check if user is viewing the current group's chat or another one
                    return userInfo && userInfo.currentGroup === groupInfo._id;
                });

                if (!isMemberViewingChat) {
                    socket.to(member._id).emit('message notification', {
                        notificationTitle: `Ново съобщение в група: ${groupInfo.name}`,
                        uniqueIdentifier: `message-${newMessageReceived._id}`, //used only for React unique key 
                        fromGroup: groupInfo._id,
                        type: 'message'
                    });
                }

            }
        });

    });

    socket.on('visit event calendar', (groupId) => {
        socket.join(`events-${groupId}`)
    });

    socket.on('leave event calendar', (groupId) => {
        socket.leave(`events-${groupId}`);
    })

    //за всички освен създателя на събитието (този от който идва new message event-a)
    //да изпрати нотификация
    socket.on('new event', (newEventData) => {
        const groupInfo = newEventData.groupId;

        //Notify individual group members which are logged in
        //for the new event - no matter if they are currently viewing the group event calendar or not (in which the new event was created by another user)

        groupInfo.members.forEach((member) => {
            //does not send notification to the user who created the event
            if (member._id !== newEventData._ownerId) {
                socket.to(member._id).emit('new event notification', {
                    notificationTitle: `Ново събитие в група: ${groupInfo.name}`,
                    uniqueIdentifier: `event-${newEventData._id}`, //used only for React unique key
                    fromGroup: groupInfo._id,
                    type: 'event'
                })
            }
        });

        // Send the new event data to users currently viewing the group event calendar(in which the new event was created by another user)
        //EXCEPT the user who has created the event
        socket.to(`events-${groupInfo._id}`).emit('update event calendar', newEventData);

    });

    socket.on('disconnect', () => {
        userContext.delete(socket.id);
        //the socket leaves all the rooms he joined (socket.join()) automatically
        console.log(socket.id + ' logged out or closed browser window');
    })

})
