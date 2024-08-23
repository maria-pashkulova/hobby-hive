import { useContext } from 'react';
import { Navigate, Outlet, useLocation, useOutletContext, useParams } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';

const ProtectedRouteAdmin = () => {

    const { groupId } = useParams();
    const { groupAdmin } = useOutletContext();
    const { userId } = useContext(AuthContext);
    //if user navigation is not from notification state is null!
    const { state } = useLocation();


    //User comes to event change requests page redirected from notification
    //use group admin data from notification for most up-to-date data about group admin (if group admin has not been changed before opening notifications)
    if (state && state.isGroupAdminFromNotifications) {
        return <Outlet />
    }

    if (userId !== groupAdmin) {
        return <Navigate to={`/groups/${groupId}`} />
    }


    return <Outlet />
}

export default ProtectedRouteAdmin
