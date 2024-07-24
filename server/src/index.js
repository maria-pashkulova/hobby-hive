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
const { Server } = require('socket.io');
const userSockets = new Map(); //keep track of all sockets in a room with user Id to handle case in which a user has opened multiple tabs or app in multiple devices

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

        //Attach user id to socket object
        socket.userId = currUserId;

        //this will create a room for the current user
        //the room will be exculsive for that particular user only
        //it is possible multiple sockets to join the room with the user id - multiple tabs/devices
        socket.join(currUserId);

        if (!userSockets.has(currUserId)) {
            userSockets.set(currUserId, []);
        }

        userSockets.get(currUserId).push(socket);

        console.log(`Socket ${socket.id} logged in or re-opened browser window before token expiration`);

    })

    //this will take the room id from the FE (groupId)
    //Handle user going on Group chat page
    socket.on('join chat', (groupId) => {

        //Attach group id of the group chat that this socket is currently viewing
        socket.currentGroupChat = groupId;

        //Create a room with the id of the group
        //when a user click on Group chat this should create a new room with that particular
        //user and other user as well. When other users join it is going to add them to this room
        socket.join(groupId);

        console.log(`Socket ${socket.id} went to Group chat for group:  ${groupId}`);
    })


    // Handle user leaving a Group chat page
    socket.on('leave group chat', (groupId) => {

        socket.currentGroupChat = null;
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
                //AND gets sockets in room with current member's id - only 1 if a user has open 1 tab from 1 device -> array with 1 socket instance
                //and multiple sockets if user has open multiple tabs / app from multiple devices 

                const memberSockets = userSockets.get(member._id) || [];

                //if a user has opened multiple tabs and is viewing the chat in at least one of them, no notification will be sent to any of their tabs
                // memberSockets.length > 0 ensures that a group member is currently logged in
                const isMemberViewingChat = memberSockets.length > 0 ? memberSockets.some(socket => socket.currentGroupChat === groupInfo._id) : true;

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


    socket.on('new event', (newEventData) => {
        const groupInfo = newEventData.groupId;

        //Notify individual group members which are logged in
        //for the new event - no matter if they are currently viewing the group event calendar or not (in which the new event was created by another user)

        groupInfo.members.forEach((member) => {
            // Skip sending a notification to the user who created the event
            if (member._id !== newEventData._ownerId) {

                // Get the list of sockets for the current member or an empty array if the member has no sockets (he is not logged in)
                const memberSockets = userSockets.get(member._id) || [];

                //if current group member is logged in, send him a notification
                if (memberSockets.length > 0) {
                    socket.to(member._id).emit('new event notification', {
                        notificationTitle: `Ново събитие в група: ${groupInfo.name}`,
                        uniqueIdentifier: `event-${newEventData._id}`, //used only for React unique key
                        fromGroup: groupInfo._id,
                        type: 'event'
                    })
                }
            }
        });

        // Send the new event data to users currently viewing the group event calendar(in which the new event was created by another user)
        //socket.to(...) excludes the user who created the event
        socket.to(`events-${groupInfo._id}`).emit('update event calendar', newEventData);

    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            const sockets = userSockets.get(socket.userId) || [];
            userSockets.set(socket.userId, sockets.filter(s => s.id !== socket.id));

            if (userSockets.get(socket.userId).length === 0) {
                userSockets.delete(socket.userId);
            }
        }
        //the socket leaves all the rooms he joined (socket.join()) automatically
        console.log(socket.id + ' logged out or closed browser window');
    })

})
