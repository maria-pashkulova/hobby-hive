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
            socket.join(`chat-${groupId}`);

            console.log(`Socket ${socket.id} went to Group chat for group: ${groupId}`);
        })


        // Handle user leaving a Group chat page
        socket.on('leave group chat', (groupId) => {

            socket.currentGroupChat = null;
            socket.leave(`chat-${groupId}`);
            console.log(`Socket ${socket.id} left Group chat: ${groupId}`);
        })

        //Send the newly created message to each user in the group
        socket.on('new message', (newMessageReceived) => {
            const groupInfo = newMessageReceived.groupId;

            // Notify individual group members who are logged in
            //and are not currently viewing group chat page
            groupInfo.members.forEach((member) => {

                //additional check for message sender (for multiple tabs open case)

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
                            notificationAbout: 'Ново съобщение',
                            notificationColor: 'blue.300',
                            fromGroup: groupInfo._id,
                            groupName: groupInfo.name,
                            uniqueIdentifier: `message-${newMessageReceived._id}`, //used only for React unique key 
                            type: 'message',
                            isMemberFromNotification: true
                        });
                    }

                }
            });

            // Send the new message to users currently viewing the chat (except the user who has sent the message)
            //default socket.to() behaviour (room-based event emission)

            socket.to(`chat-${groupInfo._id}`).emit('message received', newMessageReceived);

        });

        //Handle Group posts
        socket.on('join group posts', (groupId) => {
            socket.join(`posts-${groupId}`);
            console.log(`Socket ${socket.id} joined Group posts: ${groupId}`);
        });

        socket.on('leave group posts', (groupId) => {
            socket.leave(`posts-${groupId}`);
            console.log(`Socket ${socket.id} left Group posts: ${groupId}`);
        })

        //ON CREATE POST
        socket.on('new group post created', (groupId) => {
            //notify all sockets currently viewing group posts (except the owner of the post) so UI refresh is triggered
            //socket.to(...) excludes the user who created the post by default (using socket.id for socket which has emmited 'new group post created' event); default socket.to() behaviour (room-based event emission)
            socket.to(`posts-${groupId}`).emit('update group posts');

        })

        //ON DELETE POST
        socket.on('group post deleted', (groupId) => {
            socket.to(`posts-${groupId}`).emit('update group posts');
        })


        // Handle event calendar visits
        socket.on('visit event calendar', (groupId) => {
            socket.join(`events-${groupId}`);
            console.log(`Socket ${socket.id} is viewing calendar for :${groupId}`);

        });

        socket.on('leave event calendar', (groupId) => {
            socket.leave(`events-${groupId}`);
            console.log(`Socket ${socket.id} left calendar for :${groupId}`);

        });

        socket.on('new event', (newEventData) => {
            const groupInfo = newEventData.groupId;

            //Notify individual group members which are logged in
            //for the new event - no matter if they are currently viewing the group event calendar or not (in which the new event was created by another user)
            //exclude the creator of the event - default socket.to() behaviour (room-based event emission) + additional check for event owner (for multiple tabs open case)

            groupInfo.members.forEach((member) => {

                // Skip sending a notification to the user who created the event (for multiple tabs open case)
                if (member._id !== newEventData._ownerId) {

                    socket.to(member._id).emit('new event notification', {
                        notificationAbout: 'Ново събитие',
                        notificationColor: newEventData.color,
                        fromGroup: groupInfo._id,
                        groupName: groupInfo.name,
                        eventName: newEventData.title,
                        eventStart: newEventData.start,
                        uniqueIdentifier: `event-${newEventData._id}`, //used only for React unique key
                        type: 'event',
                        isMemberFromNotification: true,
                        additionalInfo: 'Добавете го към календара си, като заявите присъствие!'
                    })
                }



            });

            // Send the new event data to users currently viewing the group event calendar(in which the new event was created by another user)
            //socket.to(...) excludes the user who created the event, but sends new event if the same user opened other tabs
            socket.to(`events-${groupInfo._id}`).emit('add new event to calendar', newEventData);

        });

        //ON UPDATE EVENT
        socket.on('updated event', (updatedEventData) => {
            const groupInfo = updatedEventData.groupId;

            //Notify individual group members who are logged in (connected to a room)
            //who were marked as going (even if they has left the group / has been removed from group)
            //except group admin / event owner depending on who updated it - default socket.to() behaviour (room-based event emission)
            updatedEventData.membersToNotify.forEach((memberId) => {

                socket.to(memberId).emit('updated event notification', {
                    notificationAbout: `Редактирано събитие, за което сте заявили присъствие`,
                    notificationColor: updatedEventData.color,
                    fromGroup: groupInfo._id,
                    groupName: groupInfo.name,
                    eventName: updatedEventData.title,
                    eventStart: updatedEventData.start,
                    uniqueIdentifier: `event-${updatedEventData._id}-update`,
                    type: 'event',
                    isMemberFromNotification: true,
                    additionalInfo: 'Промените ще бъдат отразени и във Вашия календар!'
                })

            })

            //Update group events for members currently viewing group calendar
            //socket.to(...) excludes the user who updated the event a.k.a group administrator or event owner (room-based event emission)
            socket.to(`events-${groupInfo._id}`).emit('update existing event in calendar', updatedEventData);
        })

        //ON DELETE EVENT
        socket.on('group event deleted', ({ groupId, eventId, eventName, eventColor, eventStart, groupName, groupAdmin, membersToNotify }) => {

            //Notify individual group members who are logged in 
            //who were marked as going (even if they has left the group / has been removed from group)
            //except group admin - default socket.to() behaviour (room-based event emission) + additional check for group admin (for multiple tabs open case)

            membersToNotify.forEach((memberId) => {
                if (memberId !== groupAdmin) {
                    //All attendees are considered group members (used in ProtectedRouteMembers)
                    //Edge case - user has left a group, but is marked as going to a group event

                    socket.to(memberId).emit('deleted event notification', {
                        notificationAbout: 'Премахнато събитие, за което сте заявили присъствие',
                        notificationColor: eventColor,
                        fromGroup: groupId,
                        groupName: groupName,
                        eventName: eventName,
                        eventStart: eventStart,
                        uniqueIdentifier: `event-${eventId}-delete`,
                        type: 'event',
                        isMemberFromNotification: true,
                        additionalInfo: 'Събитието ще бъде изтрито от Вашия календар!'
                    })
                }

            })

            //Update group events for members currently viewing group calendar
            //socket.to(...) excludes the user who deleted the event a.k.a group administrator, but refereshes UI if group admin opened other tabs
            socket.to(`events-${groupId}`).emit('delete event from calendar', eventId);

        })


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
            const eventInfo = newRequestData.eventId;


            socket.to(groupAdminId).emit('new request notification', {
                notificationAbout: 'Нова заявка за промяна на събитие',
                notificationColor: 'green.300',
                fromGroup: groupInfo._id,
                groupName: groupInfo.name,
                eventName: eventInfo.title,
                uniqueIdentifier: `request-${newRequestData._id}`, //used only for React unique key
                type: 'request',
                isGroupAdminFromNotifications: true
            })


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
