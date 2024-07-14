import { useContext, useEffect, useState } from "react";
import AuthContext from "../contexts/authContext";

export default function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [notificationsCount, setNotificationsCount] = useState(0);
    const { socket } = useContext(AuthContext);

    // Receive message notification
    useEffect(() => {

        //*hook with state dependencies -> use functional update form of setState() to avoid stale state closure problem!
        const handleMessageNotification = (notification) => {

            setNotifications((prevNotifications) => {
                /* If there is no message notification for a particular group by now, then display the message notification 
                           - update state and trigger UI changes in Header (Bell icon)*/
                const hasGroupMessageNotification = prevNotifications
                    .some((currNotification) => currNotification.fromGroup === notification.fromGroup);

                //If not, add the new notification; increment notifications count
                if (!hasGroupMessageNotification) {
                    setNotificationsCount((prevCount) => prevCount + 1)
                    return [notification, ...prevNotifications]
                }

                //Otherwise, return the previous notifications unchanged
                return prevNotifications;

            });

        };

        socket?.on('message notification', handleMessageNotification);

        return () => {
            socket?.off('message notification', handleMessageNotification);
        };
    }, [socket]);


    const handleMarkNotificationAsRead = (notificationToRemoveId) => {

        setNotifications(notifications => notifications.filter(currNotification => currNotification.uniqueIdentifier !== notificationToRemoveId));

    }

    const handleHideNotificationIndicator = () => {
        setNotificationsCount(0);
    }


    return {
        notifications,
        notificationsCount,
        handleHideNotificationIndicator,
        handleMarkNotificationAsRead
    }
}