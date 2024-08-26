import { useContext, useEffect, useState } from "react";
import AuthContext from "../contexts/authContext";

export default function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const { socket } = useContext(AuthContext);

    // Receive event(create,update,delete),message or request for event change (group admin only) notification
    useEffect(() => {

        //*hook with state dependencies -> use functional update form of setState() to avoid stale state closure problem!
        const handleNotification = (notification) => {

            setNotifications((prevNotifications) => {

                // Check if the notification is for a message, an event or a request for event update (for group admins only)
                const isMessageNotification = notification.type === 'message';
                const isEventNotification = notification.type === 'event';
                const isRequestNotification = notification.type === 'request';

                if (isMessageNotification) {
                    /* If there is no message notification for a particular group by now, then display the message notification 
                             - update state and trigger UI changes in Header (Bell icon)*/
                    const hasGroupMessageNotification = prevNotifications
                        .some((currNotification) => currNotification.type === 'message' && currNotification.fromGroup === notification.fromGroup);

                    //If not, add the new notification; increment notifications count
                    if (!hasGroupMessageNotification) {
                        setNotificationsCount((prevCount) => prevCount + 1);
                        return [notification, ...prevNotifications];
                    }

                } else if (isEventNotification || isRequestNotification) {
                    setNotificationsCount((prevCount) => prevCount + 1)
                    return [notification, ...prevNotifications];
                }

                //Otherwise, return the previous notifications unchanged - notification type is message and there already is a message notification from the current group
                return prevNotifications;

            });

        };

        socket?.on('message notification', handleNotification);
        socket?.on('new event notification', handleNotification);
        socket?.on('updated event notification', handleNotification);
        socket?.on('deleted event notification', handleNotification);
        socket?.on('new request notification', handleNotification);

        return () => {
            socket?.off('message notification', handleNotification);
            socket?.off('new event notification', handleNotification);
            socket?.off('updated event notification', handleNotification);
            socket?.off('deleted event notification', handleNotification);
            socket?.off('new request notification', handleNotification);

        };
    }, [socket]); //socket changes between the time Header component is rendered for the first time (socket is null -> authContext.js) and the tcp connection is established 


    const handleMarkNotificationAsRead = (notificationToRemoveId) => {

        setNotifications(notifications => notifications.filter(currNotification => currNotification.uniqueIdentifier !== notificationToRemoveId));

    }

    const handleHideNotificationIndicator = () => {
        //Prevent from redundant re-renders when bell ring button is clicked
        if (notificationsCount !== 0) {
            setNotificationsCount(0);
        }
    }


    return {
        notifications,
        notificationsCount,
        handleHideNotificationIndicator,
        handleMarkNotificationAsRead
    }
}