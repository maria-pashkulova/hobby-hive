import { useContext } from 'react';
import { Navigate, Outlet, useLocation, useOutletContext, useParams } from 'react-router-dom';
import AuthContext from '../../contexts/authContext';

const ProtectedRouteAdmin = () => {

    const { groupId } = useParams();
    const { groupAdmin } = useOutletContext();
    const { userId } = useContext(AuthContext);
    const { state } = useLocation();


    if (state && state.isGroupAdminFromNotifications) {
        return <Outlet />
    }

    if (userId !== groupAdmin) {
        return <Navigate to={`/groups/${groupId}`} />
    }


    return <Outlet />
}

export default ProtectedRouteAdmin
