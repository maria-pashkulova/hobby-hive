const { Server } = require('socket.io');
const userSockets = new Map(); //used to keep track of all sockets in a room with user Id to handle case in which a user has opened multiple tabs or app in multiple devices


function setupSocketServer(expressServer) {

    //io is the socket.io server
    const io = new Server(expressServer, {
        pingTimeout: 60000,
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        }
    });

    //on is a regular Javascript/node event listener
    //listen for conntect event -> we get socket when there is a connection to the io server
    //listening for sockets to connect
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
                            type: 'message',
                            isMemberFromNotification: true
                        });
                    }

                }
            });

        });

        //Handle Group posts
        socket.on('join group posts', (groupId) => {
            socket.join(`posts-${groupId}`);
        });

        socket.on('leave group posts', (groupId) => {
            socket.leave(`posts-${groupId}`);
        })

        //ON CREATE POST
        socket.on('new group post created', (groupId) => {
            //notify all sockets currently viewing group posts (except the owner of the post) so UI refresh is triggered
            //socket.to(...) excludes the user who created the post by default
            socket.to(`posts-${groupId}`).emit('update group posts');

        })

        //ON DELETE POST
        socket.on('group post deleted', (groupId) => {
            socket.to(`posts-${groupId}`).emit('update group posts');
        })


        // Handle event calendar visits
        socket.on('visit event calendar', (groupId) => {
            socket.join(`events-${groupId}`);
        });

        socket.on('leave event calendar', (groupId) => {
            socket.leave(`events-${groupId}`);
        });

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
                            type: 'event',
                            isMemberFromNotification: true
                        })
                    }
                }
            });

            // Send the new event data to users currently viewing the group event calendar(in which the new event was created by another user)
            //socket.to(...) excludes the user who created the event
            socket.to(`events-${groupInfo._id}`).emit('update event calendar', newEventData);

        });


        //Handle group events change requests 

        socket.on('join requests room', (groupId) => {
            socket.join(`requests-${groupId}`)
        });

        socket.on('leave requests room', (groupId) => {
            socket.leave(`requests-${groupId}`)
        });

        socket.on('new event change request', (newRequestData) => {
            const groupInfo = newRequestData.groupId;
            const groupAdminId = groupInfo.groupAdmin;

            //Notify current group admin if he is logged in
            //Determine conncection status: it identifies if the group admin is connected to the server
            //which ensures that only then he receives notifications

            const groupAdminSockets = userSockets.get(groupAdminId) || [];

            //if current group admin is logged in, send him a notification for newly created request - no matter if he is currently viewing the requests page for events
            //in current group or not
            if (groupAdminSockets.length > 0) {
                socket.to(groupAdminId).emit('new request notification', {
                    notificationTitle: `Нова заявка за промяна в събитие в група: ${groupInfo.name}`,
                    uniqueIdentifier: `request-${newRequestData._id}`, //used only for React unique key
                    fromGroup: groupInfo._id,
                    type: 'request',
                    isGroupAdminFromNotifications: true
                })
            }


            // Send event to trigger UI update if the group admin is currently viewing the group event change requests page
            //In this case the only member who is in room requests-${groupId} is the group admin - other users are not allowed to view this page
            socket.to(`requests-${groupInfo._id}`).emit('new change request');
        })


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

    });

    return io;
}


module.exports = setupSocketServer;
