import { Navigate, Outlet, useLocation, useOutletContext, useParams } from 'react-router-dom';


const ProtectedRouteMembers = () => {

    const { groupId } = useParams();
    const { isMember, activityTags, groupRegionCity, groupAdmin } = useOutletContext();

    //if user navigation is not from notification state is null!
    const { state } = useLocation()

    //User comes to events or chat page redirected from notification
    //Use isMember from notification for most up-to-date data about group members (if user has not left or has been removed before opening notification)

    if (state && state.isMemberFromNotification) {
        //If user receives notification for event / message he is a member of a group, no need for check
        return <Outlet context={{ isMember: true, activityTags, groupRegionCity, groupAdmin }} />
    }

    //User comes to events or chat page by entering group room
    //Use isMember from Outlet context
    if (!isMember) {
        return <Navigate to={`/groups/${groupId}`} />
    }

    return <Outlet context={{ isMember, activityTags, groupRegionCity, groupAdmin }} />
}

export default ProtectedRouteMembers
